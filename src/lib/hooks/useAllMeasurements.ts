'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BodyMeasurement } from '@/db/types';
import { getRepositories } from '@/lib/repositories';

/**
 * Все замеры обхватов тела, отсортированы по timestamp DESC (свежие сверху).
 */
export function useAllMeasurements() {
  const [entries, setEntries] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getRepositories().bodyMeasurements.list();
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
