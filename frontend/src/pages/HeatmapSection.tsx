import { useMemo, useState } from 'react';
import { useRuns } from '../hooks/useRuns';
import { Reveal } from '../components/Reveal';
import type { Run } from '../types';

const WEEKS = 26;
const MS_PER_DAY = 86_400_000;

function isoOf(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${date.getFullYear()}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

function level(km: number): number {
  if (!km) return 0;
  if (km < 5) return 1;
  if (km < 9) return 2;
  if (km < 15) return 3;
  return 4;
}

function cellBackground(lvl: number): string {
  if (lvl === 0) return 'var(--paper-2)';
  const pct = [0, 24, 46, 70, 92][lvl];
  return `color-mix(in srgb, var(--plot) ${pct}%, var(--card))`;
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtPace(p: number): string {
  let m = Math.floor(p);
  let s = Math.round((p - m) * 60);
  if (s === 60) {
    m += 1;
    s = 0;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function HeatmapSection() {
  const { runs, loading } = useRuns();
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => new Map(runs.map((r) => [r.date, r])), [runs]);

  const { cells, totalKm, runCount, latestIso } = useMemo(() => {
    const dates = runs.map((r) => r.date).sort();
    const last = dates.length ? new Date(`${dates[dates.length - 1]}T00:00:00`) : new Date();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = now > last ? now : last;

    const grid: { iso: string; run: Run | null }[] = [];
    let km = 0;
    let count = 0;
    let latest: string | null = null;
    // Column-major: one column per week, top = oldest day in the column.
    for (let w = WEEKS - 1; w >= 0; w--) {
      for (let dy = 0; dy < 7; dy++) {
        const back = w * 7 + (6 - dy);
        const iso = isoOf(new Date(end.getTime() - back * MS_PER_DAY));
        const run = byDate.get(iso) ?? null;
        grid.push({ iso, run });
        if (run) {
          km += run.km;
          count += 1;
          latest = iso;
        }
      }
    }
    return { cells: grid, totalKm: km, runCount: count, latestIso: latest };
  }, [runs, byDate]);

  const activeIso = selected ?? latestIso;
  const activeRun = activeIso ? byDate.get(activeIso) ?? null : null;

  return (
    <section id="log" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-11">
        <span className="section-idx">§ 05</span>
        <Reveal>
          <span className="section-lbl plot">interactive · from Samsung Health</span>
          <h2 className="nb-h2 mt-1.5">Training log</h2>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-content-2">
            Every run, plotted. <b className="text-content">3–4 a week</b>, building toward the next
            marathon. Click any day for the splits.
          </p>
        </Reveal>

        <Reveal className="mt-6" delay={0.05}>
          <div className="overflow-x-auto pb-1">
            <div
              className="w-max"
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 15px)',
                gridAutoFlow: 'column',
                gridAutoColumns: '15px',
                gap: '3px',
              }}
            >
              {loading && runs.length === 0
                ? Array.from({ length: WEEKS * 7 }).map((_, i) => (
                    <div key={i} style={{ background: 'var(--paper-2)', borderRadius: 2 }} aria-hidden="true" />
                  ))
                : cells.map(({ iso, run }) => {
                    const isSel = activeIso === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelected(iso)}
                        title={run ? `${fmtDate(iso)} · ${run.km.toFixed(1)}km` : `${iso} · rest`}
                        aria-label={run ? `${fmtDate(iso)}, ${run.km.toFixed(1)} kilometres` : `${iso}, rest day`}
                        style={{
                          background: cellBackground(run ? level(run.km) : 0),
                          borderRadius: 2,
                          outline: isSel ? '2px solid var(--ink)' : 'none',
                          outlineOffset: 1,
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
            </div>
          </div>
        </Reveal>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-content-3">
          less
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="inline-block h-3 w-3 rounded-[2px]"
              style={{ background: cellBackground(l) }}
            />
          ))}
          more
          {runCount > 0 && (
            <span className="ml-2">
              · {runCount} runs · {Math.round(totalKm)} km / 26 wks
            </span>
          )}
        </div>

        <Reveal className="mt-5" delay={0.05}>
          <div className="nb-card min-h-[72px] p-4">
            {activeRun && activeIso ? (
              <>
                <div className="font-mono text-xs tracking-[0.06em] text-plot">{fmtDate(activeIso)}</div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
                  <Stat value={activeRun.km.toFixed(1)} label="km" />
                  <Stat value={fmtPace(activeRun.pace)} label="/km" />
                  <Stat value={fmtDur(activeRun.dur)} label="moving" />
                  <Stat value={activeRun.speed.toFixed(1)} label="km/h" />
                  {activeRun.hr ? <Stat value={String(activeRun.hr)} label="avg bpm" /> : null}
                  {activeRun.elev && activeRun.elev > 0 ? <Stat value={String(activeRun.elev)} label="m gain" /> : null}
                  {activeRun.cal ? <Stat value={String(activeRun.cal)} label="kcal" /> : null}
                </div>
                {activeRun.note && <div className="mt-2.5 text-[13px] text-content-2">{activeRun.note}</div>}
              </>
            ) : (
              <span className="font-mono text-[13px] text-content-3">
                {selected ? 'Rest day. Even the model needs recovery.' : '▲ pick a day to see the run'}
              </span>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="font-mono">
      <b className="block text-[22px] font-semibold tracking-tight text-content">{value}</b>
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-content-2">{label}</span>
    </div>
  );
}
