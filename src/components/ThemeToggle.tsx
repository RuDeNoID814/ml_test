'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggle, hydrateFromStorage } = useThemeStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'светлая тема' : 'тёмная тема'}
      title={isDark ? 'светлая тема' : 'тёмная тема'}
      className="border-line/60 bg-paper-2/60 text-ink-2 hover:border-ink/50 hover:text-ink inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all sm:h-9 sm:w-9"
    >
      {isDark ? (
        // sun icon
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // moon icon
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
