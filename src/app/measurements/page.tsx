'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageGate } from '@/components/PageGate';
import { InnerNav } from '@/components/InnerNav';
import { BodyMeasurementModal } from '@/components/BodyMeasurementModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAllMeasurements } from '@/lib/hooks/useAllMeasurements';
import { getRepositories } from '@/lib/repositories';
import type { BodyMeasurement } from '@/db/types';

const FIELD_LABELS: { key: keyof BodyMeasurement; label: string }[] = [
  { key: 'neckCm', label: 'Шея' },
  { key: 'chestCm', label: 'Грудь' },
  { key: 'waistCm', label: 'Талия' },
  { key: 'hipCm', label: 'Бёдра' },
  { key: 'bicepCm', label: 'Бицепс' },
  { key: 'thighCm', label: 'Бедро' },
  { key: 'calfCm', label: 'Икра' },
];

export default function MeasurementsPage() {
  return (
    <PageGate route="/measurements">
      <MeasurementsPageContent />
    </PageGate>
  );
}

function MeasurementsPageContent() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { entries, loading, refresh } = useAllMeasurements();

  const [editing, setEditing] = useState<{ id: string | null; entry: BodyMeasurement | null } | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileLoading && !profile) router.replace('/onboarding');
  }, [profileLoading, profile, router]);

  async function handleSave(values: Partial<BodyMeasurement>) {
    if (!editing) return;
    if (editing.id) {
      await getRepositories().bodyMeasurements.update(editing.id, values);
    } else {
      await getRepositories().bodyMeasurements.add({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...values,
      });
    }
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Удалить этот замер?')) return;
    setBusyId(id);
    await getRepositories().bodyMeasurements.delete(id);
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
            Твои <span className="font-display-italic text-accent">обхваты</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ id: null, entry: null })}
          className="bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all"
        >
          + Добавить замер
        </button>
      </div>

      <section>
        {loading ? (
          <p className="text-ink-3 text-[13px]">Загрузка…</p>
        ) : entries.length === 0 ? (
          <p className="text-ink-3 border-line/50 bg-paper-2/40 rounded-[16px] border p-6 text-center text-[13px]">
            Замеров пока нет. Добавь первый.
          </p>
        ) : (
          <div className="border-line/50 divide-line/40 bg-paper-2/40 divide-y rounded-[16px] border">
            {entries.map((e) => {
              const filled = FIELD_LABELS.filter(({ key }) => e[key] != null);
              return (
                <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-ink-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                      {filled.map(({ key, label }) => (
                        <span key={key}>
                          {label}: <strong className="text-ink">{e[key]}</strong> см
                        </span>
                      ))}
                    </p>
                    <p className="text-ink-3 mt-1 text-[12px]">
                      {new Date(e.timestamp).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing({ id: e.id, entry: e })}
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
              );
            })}
          </div>
        )}
      </section>

      {editing && (
        <BodyMeasurementModal
          initial={editing.entry}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
