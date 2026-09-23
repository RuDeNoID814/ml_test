'use client';

import { useEffect, useState } from 'react';
import type { BodyMeasurement } from '@/db/types';

type Draft = {
  neckCm: string;
  chestCm: string;
  waistCm: string;
  hipCm: string;
  bicepCm: string;
  thighCm: string;
  calfCm: string;
};

const EMPTY_DRAFT: Draft = {
  neckCm: '',
  chestCm: '',
  waistCm: '',
  hipCm: '',
  bicepCm: '',
  thighCm: '',
  calfCm: '',
};

function toDraft(m: BodyMeasurement | null): Draft {
  if (!m) return EMPTY_DRAFT;
  return {
    neckCm: m.neckCm?.toString() ?? '',
    chestCm: m.chestCm?.toString() ?? '',
    waistCm: m.waistCm?.toString() ?? '',
    hipCm: m.hipCm?.toString() ?? '',
    bicepCm: m.bicepCm?.toString() ?? '',
    thighCm: m.thighCm?.toString() ?? '',
    calfCm: m.calfCm?.toString() ?? '',
  };
}

type FieldDef = {
  key: keyof Draft;
  label: string;
  hint: string;
};

const FIELDS: FieldDef[] = [
  { key: 'neckCm', label: 'Шея', hint: 'под кадыком, лента параллельно полу' },
  {
    key: 'chestCm',
    label: 'Грудь',
    hint: 'по самой выступающей точке, руки опущены',
  },
  {
    key: 'waistCm',
    label: 'Талия',
    hint: 'на уровне пупка, выдох, не втягивать',
  },
  { key: 'hipCm', label: 'Попа / бёдра', hint: 'по самой широкой точке ягодиц' },
  {
    key: 'bicepCm',
    label: 'Бицепс',
    hint: 'рука согнута 90°, бицепс напряжён',
  },
  {
    key: 'thighCm',
    label: 'Бедро (нога)',
    hint: 'середина между коленом и пахом',
  },
  { key: 'calfCm', label: 'Икра', hint: 'по самой широкой точке икры' },
];

type Props = {
  initial: BodyMeasurement | null;
  onCancel: () => void;
  onSave: (values: Partial<BodyMeasurement>) => Promise<void> | void;
};

export function BodyMeasurementModal({ initial, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<Draft>(toDraft(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(initial));
  }, [initial]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  function parseField(raw: string): number | undefined {
    if (!raw.trim()) return undefined;
    const n = Number(raw.replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  const parsed: Partial<BodyMeasurement> = {
    neckCm: parseField(draft.neckCm),
    chestCm: parseField(draft.chestCm),
    waistCm: parseField(draft.waistCm),
    hipCm: parseField(draft.hipCm),
    bicepCm: parseField(draft.bicepCm),
    thighCm: parseField(draft.thighCm),
    calfCm: parseField(draft.calfCm),
  };

  const filledCount = Object.values(parsed).filter((v) => v != null).length;
  const canSave = filledCount > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(parsed);
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
            {initial ? 'Правка замера' : 'Новый замер обхватов'}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
            рулетка
          </span>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor={`m-${f.key}`}
                  className="font-mono text-[11px] uppercase tracking-widest text-ink-2"
                >
                  {f.label}
                </label>
                <span className="font-mono text-[10px] tracking-widest text-ink-3">
                  см
                </span>
              </div>
              <input
                id={`m-${f.key}`}
                type="number"
                inputMode="decimal"
                step="0.5"
                min={10}
                max={200}
                placeholder="—"
                value={draft[f.key]}
                onChange={(e) =>
                  setDraft({ ...draft, [f.key]: e.target.value })
                }
                className="input mt-1"
              />
              <p className="mt-1 text-[10.5px] leading-snug text-ink-3">
                {f.hint}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-[8px] bg-danger/15 px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-3">
            заполнено: {filledCount} из {FIELDS.length}
          </p>
          <div className="flex items-center gap-3">
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
    </div>
  );
}
