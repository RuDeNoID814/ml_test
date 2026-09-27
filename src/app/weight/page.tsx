'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageGate } from '@/components/PageGate';
import { InnerNav } from '@/components/InnerNav';
import { EditFieldModal, type EditField } from '@/components/EditFieldModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAllWeights } from '@/lib/hooks/useAllWeights';
import { getRepositories } from '@/lib/repositories';
import { calcWeightTrend } from '@/lib/nutrition';
import type { WeightContext, WeightEntry } from '@/db/types';

const CONTEXT_LABELS: Record<WeightContext, string> = {
  'morning-fasted': 'Утро натощак',
  'morning-post-meal': 'Утро после еды',
  daytime: 'День',
  evening: 'Вечер',
  'post-workout': 'После тренировки',
  other: 'Другое',
};

export default function WeightPage() {
  return (
    <PageGate route="/weight">
      <WeightPageContent />
    </PageGate>
  );
}

function WeightPageContent() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { entries, loading, refresh } = useAllWeights();

  const [editing, setEditing] = useState<{ id: string | null; field: EditField } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileLoading && !profile) router.replace('/onboarding');
  }, [profileLoading, profile, router]);

  const trend = useMemo(() => calcWeightTrend(entries), [entries]);

  function openAdd() {
    setEditing({
      id: null,
      field: {
        kind: 'weight',
        label: 'Новый замер',
        value: entries[0]?.kg ?? 70,
        context: 'morning-fasted',
      },
    });
  }

  function openEdit(entry: WeightEntry) {
    setEditing({
      id: entry.id,
      field: { kind: 'weight', label: 'Правка замера', value: entry.kg, context: entry.context },
    });
  }

  async function handleSave(value: EditField) {
    if (!editing || value.kind !== 'weight') return;
    if (editing.id) {
      await getRepositories().weight.update(editing.id, {
        kg: value.value,
        context: value.context,
      });
    } else {
      await getRepositories().weight.add({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        kg: value.value,
        context: value.context,
      });
    }
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Удалить этот замер?')) return;
    setBusyId(id);
    await getRepositories().weight.delete(id);
    await refresh();
    setBusyId(null);
  }

  if (profileLoading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-3 font-mono text-[12px] tracking-widest uppercase">Загрузка…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col gap-8 px-5 py-8 sm:px-10 sm:py-12">
      <InnerNav />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">история замеров</p>
          <h1 className="font-display text-ink text-[32px] leading-tight tracking-tight sm:text-[40px]">
            Твой <span className="font-display-italic text-accent">вес</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all"
        >
          + Добавить замер
        </button>
      </div>

      {trend.source !== 'none' && (
        <section className="border-line/50 bg-paper-2/40 flex items-center justify-between rounded-[16px] border p-5">
          <div>
            <p className="text-ink-3 font-mono text-[10px] tracking-[0.16em] uppercase">
              трендовый вес
            </p>
            <p className="font-display text-ink mt-1 text-[28px] leading-none">
              {trend.value} <span className="text-ink-3 text-[13px]">кг</span>
            </p>
          </div>
          <span className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">
            {trend.confidence === 'ready' ? `по ${trend.entriesUsed} замерам` : 'копим данные'}
          </span>
        </section>
      )}

      <section>
        {loading ? (
          <p className="text-ink-3 text-[13px]">Загрузка…</p>
        ) : entries.length === 0 ? (
          <p className="text-ink-3 border-line/50 bg-paper-2/40 rounded-[16px] border p-6 text-center text-[13px]">
            Замеров пока нет. Добавь первый.
          </p>
        ) : (
          <div className="border-line/50 divide-line/40 bg-paper-2/40 divide-y rounded-[16px] border">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-ink text-[15px] font-medium">
                    {e.kg} кг
                    {e.context === 'morning-fasted' && <span className="text-accent"> ★</span>}
                  </p>
                  <p className="text-ink-3 mt-0.5 text-[12px]">
                    {new Date(e.timestamp).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {CONTEXT_LABELS[e.context]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(e)}
                    className="text-accent hover:text-accent-deep text-[13px] font-medium transition-colors"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    disabled={busyId === e.id}
                    className="text-danger text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <EditFieldModal
          field={editing.field}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
