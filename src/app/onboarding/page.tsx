'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OnboardingBlobs } from '@/components/OnboardingBlobs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageGate } from '@/components/PageGate';
import { ComingSoonModal } from '@/components/ComingSoonModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { getRepositories } from '@/lib/repositories';
import type { ProfileDraft } from '@/lib/repositories/interfaces';
import type { ActivityLevel, Goal, GoalType, Sex, WeightEntry } from '@/db/types';
import {
  ACTIVITY_LEVELS,
  ACTIVITY_LABELS,
  ACTIVITY_COEFFICIENTS,
  calcNutrition,
  calcTarget,
} from '@/lib/nutrition';

type Draft = {
  nickname: string;
  sex: Sex | null;
  dateOfBirth: string;
  heightCm: number | '';
  weightKg: number | '';
  activityLevel: ActivityLevel;
  goalType: GoalType | null;
  targetWeightKg: number | '';
  targetDate: string;
};

const initialDraft: Draft = {
  nickname: '',
  sex: null,
  dateOfBirth: '',
  heightCm: '',
  weightKg: '',
  activityLevel: 'medium',
  goalType: null,
  targetWeightKg: '',
  targetDate: '',
};

const stepTitles = ['Основа', 'Тело', 'Цель', 'Готово'];

const GOAL_LABELS: Record<GoalType, { title: string; hint: string }> = {
  hold: { title: 'Удержать', hint: 'сохранить текущий вес' },
  lose: { title: 'Похудеть', hint: 'дефицит калорий по темпу' },
  gain: { title: 'Набрать', hint: 'профицит калорий по темпу' },
  recomp: { title: 'Рекомпозиция', hint: 'жир → мышцы, вес ± мало' },
  track: { title: 'Просто трекать', hint: 'без плана, только логи' },
};

const GOAL_TYPES: GoalType[] = ['hold', 'lose', 'gain', 'recomp', 'track'];

export default function OnboardingPage() {
  return (
    <PageGate route="/onboarding" placeholderContent={<ComingSoonModal label="Онбординг" />}>
      <OnboardingPageContent />
    </PageGate>
  );
}

