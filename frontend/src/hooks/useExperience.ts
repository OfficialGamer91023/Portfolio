import { useState, useEffect } from 'react';
import type { Experience } from '../types';
import { API_BASE } from '../config';

async function fetchExperience(): Promise<Experience[]> {
  const res = await fetch(`${API_BASE}/experience`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json() as Promise<Experience[]>;
}

interface UseExperienceReturn {
  experience: Experience[];
  loading: boolean;
  error: string | null;
}

export function useExperience(): UseExperienceReturn {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchExperience()
      .then(setExperience)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { experience, loading, error };
}
