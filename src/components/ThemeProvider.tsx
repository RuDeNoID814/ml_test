'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme';

/** Читает сохранённую тему из localStorage на маунте и применяет её. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
