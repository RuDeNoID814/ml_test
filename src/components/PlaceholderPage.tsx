import Link from 'next/link';

export function PlaceholderPage({ label }: { label: string }) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-ink-2 text-2xl font-semibold">{label} — в разработке</h1>
      <p className="text-ink-3">Этот раздел ещё не готов. Загляните позже.</p>
      <Link href="/" className="text-accent hover:underline">
        На главную
      </Link>
    </main>
  );
}
