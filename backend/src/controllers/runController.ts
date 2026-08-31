import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RunResponse } from '../types';
import { syncStravaRuns } from '../services/strava';

const prisma = new PrismaClient();

/**
 * GET /api/runs — every logged run, oldest first, for the training heatmap.
 */
export async function getAllRuns(_req: Request, res: Response): Promise<void> {
  try {
    const runs: RunResponse[] = await prisma.run.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(runs);
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Failed to fetch runs', status: 500 });
  }
}

/**
 * POST /api/runs/sync — pull recent runs from Strava into the DB.
 *
 * Guarded by a shared secret in the `x-sync-secret` header so only the scheduled job
 * (GitHub Actions cron) can trigger it. Seeded rows are never overwritten; see
 * services/strava.ts for the aggregation and write rules.
 */
export async function syncRuns(req: Request, res: Response): Promise<void> {
  const expected = process.env.SYNC_SECRET;
  if (!expected) {
    res.status(500).json({ error: 'Sync is not configured', status: 500 });
    return;
  }
  if (req.header('x-sync-secret') !== expected) {
    res.status(401).json({ error: 'Unauthorized', status: 401 });
    return;
  }

  try {
    const summary = await syncStravaRuns();
    console.log('Strava sync complete:', summary);
    res.json({ ok: true, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Strava sync failed:', message);
    res.status(502).json({ error: `Strava sync failed: ${message}`, status: 502 });
  }
}
