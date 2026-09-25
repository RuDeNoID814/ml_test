export type PageStatus = 'live' | 'placeholder' | 'hidden';

export interface PageEntry {
  route: string;
  label: string;
  status: PageStatus;
}

// v1.0.0: единственная витринная страница — /onboarding (с заглушкой).
// /profile, /weight, /measurements — hidden осознанно (решение владельца, 24.09).
export const pages: PageEntry[] = [
  { route: '/', label: 'Главная', status: 'live' },
  { route: '/onboarding', label: 'Онбординг', status: 'placeholder' },
  { route: '/profile', label: 'Профиль', status: 'hidden' },
  { route: '/weight', label: 'Вес', status: 'hidden' },
  { route: '/measurements', label: 'Обхваты', status: 'hidden' },
];

export function getPageEntry(route: string): PageEntry {
  return pages.find((p) => p.route === route) ?? { route, label: route, status: 'hidden' };
}
