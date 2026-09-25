import type { Sex } from '@/db/types';
import { calcLBM } from './bodyComposition';

/*
  BMR (Basal Metabolic Rate) — базальный обмен, ккал/сутки.
  Два источника:
    - Katch-McArdle: BMR = 370 + 21.6 × LBM_kg  → используется когда есть BF%.
    - Mifflin-St Jeor: 10·вес + 6.25·рост − 5·возраст ± {5 для М, −161 для Ж} → default.
*/

export type BMRSource = 'katch-mcardle' | 'mifflin-st-jeor';

export type BMRResult = {
  value: number;
  source: BMRSource;
  bfSource?: 'bioimpedance' | 'navy';
};

export function calcBMRKatch(lbmKg: number): number {
  return Math.round(370 + 21.6 * lbmKg);
}

export function calcBMRMifflin(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const { sex, weightKg, heightCm, ageYears } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const raw = sex === 'M' ? base + 5 : base - 161;
  return Math.round(raw);
}

/**
 * Селектор BMR: если есть BF% → Katch-McArdle через LBM; иначе — Mifflin.
 */
export function calcBMR(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  bfPercent?: number;
  bfSource?: 'bioimpedance' | 'navy';
}): BMRResult {
  const { sex, weightKg, heightCm, ageYears, bfPercent, bfSource } = input;

  if (bfPercent != null && bfPercent > 0 && bfPercent < 60) {
    const lbm = calcLBM(weightKg, bfPercent);
    return {
      value: calcBMRKatch(lbm),
      source: 'katch-mcardle',
      bfSource,
    };
  }

  return {
    value: calcBMRMifflin({ sex, weightKg, heightCm, ageYears }),
    source: 'mifflin-st-jeor',
  };
}
