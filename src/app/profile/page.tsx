'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageGate } from '@/components/PageGate';
import { InnerNav } from '@/components/InnerNav';
import { EditFieldModal, type EditField } from '@/components/EditFieldModal';
import { GoalEditModal } from '@/components/GoalEditModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { useLatestWeight } from '@/lib/hooks/useLatestWeight';
import { useLatestMeasurement } from '@/lib/hooks/useLatestMeasurement';
import { ACTIVITY_LABELS, calcAge, calcNutrition, calcTarget } from '@/lib/nutrition';
import type { Goal } from '@/db/types';

type EditTarget = 'nickname' | 'sex' | 'dateOfBirth' | 'heightCm' | 'activityLevel';

export default function ProfilePage() {
  return (
    <PageGate route="/profile">
      <ProfilePageContent />
    </PageGate>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const { profile, loading, updateField, clear } = useProfile();
  const { entry: latestWeight } = useLatestWeight();
  const { entry: latestMeasurement } = useLatestMeasurement();

  const [editing, setEditing] = useState<{ target: EditTarget; field: EditField } | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && !profile) router.replace('/onboarding');
  }, [loading, profile, router]);

  const nutrition = useMemo(() => {
    if (!profile || !latestWeight) return null;
    return calcNutrition({
      sex: profile.sex,
      dateOfBirth: profile.dateOfBirth,
      heightCm: profile.heightCm,
      weightKg: latestWeight.kg,
      activityLevel: profile.activityLevel,
    });
  }, [profile, latestWeight]);

  const target = useMemo(() => {
    if (!profile || !nutrition || !latestWeight) return null;
    return calcTarget({
      tdee: nutrition.tdee.value,
      bmr: nutrition.bmr.value,
      sex: profile.sex,
      goal: profile.goal,
      currentWeightKg: latestWeight.kg,
    });
  }, [profile, nutrition, latestWeight]);

  async function handleSaveField(value: EditField) {
    if (!editing) return;
    if (editing.target === 'nickname' && value.kind === 'text') {
      await updateField({ nickname: value.value });
    } else if (editing.target === 'sex' && value.kind === 'sex') {
      await updateField({ sex: value.value });
    } else if (editing.target === 'dateOfBirth' && value.kind === 'date') {
      await updateField({ dateOfBirth: value.value });
    } else if (editing.target === 'heightCm' && value.kind === 'number') {
      await updateField({ heightCm: value.value });
    } else if (editing.target === 'activityLevel' && value.kind === 'activity') {
      await updateField({ activityLevel: value.value });
    }
    setEditing(null);
  }

  async function handleSaveGoal(next: Goal) {
    await updateField({ goal: next });
    setEditingGoal(false);
  }

  async function handleReset() {
    if (!window.confirm('Удалить профиль и все данные? Это необратимо.')) return;
    setResetting(true);
    await clear();
    router.push('/');
  }

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-ink-3 font-mono text-[12px] tracking-widest uppercase">Загрузка…</p>
      </main>
    );
  }

  const age = calcAge(profile.dateOfBirth);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[880px] flex-col gap-8 px-5 py-8 sm:px-10 sm:py-12">
      <InnerNav />

      <div>
        <p className="eyebrow mb-2">твой профиль</p>
        <h1 className="font-display text-ink text-[32px] leading-tight tracking-tight sm:text-[40px]">
          Привет, <span className="font-display-italic text-accent">{profile.nickname}</span>
        </h1>
      </div>

      {/* Норма и цель */}
      {nutrition && target ? (
        <section className="bg-ink text-paper rounded-[20px] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-paper/60 font-mono text-[10px] tracking-[0.2em] uppercase">
                дневная норма
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-paper text-[56px] leading-none sm:text-[72px]">
                  {target.target}
                </span>
                <span className="text-paper/60 font-mono text-[12px] tracking-widest uppercase">
                  ккал / сутки
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingGoal(true)}
              className="border-paper/30 text-paper hover:bg-paper/10 shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors"
            >
              Изменить цель
            </button>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatChip label="TDEE" value={nutrition.tdee.value} />
            <StatChip label="BMR" value={nutrition.bmr.value} />
            <StatChip
              label="темп"
              value={target.weeklyPaceKg > 0 ? `${target.weeklyPaceKg} кг/нед` : '—'}
            />
          </div>
          {target.isSafeMinBreached && (
            <p className="border-danger/60 bg-danger/15 text-paper mt-4 rounded-[10px] border p-3 text-[12px] leading-snug">
              ⚠ норма ниже безопасного минимума ({target.safeMinKcal} ккал)
            </p>
          )}
        </section>
      ) : (
        <section className="border-line/50 bg-paper-2/50 rounded-[20px] border p-6 text-center">
          <p className="text-ink-2 text-[14px]">
            Нет замера веса — норма посчитается после первого замера.
          </p>
          <Link href="/weight" className="text-accent mt-2 inline-block text-[13px] hover:underline">
            Добавить замер веса →
          </Link>
        </section>
      )}

      {/* Личные данные */}
      <section>
        <p className="eyebrow mb-3">личные данные</p>
        <div className="border-line/50 divide-line/40 bg-paper-2/40 divide-y rounded-[16px] border">
          <FieldRow
            label="Никнейм"
            value={profile.nickname}
            onEdit={() =>
              setEditing({
                target: 'nickname',
                field: { kind: 'text', label: 'Никнейм', value: profile.nickname },
              })
            }
          />
          <FieldRow
            label="Пол"
            value={profile.sex === 'M' ? 'Мужской' : 'Женский'}
            onEdit={() =>
              setEditing({ target: 'sex', field: { kind: 'sex', label: 'Пол', value: profile.sex } })
            }
          />
          <FieldRow
            label="Дата рождения"
            value={`${profile.dateOfBirth} · ${age} лет`}
            onEdit={() =>
              setEditing({
                target: 'dateOfBirth',
                field: {
                  kind: 'date',
                  label: 'Дата рождения',
                  value: profile.dateOfBirth,
                  max: new Date().toISOString().slice(0, 10),
                },
              })
            }
          />
          <FieldRow
            label="Рост"
            value={`${profile.heightCm} см`}
            onEdit={() =>
              setEditing({
                target: 'heightCm',
                field: {
                  kind: 'number',
                  label: 'Рост',
                  value: profile.heightCm,
                  unit: 'см',
                  min: 100,
                  max: 250,
                },
              })
            }
          />
          <FieldRow
            label="Активность"
            value={ACTIVITY_LABELS[profile.activityLevel].title}
            onEdit={() =>
              setEditing({
                target: 'activityLevel',
                field: { kind: 'activity', label: 'Активность', value: profile.activityLevel },
              })
            }
          />
        </div>
      </section>

      {/* Снимки: вес и обхваты */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Вес"
          href="/weight"
          cta="История веса →"
          content={
            latestWeight ? (
              <>
                <span className="font-display text-ink text-[32px] leading-none">
                  {latestWeight.kg}
                </span>
                <span className="text-ink-3 font-mono text-[11px] tracking-widest uppercase">
                  {' '}
                  кг
                </span>
              </>
            ) : (
              <span className="text-ink-3 text-[13px]">нет замеров</span>
            )
          }
        />
        <SummaryCard
          title="Обхваты"
          href="/measurements"
          cta="История обхватов →"
          content={
            latestMeasurement ? (
              <span className="text-ink-2 text-[13px] leading-relaxed">
                {latestMeasurement.waistCm != null && <>талия {latestMeasurement.waistCm} см</>}
                {latestMeasurement.waistCm == null && latestMeasurement.chestCm != null && (
                  <>грудь {latestMeasurement.chestCm} см</>
                )}
              </span>
            ) : (
              <span className="text-ink-3 text-[13px]">нет замеров</span>
            )
          }
        />
      </section>

      <section className="pt-4 pb-10">
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="text-danger text-[13px] font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {resetting ? 'Удаляю…' : 'Начать заново (удалить все данные)'}
        </button>
      </section>

      {editing && (
        <EditFieldModal
          field={editing.field}
          onCancel={() => setEditing(null)}
          onSave={handleSaveField}
        />
      )}

      {editingGoal && nutrition && (
        <GoalEditModal
          currentGoal={profile.goal}
          currentWeightKg={latestWeight?.kg ?? 0}
          sex={profile.sex}
          tdee={nutrition.tdee.value}
          bmr={nutrition.bmr.value}
          onCancel={() => setEditingGoal(false)}
          onSave={handleSaveGoal}
        />
      )}
    </main>
  );
}

function FieldRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-ink-3 font-mono text-[10px] tracking-[0.16em] uppercase">{label}</p>
        <p className="text-ink mt-1 text-[15px] font-medium">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-accent hover:text-accent-deep shrink-0 text-[13px] font-medium transition-colors"
      >
        Изменить
      </button>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-paper/15 rounded-[10px] border p-3">
      <p className="text-paper/50 font-mono text-[9px] tracking-[0.16em] uppercase">{label}</p>
      <p className="font-display text-paper mt-1 text-[18px] leading-none">{value}</p>
    </div>
  );
}

function SummaryCard({
  title,
  href,
  cta,
  content,
}: {
  title: string;
  href: string;
  cta: string;
  content: React.ReactNode;
}) {
  return (
    <div className="border-line/50 bg-paper-2/40 rounded-[16px] border p-5">
      <p className="text-ink-3 font-mono text-[10px] tracking-[0.16em] uppercase">{title}</p>
      <div className="mt-2 min-h-[36px]">{content}</div>
      <Link href={href} className="text-accent mt-3 inline-block text-[13px] hover:underline">
        {cta}
      </Link>
    </div>
  );
}
