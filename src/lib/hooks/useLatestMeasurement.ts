'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BodyMeasurement } from '@/db/types';
import { getRepositories } from '@/lib/repositories';

export function useLatestMeasurement() {
  const [entry, setEntry] = useState<BodyMeasurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getRepositories().bodyMeasurements.latest();
      setEntry(m);
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
