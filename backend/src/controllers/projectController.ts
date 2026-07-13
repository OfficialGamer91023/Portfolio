import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectResponse } from '../types';

const prisma = new PrismaClient();

/**
 * GET /api/projects — returns all projects, optionally filtered by tag.
 * Prisma doesn't support array-contains queries natively with case-insensitive
 * matching, so we filter in JavaScript after fetching.
 */
export async function getAllProjects(req: Request, res: Response): Promise<void> {
  try {
    const rawTag = req.query.tag;
    const tag = typeof rawTag === 'string' ? rawTag : undefined;
    let projects: ProjectResponse[] = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    });

    if (tag) {
      const normalizedTag = tag.toLowerCase();
      projects = projects.filter((project) =>
        project.tags.some((t) => t.toLowerCase() === normalizedTag)
      );
    }

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects', status: 500 });
  }
}

/**
 * GET /api/projects/:id — returns a single project by ID.
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = parseInt(typeof rawId === 'string' ? rawId : rawId[0], 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID', status: 400 });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      res.status(404).json({ error: 'Project not found', status: 404 });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project', status: 500 });
  }
}
