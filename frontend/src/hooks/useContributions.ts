import { useEffect, useState } from 'react';
import type { Contribution } from '../types';
import { API_BASE } from '../config';

async function fetchContributions(): Promise<Contribution[]> {
  const res = await fetch(`${API_BASE}/contributions`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json() as Promise<Contribution[]>;
}

interface UseContributionsReturn {
  contributions: Contribution[];
  loading: boolean;
  error: string | null;
}

export function useContributions(): UseContributionsReturn {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchContributions()
      .then(setContributions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { contributions, loading, error };
}
