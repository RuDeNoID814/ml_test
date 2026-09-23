'use client';

import { useEffect, useState } from 'react';
import type { ActivityLevel, Sex, WeightContext } from '@/db/types';
import {
  ACTIVITY_LABELS,
  ACTIVITY_LEVELS,
  ACTIVITY_COEFFICIENTS,
} from '@/lib/nutrition';

export type EditField =
  | { kind: 'text'; label: string; value: string }
  | { kind: 'sex'; label: string; value: Sex }
  | { kind: 'date'; label: string; value: string; max?: string }
  | {
      kind: 'number';
      label: string;
      value: number;
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
    }
  | { kind: 'activity'; label: string; value: ActivityLevel }
  | {
      kind: 'weight';
      label: string;
      value: number;
      context: WeightContext;
    };

type Props = {
  field: EditField;
  onCancel: () => void;
  onSave: (value: EditField) => Promise<void> | void;
};

export function EditFieldModal({ field, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<EditField>(field);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(field);
  }, [field]);

  // Escape закрывает
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  }

  const canSave = (() => {
    switch (draft.kind) {
      case 'text':
        return draft.value.trim().length >= 2;
      case 'number':
        return draft.value > 0;
      case 'date':
        return draft.value.length > 0;
      case 'weight':
        return draft.value >= 30 && draft.value <= 300;
      default:
        return true;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-label="закрыть"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-[440px] rounded-[16px] border border-line/60 bg-paper p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-display text-[20px] font-semibold text-ink">
            {draft.label}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
            редактор
          </span>
        </div>

        <div className="space-y-4">{renderInput(draft, setDraft)}</div>

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
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-paper transition-all hover:bg-accent-deep hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function renderInput(
  field: EditField,
  set: (f: EditField) => void,
): React.ReactNode {
  switch (field.kind) {
    case 'text':
      return (
        <input
          type="text"
          value={field.value}
          onChange={(e) => set({ ...field, value: e.target.value })}
          className="input"
          autoFocus
          maxLength={30}
        />
      );

    case 'sex':
      return (
        <div className="grid grid-cols-2 gap-3">
          {(['M', 'F'] as Sex[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set({ ...field, value: s })}
              className={`rounded-[10px] border px-4 py-3 text-[14px] font-medium transition-all ${
                field.value === s
                  ? 'border-accent bg-accent/10 text-ink'
                  : 'border-line/60 bg-paper text-ink-2 hover:border-ink/40'
              }`}
            >
              {s === 'M' ? 'Мужской' : 'Женский'}
            </button>
          ))}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          value={field.value}
          onChange={(e) => set({ ...field, value: e.target.value })}
          max={field.max}
          className="input"
          autoFocus
        />
      );

    case 'number':
      return (
        <div className="flex items-baseline gap-3">
          <input
            type="number"
            inputMode="decimal"
            step={field.step ?? 1}
            min={field.min}
            max={field.max}
            value={field.value}
            onChange={(e) =>
              set({ ...field, value: Number(e.target.value) || 0 })
            }
            className="input"
            autoFocus
          />
          {field.unit && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-3">
              {field.unit}
            </span>
          )}
        </div>
      );

    case 'activity':
      return (
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((lvl) => {
            const info = ACTIVITY_LABELS[lvl];
            const active = field.value === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => set({ ...field, value: lvl })}
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
                  <span className="font-mono text-[10px] tracking-widest text-ink-3">
                    × {ACTIVITY_COEFFICIENTS[lvl]}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ink-3">{info.hint}</p>
              </button>
            );
          })}
        </div>
      );

    case 'weight':
      return (
        <>
          <div className="flex items-baseline gap-3">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={30}
              max={300}
              value={field.value}
              onChange={(e) =>
                set({ ...field, value: Number(e.target.value) || 0 })
              }
              className="input"
              autoFocus
            />
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-3">
              кг
            </span>
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
              контекст замера
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['morning-fasted', 'Утро натощак ★'],
                  ['morning-post-meal', 'Утро после еды'],
                  ['daytime', 'День'],
                  ['evening', 'Вечер'],
                  ['post-workout', 'После тренировки'],
                  ['other', 'Другое'],
                ] as [WeightContext, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set({ ...field, context: val })}
                  className={`rounded-[8px] border p-2 text-[13px] transition-all ${
                    field.context === val
                      ? 'border-accent bg-accent/10 text-ink'
                      : 'border-line/60 bg-paper text-ink-2 hover:border-ink/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-snug text-ink-3">
            Замер добавится в историю, старые не теряются. В расчёты нормы
            калорий и график тренда идёт <strong>только «утро натощак»</strong>{' '}
            (★) — остальные для информации.
          </p>
        </>
      );
  }
}
