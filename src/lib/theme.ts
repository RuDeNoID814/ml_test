import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lifegame:theme';

type ThemeStore = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  hydrateFromStorage: () => void;
};

/** Явный выбор пользователя (кнопка-переключатель) — если его нет, следуем системной теме. */
function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'dark' || v === 'light' ? v : null;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  setTheme: (t) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    set({ theme: t });
  },
  toggle: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },
  hydrateFromStorage: () => {
    const theme = readStoredTheme() ?? getSystemTheme();
    applyTheme(theme);
    set({ theme });
  },
}));
