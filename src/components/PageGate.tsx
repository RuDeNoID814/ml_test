'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getPageEntry } from '@/lib/pages';
import { PlaceholderPage } from '@/components/PlaceholderPage';

export function PageGate({
  route,
  children,
  placeholderContent,
}: {
  route: string;
  children: ReactNode;
  placeholderContent?: ReactNode;
}) {
  const entry = getPageEntry(route);

  if (entry.status === 'hidden') {
    notFound();
  }

  if (entry.status === 'placeholder') {
    return <>{placeholderContent ?? <PlaceholderPage label={entry.label} />}</>;
  }

  return <>{children}</>;
}
