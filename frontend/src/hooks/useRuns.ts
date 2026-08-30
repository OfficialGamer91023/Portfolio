import { useEffect, useState } from 'react';
import type { Run } from '../types';
import { API_BASE } from '../config';

async function fetchRuns(): Promise<Run[]> {
  const res = await fetch(`${API_BASE}/runs`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json() as Promise<Run[]>;
}

interface UseRunsReturn {
  runs: Run[];
  loading: boolean;
  error: string | null;
}

export function useRuns(): UseRunsReturn {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRuns()
      .then(setRuns)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { runs, loading, error };
}
