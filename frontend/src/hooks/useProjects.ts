import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { API_BASE } from '../config';

async function fetchProjects(tag?: string): Promise<Project[]> {
  const url = tag ? `${API_BASE}/projects?tag=${encodeURIComponent(tag)}` : `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json() as Promise<Project[]>;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export function useProjects(tag?: string): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProjects(tag)
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tag]);

  return { projects, loading, error };
}
