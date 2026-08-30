import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RunResponse } from '../types';

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
