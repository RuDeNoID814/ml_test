'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAllMeasurements } from '@/lib/hooks/useAllMeasurements';
import { useAllWeights } from '@/lib/hooks/useAllWeights';
import { getRepositories } from '@/lib/repositories';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BodyMeasurementModal } from '@/components/BodyMeasurementModal';
import { calcBFPercentFromNavy, calcLBM } from '@/lib/nutrition/bodyComposition';
import type { BodyMeasurement, Sex, WeightEntry } from '@/db/types';

type EditingState = { kind: 'edit'; entry: BodyMeasurement } | { kind: 'new' } | null;

const FIELD_LABELS: Record<string, string> = {
  neckCm: 'шея',
  chestCm: 'грудь',
  waistCm: 'талия',
  hipCm: 'попа',
  bicepCm: 'бицепс',
  thighCm: 'бедро',
  calfCm: 'икра',
};

const DISPLAY_ORDER = [
  'neckCm',
  'chestCm',
  'waistCm',
  'hipCm',
  'bicepCm',
  'thighCm',
  'calfCm',
] as const;

export default function MeasurementsPage() {
  const router = useRouter();
  const { profile, loading: pLoading } = useProfile();
  const { entries, loading: mLoading, refresh } = useAllMeasurements();
  const { entries: weights, loading: wLoading } = useAllWeights();
  const [editing, setEditing] = useState<EditingState>(null);

  const loading = pLoading || mLoading || wLoading;

  if (!loading && !profile) {
    router.replace('/onboarding');
  }

  const latest = entries[0] ?? null;
  const latestWeight = useMemo(() => pickLatestWeight(weights), [weights]);

  const bfPercent = useMemo(() => {
    if (!profile || !latest) return null;
    return calcBFPercentFromNavy({
      sex: profile.sex,
      waistCm: latest.waistCm,
      neckCm: latest.neckCm,
      hipCm: latest.hipCm,
      heightCm: profile.heightCm,
    });
  }, [profile, latest]);

  async function handleSave(patch: Partial<BodyMeasurement>) {
    if (!editing) return;
    if (editing.kind === 'edit') {
      await getRepositories().bodyMeasurements.update(editing.entry.id, patch);
    } else {
      const entry: BodyMeasurement = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...patch,
      };
      await getRepositories().bodyMeasurements.add(entry);
    }
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот замер?')) return;
    await getRepositories().bodyMeasurements.delete(id);
    await refresh();
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <header className="border-line/60 bg-paper-2/70 mb-6 flex items-center justify-between rounded-full border px-4 py-2.5 backdrop-blur-md sm:mb-8 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="font-display text-ink text-[18px] font-extrabold tracking-tight transition-opacity hover:opacity-70 sm:text-[20px]"
          >
            Life<span className="text-accent">.</span>Game
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavPill href="/profile" label="Профиль" />
            <NavPill href="/weight" label="Вес" />
            <NavPill href="/measurements" label="Обхваты" active />
            <NavPill label="Еда" disabled />
          </div>

          <ThemeToggle />
        </header>

        {loading && (
          <section className="flex flex-1 items-center justify-center py-32">
            <p className="text-ink-3 font-mono text-[12px] tracking-[0.2em] uppercase">загрузка…</p>
          </section>
        )}

        {!loading && profile && (
          <>
            <section className="mb-6">
              <p className="eyebrow mb-3">обхваты тела</p>
              <h1 className="font-display text-ink text-[36px] leading-[0.95] tracking-tight sm:text-[48px] lg:text-[56px]">
                Замеры <span className="font-display-italic text-accent">рулеткой</span>
              </h1>
              <p className="text-ink-3 mt-3 max-w-[56ch] text-[13px] leading-relaxed sm:text-[14px]">
                Из талии + шеи (+ бёдер для Ж) считается <strong>процент жира</strong> по формуле US
                Navy, а из состава тела — точный BMR. Регулярные замеры показывают динамику
                композиции: где уходит жир, где растут мышцы.
              </p>
            </section>

            {latest && (
              <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
                <LatestCard latest={latest} />
                <BFCard bfPercent={bfPercent} weightKg={latestWeight?.kg} sex={profile.sex} />
              </section>
            )}

            <section className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-ink-3 font-mono text-[11px] tracking-widest uppercase">
                история ({entries.length})
              </p>
              <button
                type="button"
                onClick={() => setEditing({ kind: 'new' })}
                className="group bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-all hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)]"
              >
                <span aria-hidden>+</span>
                новый замер
              </button>
            </section>

            <section className="border-line/60 bg-line/60 grid grid-cols-1 gap-[1px] overflow-hidden rounded-[16px] border">
              {entries.length === 0 && (
                <div className="bg-paper-2 p-10 text-center">
                  <p className="text-ink-3 text-[14px]">нет замеров — нажми «+ новый замер»</p>
                </div>
              )}
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group bg-paper-2 hover:bg-paper-3 flex items-start gap-4 p-4 transition-colors sm:p-5"
                >
                  <div className="flex-1">
                    <p className="text-ink-3 text-[11px] sm:text-[12px]">
                      {new Date(entry.timestamp).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {DISPLAY_ORDER.map((key) => {
                        const val = entry[key];
                        if (typeof val !== 'number') return null;
                        return (
                          <div key={key} className="flex items-baseline gap-1">
                            <span className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">
                              {FIELD_LABELS[key]}
                            </span>
                            <span className="font-display text-ink text-[16px] sm:text-[17px]">
                              {val}
                            </span>
                            <span className="text-ink-3 font-mono text-[9px] tracking-widest">
                              см
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: 'edit', entry })}
                      className="text-ink-3 hover:bg-paper hover:text-ink rounded-full px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors"
                    >
                      править
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-ink-3 hover:bg-danger/20 hover:text-danger rounded-full px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors"
                    >
                      удалить
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <p className="text-ink-3 mt-6 text-[11px] leading-snug">
              Мерь при возможности в одинаковых условиях (утро, натощак) — контекст важнее точности
              абсолютных значений. График динамики — в v0.8.0.
            </p>

            <footer className="mt-auto pt-8 sm:pt-10">
              <div className="bg-line/60 h-px w-full" />
              <p className="text-ink-3 mt-5 font-mono text-[10px] tracking-[0.18em] sm:text-[11px]">
                {entries.length} замер(ов) · Navy formula → BF% → Katch-McArdle BMR
              </p>
            </footer>
          </>
        )}
      </main>

      {editing && (
        <BodyMeasurementModal
          initial={editing.kind === 'edit' ? editing.entry : null}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function pickLatestWeight(weights: WeightEntry[]): WeightEntry | null {
  const mf = weights.find((e) => e.context === 'morning-fasted');
  return mf ?? weights[0] ?? null;
}

function LatestCard({ latest }: { latest: BodyMeasurement }) {
  const items = DISPLAY_ORDER.filter((k) => typeof latest[k] === 'number');
  return (
    <div className="border-line/60 bg-paper-2 rounded-[16px] border p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="eyebrow">последний замер</p>
        <p className="text-ink-3 font-mono text-[10px] tracking-widest">
          {new Date(latest.timestamp).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((key) => {
          const val = latest[key] as number;
          return (
            <div key={key}>
              <p className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">
                {FIELD_LABELS[key]}
              </p>
              <p className="font-display text-ink mt-0.5 text-[22px] sm:text-[24px]">
                {val}
                <span className="text-ink-3 ml-1 font-mono text-[10px] tracking-widest">см</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BFCard({
  bfPercent,
  weightKg,
  sex,
}: {
  bfPercent: number | null;
  weightKg?: number;
  sex: Sex;
}) {
  const lbm = bfPercent != null && weightKg ? calcLBM(weightKg, bfPercent) : null;
  const fatKg =
    bfPercent != null && weightKg && lbm != null ? Math.round((weightKg - lbm) * 10) / 10 : null;

  return (
    <div className="border-line/60 bg-paper-2 rounded-[16px] border p-5 sm:p-6">
      <p className="eyebrow mb-4">состав тела (Navy formula)</p>
      {bfPercent == null ? (
        <p className="text-ink-3 text-[13px] leading-relaxed">
          Для расчёта нужны <strong>шея, талия{sex === 'F' ? ', бёдра' : ''}</strong> и рост из
          профиля.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-ink text-[36px] sm:text-[42px]">
              {bfPercent.toFixed(1)}
              <span className="text-ink-3 text-[18px]">%</span>
            </span>
            <span className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">жира</span>
          </div>
          {lbm != null && fatKg != null && (
            <div className="border-line/40 grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <p className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">
                  сухая масса
                </p>
                <p className="font-display text-ink mt-0.5 text-[18px]">
                  {lbm}
                  <span className="text-ink-3 ml-1 font-mono text-[10px] tracking-widest">кг</span>
                </p>
              </div>
              <div>
                <p className="text-ink-3 font-mono text-[10px] tracking-widest uppercase">жир</p>
                <p className="font-display text-ink mt-0.5 text-[18px]">
                  {fatKg}
                  <span className="text-ink-3 ml-1 font-mono text-[10px] tracking-widest">кг</span>
                </p>
              </div>
            </div>
          )}
          {weightKg == null && (
            <p className="text-ink-3 text-[11px]">
              Для расчёта массы жира и LBM нужен свежий замер веса.
            </p>
          )}
        </div>
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
