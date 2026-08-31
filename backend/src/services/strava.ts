import { PrismaClient } from '@prisma/client';

/**
 * Strava -> Run sync.
 *
 * Every day a scheduler (GitHub Actions cron) hits POST /api/runs/sync, which calls
 * `syncStravaRuns`. The flow is:
 *
 *   1. Exchange the long-lived refresh token for a short-lived access token.
 *   2. Pull the athlete's run activities from a rolling window (default 14 days). The
 *      window — rather than "everything since the last row" — means an edit made on
 *      Strava after the fact, or a day the cron missed, is picked up on the next run.
 *   3. Aggregate the activities per calendar day into the same shape the heatmap reads.
 *   4. Upsert each day, but ONLY over rows the sync owns (source = "strava"). Seeded
 *      rows (source = "seed") are the hardcoded initial data and are left untouched.
 *
 * Required env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
 * Optional env: STRAVA_SYNC_WINDOW_DAYS (default 14).
 */

const prisma = new PrismaClient();

const OAUTH_URL = 'https://www.strava.com/oauth/token';
const ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';
const ACTIVITY_URL = 'https://www.strava.com/api/v3/activities';

export interface SyncSummary {
  window_days: number;
  activities_fetched: number;
  run_activities: number;
  days_touched: number;
  created: number;
  updated: number;
  skipped_seed: number;
}

/** Minimal shape of the Strava summary-activity fields this sync consumes. */
interface StravaActivity {
  id: number;
  type: string;
  sport_type?: string;
  distance: number; // metres
  moving_time: number; // seconds
  total_elevation_gain: number; // metres
  average_speed: number; // m/s
  average_heartrate?: number; // bpm
  start_date_local: string; // ISO, already shifted to the athlete's local tz
}

/** One aggregated calendar day, matching the Run table's columns. */
interface DayAggregate {
  date: string;
  km: number;
  dur: number; // minutes
  pace: number; // min/km
  speed: number; // km/h
  hr: number | null;
  elev: number | null;
  cal: number | null;
  note: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/** Trade the stored refresh token for a fresh access token. */
async function getAccessToken(): Promise<string> {
  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: requireEnv('STRAVA_CLIENT_ID'),
      client_secret: requireEnv('STRAVA_CLIENT_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: requireEnv('STRAVA_REFRESH_TOKEN'),
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Strava token refresh failed (${res.status}): ${detail}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Strava token refresh returned no access_token');
  return json.access_token;
}

/** Pull every activity after `afterEpoch` (unix seconds), following pagination. */
async function fetchActivities(token: string, afterEpoch: number): Promise<StravaActivity[]> {
  const all: StravaActivity[] = [];
  const perPage = 100;
  for (let page = 1; ; page++) {
    const url = `${ACTIVITIES_URL}?after=${afterEpoch}&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Strava activities fetch failed (${res.status}): ${detail}`);
    }
    const batch = (await res.json()) as StravaActivity[];
    all.push(...batch);
    if (batch.length < perPage) break; // last page
  }
  return all;
}

/**
 * Calories live only on the detailed activity, not the summary. Best-effort: on any
 * failure we return null and the day simply has no calorie figure, same as older rows.
 */
