'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAllWeights } from '@/lib/hooks/useAllWeights';
import { calcWeightTrend } from '@/lib/nutrition/weightTrend';
import { getRepositories } from '@/lib/repositories';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EditFieldModal, type EditField } from '@/components/EditFieldModal';
import type { WeightContext, WeightEntry } from '@/db/types';

const CONTEXT_LABELS: Record<WeightContext, { label: string; short: string; isTrend: boolean }> = {
  'morning-fasted': { label: 'Утро натощак', short: 'утро натощак', isTrend: true },
  'morning-post-meal': { label: 'Утро после еды', short: 'утро после еды', isTrend: false },
  daytime: { label: 'День', short: 'день', isTrend: false },
  evening: { label: 'Вечер', short: 'вечер', isTrend: false },
  'post-workout': { label: 'После тренировки', short: 'после тренир.', isTrend: false },
  other: { label: 'Другое', short: 'другое', isTrend: false },
};

type Filter = 'all' | 'trend-only';
type EditingState =
  | { kind: 'edit'; entry: WeightEntry }
  | { kind: 'new' }
  | null;

export default function WeightPage() {
  const router = useRouter();
  const { profile, loading: pLoading } = useProfile();
  const {
    entries,
    loading: wLoading,
    refresh: refreshWeights,
  } = useAllWeights();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<EditingState>(null);

  const loading = pLoading || wLoading;

  // Редирект на онбординг если нет профиля
  if (!loading && !profile) {
    router.replace('/onboarding');
  }

  const trend = useMemo(() => calcWeightTrend(entries), [entries]);

  const filtered = useMemo(() => {
    if (filter === 'trend-only') {
      return entries.filter((e) => e.context === 'morning-fasted');
    }
    return entries;
  }, [entries, filter]);

  // Дефолт для нового замера: последний вес (или 70 если пусто), morning-fasted
  const editField: EditField | null = useMemo(() => {
    if (!editing) return null;
    if (editing.kind === 'edit') {
      return {
        kind: 'weight',
        label: 'Замер веса',
        value: editing.entry.kg,
        context: editing.entry.context,
      };
    }
    // new
    const lastKg = entries[0]?.kg ?? 70;
    return {
      kind: 'weight',
      label: 'Новый замер',
      value: lastKg,
      context: 'morning-fasted',
    };
  }, [editing, entries]);

  async function handleSave(f: EditField) {
    if (!editing || f.kind !== 'weight') return;
    if (editing.kind === 'edit') {
      await getRepositories().weight.update(editing.entry.id, {
        kg: f.value,
        context: f.context,
      });
    } else {
      // new entry
      const entry: WeightEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        kg: f.value,
        context: f.context,
      };
      await getRepositories().weight.add(entry);
    }
    setEditing(null);
    await refreshWeights();
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот замер?')) return;
    await getRepositories().weight.delete(id);
    await refreshWeights();
  }

  const trendMorningFastedCount = entries.filter(
    (e) => e.context === 'morning-fasted',
  ).length;

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        {/* Nav */}
        <header className="mb-6 flex items-center justify-between rounded-full border border-line/60 bg-paper-2/70 px-4 py-2.5 backdrop-blur-md sm:mb-8 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="font-display text-[18px] font-extrabold tracking-tight text-ink transition-opacity hover:opacity-70 sm:text-[20px]"
          >
            Life<span className="text-accent">.</span>Game
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavPill href="/profile" label="Профиль" />
            <NavPill href="/weight" label="Вес" active />
            <NavPill href="/measurements" label="Обхваты" />
            <NavPill label="Еда" disabled />
          </div>

          <ThemeToggle />
        </header>

        {loading && (
          <section className="flex flex-1 items-center justify-center py-32">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink-3">
              загрузка…
            </p>
          </section>
        )}

        {!loading && profile && (
          <>
            {/* Заголовок + тренд */}
            <section className="mb-6">
              <p className="eyebrow mb-3">история веса</p>
              <h1 className="font-display text-ink leading-[0.95] tracking-tight text-[36px] sm:text-[48px] lg:text-[56px]">
                Тренд{' '}
                <span className="font-display-italic text-accent">
                  {trend.source === 'trend'
                    ? trend.value.toFixed(1)
                    : trend.source === 'latest'
                      ? trend.value
                      : '—'}
                </span>{' '}
                <span className="font-mono text-[16px] tracking-widest text-ink-3">
                  кг
                </span>
              </h1>
              <p className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-ink-3 sm:text-[14px]">
                {trend.source === 'trend' && (
                  <>
                    Взвешенное среднее по <strong>{trend.entriesUsed}</strong>{' '}
                    замерам «утро натощак» за 7 дней. Точность — <strong>ready</strong>.
                  </>
                )}
                {trend.source === 'latest' && trend.entriesUsed > 0 && (
                  <>
                    Пока показываю последний «утро натощак» —
                    нужно ещё{' '}
                    <strong>{3 - trend.entriesUsed}</strong> замер(а) для 7-дневного тренда.
                  </>
                )}
                {trend.source === 'latest' && trend.entriesUsed === 0 && (
                  <>
                    Показываю последнюю запись — но она НЕ «утро натощак». Для точного тренда нужны утренние замеры натощак.
                  </>
                )}
                {trend.source === 'none' && (
                  <>Нет записей. Добавь первый замер через профиль.</>
                )}
              </p>
            </section>

            {/* Фильтр + добавить */}
            <section className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FilterPill
                  label={`Все (${entries.length})`}
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                />
                <FilterPill
                  label={`★ Утро натощак (${trendMorningFastedCount})`}
                  active={filter === 'trend-only'}
                  onClick={() => setFilter('trend-only')}
                />
              </div>
              <button
                type="button"
                onClick={() => setEditing({ kind: 'new' })}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-[13px] font-medium text-paper transition-all hover:bg-accent-deep hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)]"
              >
                <span aria-hidden>+</span>
                новый замер
              </button>
            </section>

            {/* Список */}
            <section className="grid grid-cols-1 gap-[1px] overflow-hidden rounded-[16px] border border-line/60 bg-line/60">
              {filtered.length === 0 && (
                <div className="bg-paper-2 p-10 text-center">
                  <p className="text-[14px] text-ink-3">
                    {entries.length === 0
                      ? 'нет замеров — нажми «+ новый замер»'
                      : 'нет записей с фильтром «утро натощак»'}
                  </p>
                </div>
              )}
              {filtered.map((entry) => {
                const info = CONTEXT_LABELS[entry.context];
                return (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-4 bg-paper-2 p-4 transition-colors hover:bg-paper-3 sm:p-5"
                  >
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-[22px] text-ink sm:text-[26px]">
                          {entry.kg}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
                          кг
                        </span>
                        {info.isTrend && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-accent">
                            ★ в тренде
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-ink-3 sm:text-[12px]">
                        {new Date(entry.timestamp).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · <span>{info.short}</span>
                        {entry.notes && (
                          <>
                            {' '}· <em className="text-ink-3">{entry.notes}</em>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditing({ kind: 'edit', entry })}
                        className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-3 transition-colors hover:bg-paper hover:text-ink"
                      >
                        править
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-3 transition-colors hover:bg-danger/20 hover:text-danger"
                      >
                        удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Bottom hint */}
            <p className="mt-6 text-[11px] leading-snug text-ink-3">
              Замер также можно добавить через плитку <strong>Вес</strong> в{' '}
              <Link href="/profile" className="text-accent hover:underline">
                профиле
              </Link>
              . График истории — в v0.7.0.
            </p>

            {/* Footer */}
            <footer className="mt-auto pt-8 sm:pt-10">
              <div className="h-px w-full bg-line/60" />
              <p className="mt-5 font-mono text-[10px] tracking-[0.18em] text-ink-3 sm:text-[11px]">
                {entries.length} замер(ов) · {trendMorningFastedCount} утренних натощак · тренд из последних 7 дней
              </p>
            </footer>
          </>
        )}
      </main>

      {editField && (
        <EditFieldModal
          field={editField}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function NavPill({
  label,
  active,
  disabled,
  href,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
}) {
  const className = `rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px] ${
    active
      ? 'bg-accent text-paper'
      : disabled
        ? 'text-ink-3/50 cursor-not-allowed'
        : 'text-ink-3 hover:bg-paper-3 hover:text-ink-2'
  }`;

  if (href && !disabled) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return <span className={className}>{label}</span>;
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[12px] font-medium transition-all sm:text-[13px] ${
        active
          ? 'border-accent bg-accent/10 text-ink'
          : 'border-line/60 bg-paper-2 text-ink-3 hover:border-ink/40 hover:text-ink-2'
      }`}
    >
      {label}
    </button>
  );
}
