'use client';

import { useState } from 'react';
import { ComingSoonModal } from '@/components/ComingSoonModal';

/*
  Регистрации/аккаунтов пока нет (local-first, см. ADR 0004) — обе кнопки
  временно открывают заглушку вместо реальной навигации.
*/

type Props = {
  variant?: 'primary' | 'hero';
};

export function LandingCTA({ variant = 'primary' }: Props) {
  const [open, setOpen] = useState(false);
  const label = variant === 'hero' ? 'Начать' : 'Задать параметры';

  const baseClasses =
    'group inline-flex items-center gap-3 rounded-full font-medium transition-all';

  const className =
    variant === 'hero'
      ? `${baseClasses} bg-ink text-paper hover:bg-accent px-6 py-3.5 text-[15px] hover:shadow-[0_20px_40px_-20px_rgba(232,93,47,0.65)] sm:px-5 sm:py-3 sm:text-[14px] lg:px-6 lg:py-3.5 lg:text-[15px]`
      : `${baseClasses} bg-accent text-paper hover:bg-accent-deep shrink-0 px-7 py-4 text-[16px] hover:shadow-[0_20px_40px_-15px_rgba(232,93,47,0.8)]`;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
      {open && <ComingSoonModal label="Регистрация" onClose={() => setOpen(false)} />}
    </>
  );
}
