'use client';

import Link from 'next/link';
import { useProfile } from '@/lib/hooks/useProfile';

/*
  CTA на лендинге адаптивная:
  - есть профиль → «Продолжить» на /profile
  - нет → «Начать» на /onboarding
*/

type Props = {
  variant?: 'primary' | 'hero';
};

export function LandingCTA({ variant = 'primary' }: Props) {
  const { profile, loading } = useProfile();
  const hasProfile = !loading && profile !== null;

  const href = hasProfile ? '/profile' : '/onboarding';
  const label = hasProfile ? 'Продолжить' : 'Начать';

  const baseClasses =
    'group inline-flex items-center gap-3 rounded-full font-medium transition-all';

  if (variant === 'hero') {
    return (
      <Link
        href={href}
        className={`${baseClasses} bg-ink px-6 py-3.5 text-[15px] text-paper hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(232,93,47,0.65)]`}
      >
        {label}
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} shrink-0 bg-accent px-7 py-4 text-[16px] text-paper hover:bg-accent-deep hover:shadow-[0_20px_40px_-15px_rgba(232,93,47,0.8)]`}
    >
      {hasProfile ? 'Открыть профиль' : 'Задать параметры'}
      <span aria-hidden className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
