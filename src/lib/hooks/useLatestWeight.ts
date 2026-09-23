'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WeightEntry } from '@/db/types';
import { getRepositories } from '@/lib/repositories';

export function useLatestWeight() {
  const [entry, setEntry] = useState<WeightEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const w = await getRepositories().weight.latest();
      setEntry(w);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entry, loading, error, refresh };
}