function OnboardingPageContent() {
  const router = useRouter();
  const { save } = useProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Пред-расчёты (нужны для шагов 2-3)
  const preCalc = useMemo(() => {
    const h = Number(draft.heightCm);
    const w = Number(draft.weightKg);
    if (!draft.sex || !draft.dateOfBirth || !h || !w) return null;
    return calcNutrition({
      sex: draft.sex,
      dateOfBirth: draft.dateOfBirth,
      heightCm: h,
      weightKg: w,
      activityLevel: draft.activityLevel,
    });
  }, [draft]);

  const goalPreview = useMemo(() => {
    if (!preCalc || !draft.goalType || !draft.sex) return null;
    const w = Number(draft.weightKg);
    const goal: Goal = {
      type: draft.goalType,
      targetWeightKg: draft.targetWeightKg === '' ? undefined : Number(draft.targetWeightKg),
      targetDate: draft.targetDate || undefined,
      createdAt: new Date().toISOString(),
    };
    return {
      goal,
      target: calcTarget({
        tdee: preCalc.tdee.value,
        bmr: preCalc.bmr.value,
        sex: draft.sex,
        goal,
        currentWeightKg: w,
      }),
    };
  }, [preCalc, draft]);

  const canGoNext = useMemo(() => {
    if (step === 0) {
      return (
        draft.nickname.trim().length >= 2 && draft.sex !== null && draft.dateOfBirth.length > 0
      );
    }
    if (step === 1) {
      const h = Number(draft.heightCm);
      const w = Number(draft.weightKg);
      return h >= 100 && h <= 250 && w >= 30 && w <= 300;
    }
    if (step === 2) {
      if (!draft.goalType) return false;
      if (draft.goalType === 'recomp') return true;
      if (draft.goalType === 'lose' || draft.goalType === 'gain') {
        const tw = Number(draft.targetWeightKg);
        const cw = Number(draft.weightKg);
        if (tw <= 0 || !cw) return false;
        // Валидация: lose требует target < current, gain — target > current
        if (draft.goalType === 'lose' && tw >= cw) return false;
        if (draft.goalType === 'gain' && tw <= cw) return false;
        return true;
      }
      return true;
    }
    return true;
  }, [step, draft]);

  async function handleFinish() {
    setSaving(true);
    setError(null);
    try {
      if (!draft.sex) throw new Error('пол не задан');
      if (!draft.goalType) throw new Error('цель не задана');

      const goal: Goal = {
        type: draft.goalType,
        targetWeightKg: draft.targetWeightKg === '' ? undefined : Number(draft.targetWeightKg),
        targetDate: draft.targetDate || undefined,
        createdAt: new Date().toISOString(),
      };

      const payload: ProfileDraft = {
        nickname: draft.nickname.trim(),
        sex: draft.sex,
        dateOfBirth: draft.dateOfBirth,
        heightCm: Number(draft.heightCm),
        activityLevel: draft.activityLevel,
        goal,
      };
      await save(payload);

      // Первый замер веса → morning-fasted (эталон для тренда)
      const firstWeight: WeightEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        kg: Number(draft.weightKg),
        context: 'morning-fasted',
        notes: 'стартовый замер при регистрации',
      };
      await getRepositories().weight.add(firstWeight);
      router.push('/profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  }

  return (
    <>
      <OnboardingBlobs />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[720px] flex-col items-center px-5 py-10 sm:py-16">
        <div className="mb-8 flex w-full items-center justify-between">
          <Link
            href="/"
            className="font-display text-ink text-[18px] font-extrabold tracking-tight transition-opacity hover:opacity-70 sm:text-[20px]"
          >
            Life<span className="text-accent">.</span>Game
          </Link>
          <div className="flex items-center gap-3">
            <span className="eyebrow hidden sm:inline">знакомство</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="border-line/40 bg-paper/95 relative w-full rounded-[20px] border p-6 shadow-[0_50px_100px_-40px_rgba(31,24,21,0.35)] backdrop-blur-md sm:p-10">
          {/* Stepper */}
          <div className="mb-8 flex items-center justify-center gap-2 sm:mb-10 sm:gap-3">
            {stepTitles.map((title, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={title} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold transition-all sm:h-9 sm:w-9 sm:text-[13px] ${
                        active
                          ? 'border-accent bg-accent text-paper shadow-[0_8px_24px_-8px_rgba(232,93,47,0.6)]'
                          : done
                            ? 'border-accent bg-accent/15 text-accent-deep'
                            : 'border-line/60 bg-paper text-ink-3'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={`hidden font-mono text-[10px] tracking-[0.14em] uppercase sm:block ${
                        active ? 'text-ink' : 'text-ink-3'
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {i < stepTitles.length - 1 && (
                    <span className={`h-px w-6 sm:w-10 ${done ? 'bg-accent' : 'bg-line/60'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Заголовок шага */}
          <h1 className="font-display text-ink text-[28px] leading-tight tracking-tight sm:text-[36px]">
            {step === 0 && (
              <>
                Кто ты <span className="font-display-italic text-accent">?</span>
              </>
            )}
            {step === 1 && (
              <>
                Твоё <span className="font-display-italic text-accent">тело</span>
              </>
            )}
            {step === 2 && (
              <>
                Твоя <span className="font-display-italic text-accent">цель</span>
              </>
            )}
            {step === 3 && (
              <>
                Твоя <span className="font-display-italic text-accent">норма</span>
              </>
            )}
          </h1>
          <p className="text-ink-3 mt-2 text-[13px] leading-relaxed sm:text-[14px]">
            {step === 0 && 'Никнейм, пол, дата рождения. Всё останется у тебя в браузере.'}
            {step === 1 && 'Рост, вес, уровень активности. По этому посчитаем дневную норму.'}
            {step === 2 &&
              'Что ты хочешь от этого приложения. Цель определит твою целевую норму калорий.'}
            {step === 3 && 'Итоговая дневная норма для твоей цели. Проверь и сохрани.'}
          </p>

          <div className="mt-8 space-y-5 sm:mt-10">
            {/* STEP 0: Основа */}
            {step === 0 && (
              <>
                <Field label="Никнейм" hint="как тебя называть">
                  <input
                    type="text"
                    value={draft.nickname}
                    onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}
                    placeholder="например, Максим"
                    maxLength={30}
                    className="input"
                    autoFocus
                  />
                </Field>
                <Field label="Пол" hint="влияет на формулу BMR">
                  <div className="grid grid-cols-2 gap-3">
                    {(['M', 'F'] as Sex[]).map((s) => {
                      const active = draft.sex === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraft({ ...draft, sex: s })}
                          className={`rounded-[10px] border px-4 py-3 text-[14px] font-medium transition-all ${
                            active
                              ? 'border-accent bg-accent/10 text-ink shadow-[0_8px_24px_-12px_rgba(232,93,47,0.5)]'
                              : 'border-line/60 bg-paper text-ink-2 hover:border-ink/40'
                          }`}
                        >
                          {s === 'M' ? 'Мужской' : 'Женский'}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Дата рождения" hint="для возраста и BMR">
                  <input
                    type="date"
                    value={draft.dateOfBirth}
                    onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().slice(0, 10)}
                    className="input"
                  />
                </Field>
              </>
            )}

            {/* STEP 1: Тело */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Рост" hint="см">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={draft.heightCm}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          heightCm: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder="185"
                      min={100}
                      max={250}
                      className="input"
                      autoFocus
                    />
                  </Field>
                  <Field label="Вес" hint="кг · 0.1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={draft.weightKg}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          weightKg: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder="83.0"
                      min={30}
                      max={300}
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Уровень активности" hint="грубая оценка">
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((lvl) => {
                      const info = ACTIVITY_LABELS[lvl];
                      const active = draft.activityLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDraft({ ...draft, activityLevel: lvl })}
                          className={`w-full rounded-[10px] border p-3 text-left transition-all ${
                            active
                              ? 'border-accent bg-accent/10 shadow-[0_8px_24px_-12px_rgba(232,93,47,0.5)]'
                              : 'border-line/60 bg-paper hover:border-ink/40'
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span
                              className={`font-display text-[15px] font-semibold ${
                                active ? 'text-ink' : 'text-ink-2'
                              }`}
                            >
                              {info.title}
                            </span>
                            <span className="text-ink-3 font-mono text-[10px] tracking-widest">
                              × {ACTIVITY_COEFFICIENTS[lvl]}
                            </span>
                          </div>
                          <p className="text-ink-3 mt-1 text-[11px]">{info.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {/* STEP 2: Цель */}
            {step === 2 && (
              <>
                <Field label="Тип цели" hint="что ты хочешь">
                  <div className="space-y-2">
                    {GOAL_TYPES.map((gt) => {
                      const info = GOAL_LABELS[gt];
                      const active = draft.goalType === gt;
                      return (
                        <button
                          key={gt}
                          type="button"
                          onClick={() => setDraft({ ...draft, goalType: gt })}
                          className={`w-full rounded-[10px] border p-3 text-left transition-all ${
                            active
                              ? 'border-accent bg-accent/10 shadow-[0_8px_24px_-12px_rgba(232,93,47,0.5)]'
                              : 'border-line/60 bg-paper hover:border-ink/40'
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span
                              className={`font-display text-[15px] font-semibold ${
                                active ? 'text-ink' : 'text-ink-2'
                              }`}
                            >
                              {info.title}
                            </span>
                          </div>
                          <p className="text-ink-3 mt-1 text-[11px]">{info.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {(draft.goalType === 'lose' || draft.goalType === 'gain') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Целевой вес" hint="кг">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          value={draft.targetWeightKg}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              targetWeightKg: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          placeholder={draft.goalType === 'lose' ? '78.0' : '88.0'}
                          className="input"
                        />
                      </Field>
                      <Field label="К дате" hint="опц.">
                        <input
                          type="date"
                          value={draft.targetDate}
                          onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                          min={new Date().toISOString().slice(0, 10)}
                          className="input"
                        />
                      </Field>
                    </div>
                    {/* Валидация target vs current */}
                    {draft.targetWeightKg !== '' &&
                      draft.weightKg !== '' &&
                      (() => {
                        const tw = Number(draft.targetWeightKg);
                        const cw = Number(draft.weightKg);
                        if (draft.goalType === 'lose' && tw >= cw) {
                          return (
                            <div className="border-danger/60 bg-danger/10 text-danger rounded-[10px] border p-3 text-[12px] leading-snug">
                              Для похудения целевой вес должен быть меньше текущего ({cw} кг).
                            </div>
                          );
                        }
                        if (draft.goalType === 'gain' && tw <= cw) {
                          return (
                            <div className="border-danger/60 bg-danger/10 text-danger rounded-[10px] border p-3 text-[12px] leading-snug">
                              Для набора целевой вес должен быть больше текущего ({cw} кг).
                            </div>
                          );
                        }
                        return null;
                      })()}

                    {goalPreview && goalPreview.target.weeklyPaceKg > 0 && (
                      <div className="border-line/60 bg-paper-2/50 text-ink-2 rounded-[10px] border p-3 text-[13px] leading-snug">
                        Темп: <strong>{goalPreview.target.weeklyPaceKg} кг/неделю</strong>
                        {goalPreview.target.paceIsAggressive && (
                          <span className="bg-danger/15 text-danger ml-2 rounded-[6px] px-2 py-0.5 font-mono text-[11px] tracking-widest uppercase">
                            выше {goalPreview.target.aggressiveLimitKg} кг/нед
                          </span>
                        )}
                      </div>
                    )}

                    {/* Подсказка про дедлайн */}
                    {draft.targetWeightKg !== '' &&
                      !draft.targetDate &&
                      (() => {
                        const tw = Number(draft.targetWeightKg);
                        const cw = Number(draft.weightKg);
                        const validForGoal =
                          (draft.goalType === 'lose' && tw < cw) ||
                          (draft.goalType === 'gain' && tw > cw);
                        return validForGoal ? (
                          <div className="border-line/60 bg-paper-2/40 text-ink-3 rounded-[10px] border p-3 text-[12px] leading-snug">
                            Укажи дедлайн, чтобы посчитать темп и дневной дефицит. Без даты
                            сохранится цель без плана — на профиле норма = TDEE.
                          </div>
                        ) : null;
                      })()}
                  </>
                )}

                {draft.goalType === 'recomp' && (
                  <div className="border-line/60 bg-paper-2/50 text-ink-2 rounded-[10px] border p-3 text-[13px] leading-snug">
                    Рекомпозиция — фиксированный дефицит <strong>−200 ккал</strong> от нормы. Вес
                    меняется медленно, состав тела улучшается.
                  </div>
                )}
              </>
            )}

            {/* STEP 3: Готово с превью */}
            {step === 3 && preCalc && goalPreview && (
              <div className="space-y-4">
                <div className="bg-ink text-paper rounded-[14px] p-6 sm:p-8">
                  <p className="text-paper/60 font-mono text-[10px] tracking-[0.2em] uppercase">
                    твоя дневная норма
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-display text-paper text-[64px] leading-none sm:text-[80px]">
                      {goalPreview.target.target}
                    </span>
                    <span className="text-paper/60 font-mono text-[13px] tracking-widest uppercase">
                      ккал / сутки
                    </span>
                  </div>
                  {goalPreview.target.deficitKcal !== 0 && (
                    <p className="text-paper/70 mt-3 text-[13px]">
                      Для цели «{GOAL_LABELS[draft.goalType!].title.toLowerCase()}»:{' '}
                      {goalPreview.target.deficitKcal > 0 ? '−' : '+'}
                      {Math.abs(goalPreview.target.deficitKcal)} ккал от нормы ({preCalc.tdee.value}
                      ).
                    </p>
                  )}
                </div>

                {goalPreview.target.isSafeMinBreached && (
                  <div className="border-danger bg-danger/10 text-ink-2 rounded-[10px] border-2 p-4 text-[13px] leading-snug">
                    <p className="text-danger mb-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                      ⚠ ниже безопасного минимума
                    </p>
                    Твоя дневная норма ({goalPreview.target.target} ккал) ниже безопасного минимума
                    ({goalPreview.target.safeMinKcal} ккал — максимум из BMR{' '}
                    {goalPreview.target.bmrKcal} и медицинского минимума{' '}
                    {goalPreview.target.medicalMinKcal} ккал/сут для{' '}
                    {draft.sex === 'M' ? 'мужчин' : 'женщин'}). Приведёт к потере мышц и замедлению
                    метаболизма. Максимум темпа —{' '}
                    <strong>{goalPreview.target.aggressiveLimitKg} кг/нед</strong>. Сохранить всё
                    равно можно, но подумай.
                  </div>
                )}

                {goalPreview.target.paceIsAggressive && !goalPreview.target.isSafeMinBreached && (
                  <div className="border-danger/60 bg-danger/10 text-ink-2 rounded-[10px] border p-4 text-[13px] leading-snug">
                    <p className="text-danger mb-1 font-mono text-[10px] tracking-[0.2em] uppercase">
                      внимание: агрессивный темп
                    </p>
                    {goalPreview.target.weeklyPaceKg} кг/нед — это выше рекомендуемого 1% массы тела
                    ({goalPreview.target.aggressiveLimitKg} кг/нед). Мышцы могут пострадать.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="border-line/50 bg-paper-2/60 rounded-[12px] border p-4">
                    <p className="text-ink-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                      норма (TDEE)
                    </p>
                    <p className="font-display text-ink mt-2 text-[24px] leading-none">
                      {preCalc.tdee.value}
                    </p>
                    <p className="text-ink-3 mt-1 text-[10px]">{preCalc.tdee.source}</p>
                  </div>
                  <div className="border-line/50 bg-paper-2/60 rounded-[12px] border p-4">
                    <p className="text-ink-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                      BMR
                    </p>
                    <p className="font-display text-ink mt-2 text-[24px] leading-none">
                      {preCalc.bmr.value}
                    </p>
                    <p className="text-ink-3 mt-1 text-[10px]">
                      {preCalc.bmr.source === 'katch-mcardle' ? 'Katch-McArdle' : 'Mifflin-St Jeor'}
                    </p>
                  </div>
                </div>

                <div className="border-line/50 bg-paper-2/40 text-ink-2 rounded-[12px] border p-4 text-[13px] leading-relaxed">
                  <strong>{draft.nickname.trim()}</strong>
                  {' · '}
                  {draft.sex === 'M' ? 'М' : 'Ж'}
                  {' · '}
                  {preCalc.ageYears} лет
                  {' · '}
                  {draft.heightCm} см · {draft.weightKg} кг ·{' '}
                  {ACTIVITY_LABELS[draft.activityLevel].title.toLowerCase()}
                </div>

                {error && (
                  <p className="bg-danger/15 text-danger rounded-[8px] px-3 py-2 text-[13px]">
                    Ошибка: {error}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-ink-3 hover:text-ink disabled:hover:text-ink-3 text-[14px] font-medium transition-colors disabled:opacity-30"
            >
              ← Назад
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={!canGoNext}
                className="group bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-3 rounded-full px-6 py-3 text-[15px] font-medium transition-all hover:shadow-[0_16px_32px_-14px_rgba(232,93,47,0.7)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Далее
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="group bg-ink text-paper hover:bg-accent inline-flex items-center gap-3 rounded-full px-6 py-3 text-[15px] font-medium transition-all hover:shadow-[0_16px_32px_-14px_rgba(232,93,47,0.7)] disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? 'Сохраняю…' : 'Сохранить и войти'}
                {!saving && (
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-ink-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase">
          {label}
        </span>
        {hint && <span className="text-ink-3 font-mono text-[10px]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
