import dotenv from 'dotenv';
import { syncStravaRuns } from '../services/strava';

/**
 * Run one Strava sync straight against the DB, no HTTP. Useful for a manual backfill or
 * for testing credentials locally:  npm run sync:strava
 * The scheduled job uses the HTTP endpoint (POST /api/runs/sync) instead.
 */
dotenv.config();

syncStravaRuns()
  .then((summary) => {
    console.log('Strava sync complete:', summary);
    process.exit(0);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Strava sync failed:', message);
    process.exit(1);
  });
