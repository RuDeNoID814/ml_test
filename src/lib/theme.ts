import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lifegame:theme';

type ThemeStore = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  hydrateFromStorage: () => void;
};

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'dark' ? 'dark' : 'light';
}

function persist(theme: Theme) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  setTheme: (t) => {
    persist(t);
    set({ theme: t });
  },
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    persist(next);
    set({ theme: next });
  },
  hydrateFromStorage: () => {
    const t = readStoredTheme();
    persist(t);
    set({ theme: t });
  },
}));
