import type { ActivityLevel, Sex } from '@/db/types';
import { calcBMR, type BMRResult } from './bmr';
import {
  formulaicTDEEProvider,
  type TDEEProvider,
  type TDEEResult,
} from './tdee';

export { calcBFPercentFromNavy, getBFPercent, calcLBM } from './bodyComposition';
export type { BFResult, BFSource } from './bodyComposition';
export { calcBMR, calcBMRKatch, calcBMRMifflin } from './bmr';
export type { BMRResult, BMRSource } from './bmr';
export { calcWeightTrend } from './weightTrend';
export type { WeightTrend } from './weightTrend';
export { formulaicTDEEProvider, adaptiveTDEEProvider } from './tdee';
export type {
  TDEEProvider,
  TDEEProviderInput,
  TDEEResult,
  TDEESource,
  TDEEConfidence,
} from './tdee';
export { calcTarget, calcWeeklyPaceFromGoal } from './target';
export type { TargetResult } from './target';

/*
  Общие константы и утилиты.
*/

export const ACTIVITY_COEFFICIENTS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  medium: 1.55,
  high: 1.725,
  very_high: 1.9,
};

export const ACTIVITY_LABELS: Record<
  ActivityLevel,
  { title: string; hint: string }
> = {
  sedentary: { title: 'Сидячий', hint: 'офис, минимум движения' },
  light: { title: 'Лёгкая', hint: '1–3 тренировки в неделю' },
  medium: { title: 'Средняя', hint: '3–5 тренировок в неделю' },
  high: { title: 'Высокая', hint: '6–7 тренировок в неделю' },
  very_high: { title: 'Очень высокая', hint: 'физическая работа + спорт' },
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'medium',
  'high',
  'very_high',
];

/**
 * Возраст в полных годах на текущий момент.
 * Парсит YYYY-MM-DD как ЛОКАЛЬНУЮ дату (не UTC), чтобы избежать off-by-one
 * у пользователей в западных таймзонах в день рождения.
 */
export function calcAge(dob: string, now: Date = new Date()): number {
  if (!dob) return 0;
  const parts = dob.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const [y, m, d] = parts;
  if (!y || !m || !d) return 0;
  const birth = new Date(y, m - 1, d); // локальная полночь
  if (Number.isNaN(birth.getTime())) return 0;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

/**
 * Полный расчёт BMR + TDEE + возраст из профиля.
 * BMR использует Katch-McArdle если есть bfPercent, иначе Mifflin.
 * TDEE — через переданный provider (default = formulaicTDEEProvider).
 * В v0.9+ вызывающий код передаёт adaptiveTDEEProvider без переписывания downstream.
 */
export function calcNutrition(params: {
  sex: Sex;
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  bfPercent?: number;
  bfSource?: 'bioimpedance' | 'navy';
  tdeeProvider?: TDEEProvider;
  now?: Date;
}): {
  ageYears: number;
  bmr: BMRResult;
  tdee: TDEEResult;
} {
  const ageYears = calcAge(params.dateOfBirth, params.now);
  const bmr = calcBMR({
    sex: params.sex,
    weightKg: params.weightKg,
    heightCm: params.heightCm,
    ageYears,
    bfPercent: params.bfPercent,
    bfSource: params.bfSource,
  });
  const provider = params.tdeeProvider ?? formulaicTDEEProvider;
  const tdee = provider({
    bmr: bmr.value,
    activityLevel: params.activityLevel,
  });
  return { ageYears, bmr, tdee };
}
