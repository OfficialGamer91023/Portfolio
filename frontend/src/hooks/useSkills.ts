import { useState, useEffect } from 'react';
import type { SkillGroup } from '../types';
import { API_BASE } from '../config';

async function fetchSkills(): Promise<SkillGroup[]> {
  const res = await fetch(`${API_BASE}/skills`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json() as Promise<SkillGroup[]>;
}

interface UseSkillsReturn {
  skills: SkillGroup[];
  loading: boolean;
  error: string | null;
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchSkills()
      .then(setSkills)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { skills, loading, error };
}