async function fetchCalories(token: string, id: number): Promise<number | null> {
  try {
    const res = await fetch(`${ACTIVITY_URL}/${id}?include_all_efforts=false`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { calories?: number };
    return typeof json.calories === 'number' ? Math.round(json.calories) : null;
  } catch {
    return null;
  }
}

function isRun(a: StravaActivity): boolean {
  return a.type === 'Run' || a.sport_type === 'Run';
}

/** yyyy-mm-dd from the athlete-local timestamp (take the date part verbatim). */
function localDate(startDateLocal: string): string {
  return startDateLocal.slice(0, 10);
}

/** Mirror the seed's note style: time of day, plus "· long" for 10km+ days. */
function noteFor(startDateLocal: string, km: number): string {
  const hour = Number(startDateLocal.slice(11, 13));
  const partOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return km >= 10 ? `${partOfDay} run · long` : `${partOfDay} run`;
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/**
 * Collapse many activities into one row per calendar day. Distance, duration, elevation
 * and calories sum; pace and speed are recomputed from the day totals; heart rate is a
 * duration-weighted average across the day's runs.
 */
function aggregateByDay(runs: (StravaActivity & { cal: number | null })[]): DayAggregate[] {
  const byDate = new Map<string, (StravaActivity & { cal: number | null })[]>();
  for (const r of runs) {
    const date = localDate(r.start_date_local);
    const list = byDate.get(date);
    if (list) list.push(r);
    else byDate.set(date, [r]);
  }

  const days: DayAggregate[] = [];
  for (const [date, list] of byDate) {
    const km = list.reduce((s, r) => s + r.distance / 1000, 0);
    const durMin = list.reduce((s, r) => s + r.moving_time / 60, 0);
    if (km <= 0 || durMin <= 0) continue; // guard against zero-distance junk

    const elevValues = list.map((r) => r.total_elevation_gain).filter((v) => v != null);
    const elev = elevValues.length
      ? Math.round(elevValues.reduce((s, v) => s + v, 0))
      : null;

    const hrRuns = list.filter((r) => typeof r.average_heartrate === 'number');
    const hrWeight = hrRuns.reduce((s, r) => s + r.moving_time, 0);
    const hr = hrWeight
      ? Math.round(
          hrRuns.reduce((s, r) => s + (r.average_heartrate as number) * r.moving_time, 0) /
            hrWeight
        )
      : null;

    const calValues = list.map((r) => r.cal).filter((v): v is number => v != null);
    const cal = calValues.length ? calValues.reduce((s, v) => s + v, 0) : null;

    // Earliest start on the day names the note (matches how the day "began").
    const earliest = list.reduce((a, b) =>
      a.start_date_local <= b.start_date_local ? a : b
    );

    days.push({
      date,
      km: round(km, 2),
      dur: round(durMin, 1),
      pace: round(durMin / km, 3), // min per km
      speed: round(km / (durMin / 60), 2), // km per hour
      hr,
      elev,
      cal,
      note: noteFor(earliest.start_date_local, km),
    });
  }
  return days;
}

/**
 * Write aggregated days to the DB. A day is created if new, updated if the sync already
 * owns it, and skipped if it collides with a protected seed row.
 */
async function writeDays(days: DayAggregate[]): Promise<Pick<SyncSummary, 'created' | 'updated' | 'skipped_seed'>> {
  let created = 0;
  let updated = 0;
  let skipped_seed = 0;

  for (const day of days) {
    const existing = await prisma.run.findUnique({ where: { date: day.date } });
    if (existing && existing.source === 'seed') {
      skipped_seed++;
      continue;
    }
    const data = {
      km: day.km,
      pace: day.pace,
      dur: day.dur,
      speed: day.speed,
      hr: day.hr,
      elev: day.elev,
      cal: day.cal,
      note: day.note,
      source: 'strava',
    };
    if (existing) {
      await prisma.run.update({ where: { date: day.date }, data });
      updated++;
    } else {
      await prisma.run.create({ data: { date: day.date, ...data } });
      created++;
    }
  }

  return { created, updated, skipped_seed };
}

/** Run one full sync cycle and return a summary of what changed. */
export async function syncStravaRuns(): Promise<SyncSummary> {
  const windowDays = Number(process.env.STRAVA_SYNC_WINDOW_DAYS || '14');
  const afterEpoch = Math.floor(Date.now() / 1000) - windowDays * 24 * 60 * 60;

  const token = await getAccessToken();
  const activities = await fetchActivities(token, afterEpoch);
  const runs = activities.filter(isRun);

  // Enrich each run with calories (one detail call per run; volume is a handful/day).
  const enriched = await Promise.all(
    runs.map(async (r) => ({ ...r, cal: await fetchCalories(token, r.id) }))
  );

  const days = aggregateByDay(enriched);
  const { created, updated, skipped_seed } = await writeDays(days);

  return {
    window_days: windowDays,
    activities_fetched: activities.length,
    run_activities: runs.length,
    days_touched: days.length,
    created,
    updated,
    skipped_seed,
  };
}
