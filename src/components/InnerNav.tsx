'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

const LINKS = [
  { href: '/profile', label: 'Профиль' },
  { href: '/weight', label: 'Вес' },
  { href: '/measurements', label: 'Обхваты' },
];

export function InnerNav() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
      <Link
        href="/"
        className="font-display text-ink shrink-0 text-[18px] font-extrabold tracking-tight sm:text-[20px]"
      >
        MyLife<span className="text-accent">.</span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-4 sm:text-[14px] ${
                active ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle />
    </header>
  );
}
