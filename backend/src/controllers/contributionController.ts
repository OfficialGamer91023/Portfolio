import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ContributionResponse } from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/contributions — the open-source ledger, ordered for display.
 */
export async function getAllContributions(_req: Request, res: Response): Promise<void> {
  try {
    const contributions: ContributionResponse[] = await prisma.openSourceContribution.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions', status: 500 });
  }
}
