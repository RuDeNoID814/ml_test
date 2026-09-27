export type PageStatus = 'live' | 'placeholder' | 'hidden';

export interface PageEntry {
  route: string;
  label: string;
  status: PageStatus;
}

// Демо-режим (27.09): онбординг + профиль + вес + обхваты открыты для показа.
export const pages: PageEntry[] = [
  { route: '/', label: 'Главная', status: 'live' },
  { route: '/onboarding', label: 'Онбординг', status: 'live' },
  { route: '/profile', label: 'Профиль', status: 'live' },
  { route: '/weight', label: 'Вес', status: 'live' },
  { route: '/measurements', label: 'Обхваты', status: 'live' },
];

export function getPageEntry(route: string): PageEntry {
  return pages.find((p) => p.route === route) ?? { route, label: route, status: 'hidden' };
}
