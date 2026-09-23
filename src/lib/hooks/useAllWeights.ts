'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WeightEntry } from '@/db/types';
import { getRepositories } from '@/lib/repositories';

/**
 * Читает ВСЕ замеры веса из weight_log, сортированные по timestamp DESC (свежие сверху).
 */
export function useAllWeights() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getRepositories().weight.list();
      // sort desc: newest first
      const sorted = [...all].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setEntries(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entries, loading, error, refresh };
}
