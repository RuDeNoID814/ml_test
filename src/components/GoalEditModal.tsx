'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Goal, GoalType, Sex } from '@/db/types';
import { calcTarget } from '@/lib/nutrition';

const GOAL_LABELS: Record<GoalType, { title: string; hint: string }> = {
  hold: { title: 'Удержать', hint: 'сохранить текущий вес' },
  lose: { title: 'Похудеть', hint: 'дефицит калорий по темпу' },
  gain: { title: 'Набрать', hint: 'профицит калорий по темпу' },
  recomp: { title: 'Рекомпозиция', hint: 'жир → мышцы' },
  track: { title: 'Просто трекать', hint: 'без плана' },
};

const GOAL_TYPES: GoalType[] = ['hold', 'lose', 'gain', 'recomp', 'track'];

type Props = {
  currentGoal: Goal;
  currentWeightKg: number;
  sex: Sex;
  tdee: number;
  bmr: number;
  onCancel: () => void;
  onSave: (next: Goal) => Promise<void> | void;
};

export function GoalEditModal({
  currentGoal,
  currentWeightKg,
  sex,
  tdee,
  bmr,
  onCancel,
  onSave,
}: Props) {
  const [type, setType] = useState<GoalType>(currentGoal.type);
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(
    currentGoal.targetWeightKg ?? '',
  );
  const [targetDate, setTargetDate] = useState<string>(
    currentGoal.targetDate ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const preview = useMemo(() => {
    const goal: Goal = {
      type,
      targetWeightKg:
        targetWeightKg === '' ? undefined : Number(targetWeightKg),
      targetDate: targetDate || undefined,
      createdAt: currentGoal.createdAt,
    };
    return {
      goal,
      target: calcTarget({ tdee, bmr, sex, goal, currentWeightKg }),
    };
  }, [
    type,
    targetWeightKg,
    targetDate,
    currentGoal.createdAt,
    tdee,
    bmr,
    sex,
    currentWeightKg,
  ]);

  const canSave = (() => {
    if (type === 'lose' || type === 'gain') {
      return targetWeightKg !== '' && Number(targetWeightKg) > 0;
    }
    return true;
  })();

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(preview.goal);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-label="закрыть"
      />

      <div className="relative w-full max-w-[520px] rounded-[16px] border border-line/60 bg-paper p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-display text-[20px] font-semibold text-ink">
            Твоя цель
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
            редактор
          </span>
        </div>

        <div className="space-y-4">
          {/* Тип */}
          <div className="space-y-2">
            {GOAL_TYPES.map((gt) => {
              const info = GOAL_LABELS[gt];
              const active = type === gt;
              return (
                <button
                  key={gt}
                  type="button"
                  onClick={() => setType(gt)}
                  className={`w-full rounded-[10px] border p-3 text-left transition-all ${
                    active
                      ? 'border-accent bg-accent/10'
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
                  <p className="mt-1 text-[11px] text-ink-3">{info.hint}</p>
                </button>
              );
            })}
          </div>

          {/* Target weight + date (для lose/gain) */}
          {(type === 'lose' || type === 'gain') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
                  Целевой вес · кг
                </p>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) =>
                    setTargetWeightKg(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  placeholder={type === 'lose' ? '78.0' : '88.0'}
                  className="input"
                />
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
                  К дате · опц.
                </p>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="input"
                />
              </div>
            </div>
          )}

          {/* Live preview */}
          <div className="rounded-[10px] border border-line/60 bg-paper-2/50 p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
              дневная норма
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[36px] leading-none text-ink">
                {preview.target.target}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-3">
                ккал / сутки
              </span>
            </div>
            {preview.target.deficitKcal !== 0 && (
              <p className="mt-2 text-[12px] text-ink-3">
                {preview.target.deficitKcal > 0 ? 'дефицит' : 'профицит'}{' '}
                {Math.abs(preview.target.deficitKcal)} ккал от нормы {tdee}
              </p>
            )}
            {preview.target.weeklyPaceKg > 0 && (
              <p className="mt-1 text-[12px] text-ink-3">
                темп: {preview.target.weeklyPaceKg} кг/нед
                {preview.target.isGoalExpired && (
                  <span className="ml-2 text-danger">· дедлайн прошёл</span>
                )}
              </p>
            )}
            <p className="mt-2 text-[11px] text-ink-3">
              безопасный максимум темпа: {preview.target.aggressiveLimitKg} кг/нед
            </p>
          </div>

          {preview.target.isSafeMinBreached && (
            <div className="rounded-[10px] border-2 border-danger bg-danger/10 p-3 text-[12px] leading-snug text-ink-2">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-danger">
                ⚠ ниже безопасного минимума
              </p>
              Норма {preview.target.target} ккал ниже {preview.target.safeMinKcal} ккал
              (max BMR {bmr} и медицинского минимума {preview.target.medicalMinKcal}).
              Максимум темпа — {preview.target.aggressiveLimitKg} кг/нед.
            </div>
          )}

          {preview.target.paceIsAggressive &&
            !preview.target.isSafeMinBreached && (
              <div className="rounded-[10px] border border-danger/60 bg-danger/10 p-3 text-[12px] leading-snug text-ink-2">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-danger">
                  агрессивный темп
                </p>
                Темп выше 1% массы тела/нед. Мышцы могут пострадать.
              </div>
            )}
        </div>

        {error && (
          <p className="mt-4 rounded-[8px] bg-danger/15 px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[14px] font-medium text-ink-3 transition-colors hover:text-ink"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-accent-deep hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
