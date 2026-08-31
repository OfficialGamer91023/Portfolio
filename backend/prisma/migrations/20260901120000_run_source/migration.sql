-- AlterTable
-- Existing rows are the hardcoded initial export, so they take the protected
-- default ('seed') and the daily Strava sync will never overwrite them.
ALTER TABLE "Run" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed';
