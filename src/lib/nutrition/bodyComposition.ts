import type { BioimpedanceSnapshot, BodyMeasurement, Sex } from '@/db/types';

/*
  BF% (процент жира тела) — цепочка fallback.
  Приоритет: биоимпеданс (прямой замер) > обхваты (Navy formula) > null.
  Позволяет переключать источник BF% без переписывания downstream.
*/

export type BFSource = 'bioimpedance' | 'navy' | null;

export type BFResult = {
  value: number; // 0..100
  source: Exclude<BFSource, null>;
};

/**
 * US Navy formula → BF% из обхватов.
 * Требует: талия, шея, рост в см. Для Ж — также бёдра.
 * Возвращает null если данных недостаточно.
 */
export function calcBFPercentFromNavy(input: {
  sex: Sex;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  heightCm: number;
}): number | null {
  const { sex, waistCm, neckCm, hipCm, heightCm } = input;
  if (!waistCm || !neckCm || !heightCm) return null;
  if (sex === 'F' && !hipCm) return null;

  // Классическая Navy формула, log10 — константы откалиброваны под ДЮЙМЫ,
  // поэтому все замеры (приходят в см) переводим в дюймы перед расчётом.
  // М: BF% = 495 / (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450
  // Ж: BF% = 495 / (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450
  const CM_TO_IN = 1 / 2.54;
  const waistIn = waistCm * CM_TO_IN;
  const neckIn = neckCm * CM_TO_IN;
  const heightIn = heightCm * CM_TO_IN;
  const hipIn = hipCm != null ? hipCm * CM_TO_IN : undefined;

  const log10 = Math.log10;
  let bf: number;

  if (sex === 'M') {
    const denom = 1.0324 - 0.19077 * log10(waistIn - neckIn) + 0.15456 * log10(heightIn);
    bf = 495 / denom - 450;
  } else {
    const denom = 1.29579 - 0.35004 * log10(waistIn + hipIn! - neckIn) + 0.221 * log10(heightIn);
    bf = 495 / denom - 450;
  }

  if (!Number.isFinite(bf) || bf < 3 || bf > 60) return null;
  return Math.round(bf * 10) / 10;
}

/**
 * Выбирает BF% из доступных источников по приоритету.
 * Возвращает null если ни один источник не даёт число.
 */
export function getBFPercent(sources: {
  bioimpedance?: BioimpedanceSnapshot | null;
  circumferences?: BodyMeasurement | null;
  profile: { sex: Sex; heightCm: number };
}): BFResult | null {
  // 1. Биоимпеданс — прямой замер
  if (sources.bioimpedance?.fatPercent != null) {
    return { value: sources.bioimpedance.fatPercent, source: 'bioimpedance' };
  }

  // 2. Navy formula по обхватам
  if (sources.circumferences) {
    const bf = calcBFPercentFromNavy({
      sex: sources.profile.sex,
      waistCm: sources.circumferences.waistCm,
      neckCm: sources.circumferences.neckCm,
      hipCm: sources.circumferences.hipCm,
      heightCm: sources.profile.heightCm,
    });
    if (bf !== null) return { value: bf, source: 'navy' };
  }

  return null;
}

/**
 * Lean Body Mass = сухая масса тела в кг.
 */
export function calcLBM(weightKg: number, bfPercent: number): number {
  return Math.round(weightKg * (1 - bfPercent / 100) * 10) / 10;
}
