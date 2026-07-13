import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/experience — returns all work experience sorted by order.
 */
export async function getAllExperience(_req: Request, res: Response): Promise<void> {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });

    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience', status: 500 });
  }
}
