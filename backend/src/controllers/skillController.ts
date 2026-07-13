import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SkillGroupResponse } from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/skills — returns skills grouped by category.
 * Transforms flat skill rows into { category, skills[] } groups.
 */
export async function getAllSkills(_req: Request, res: Response): Promise<void> {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { category: 'asc' },
    });

    // Group skills by category into the response shape
    const groupedMap = new Map<string, string[]>();
    for (const skill of skills) {
      const existing = groupedMap.get(skill.category) || [];
      existing.push(skill.name);
      groupedMap.set(skill.category, existing);
    }

    const grouped: SkillGroupResponse[] = Array.from(groupedMap.entries()).map(
      ([category, skillNames]) => ({
        category,
        skills: skillNames,
      })
    );

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills', status: 500 });
  }
}
