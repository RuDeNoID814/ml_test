import type { ActivityLevel, FoodEntry, WeightEntry } from '@/db/types';
import { ACTIVITY_COEFFICIENTS } from './index';

/*
  TDEE-провайдер — pluggable интерфейс.
  Downstream (calcTarget, /profile, /food) знает только про TDEEResult,
  не про источник — свапаем провайдер через параметр calcNutrition,
  не через изменение module-level экспортов.

  v0.6: formulaicTDEEProvider (BMR × activityCoef).
  v0.9: adaptiveTDEEProvider будет полноценно считать back-calculation
        из food_log + weight_trend за 14+ дней. Сейчас — fallback на formulaic
        с меткой confidence='accumulating', чтобы никогда не throw.
*/

export type TDEESource = 'formulaic' | 'adaptive';
export type TDEEConfidence = 'accumulating' | 'ready';

export type TDEEResult = {
  value: number;
  source: TDEESource;
  confidence: TDEEConfidence;
  daysOfData?: number;
};

export type TDEEProviderInput = {
  bmr: number;
  activityLevel: ActivityLevel;
  weightHistory?: WeightEntry[];
  foodLog?: FoodEntry[];
};

export type TDEEProvider = (input: TDEEProviderInput) => TDEEResult;

/**
 * v0.6+ — TDEE = BMR × activity coefficient. Всегда 'ready'.
 */
export const formulaicTDEEProvider: TDEEProvider = ({ bmr, activityLevel }) => ({
  value: Math.round(bmr * ACTIVITY_COEFFICIENTS[activityLevel]),
  source: 'formulaic',
  confidence: 'ready',
});

/**
 * v0.9+ — TDEE через back-calculation из food_log + weight_trend.
 * Сейчас: fallback на formulaic с confidence='accumulating', чтобы swap-in
 * в calcNutrition не крашил downstream пока данных недостаточно.
 * Полная реализация — в v0.9 когда появится /food.
 */
export const adaptiveTDEEProvider: TDEEProvider = (input) => {
  const base = formulaicTDEEProvider(input);
  return {
    ...base,
    source: 'adaptive',
    confidence: 'accumulating',
    daysOfData: input.foodLog?.length ?? 0,
  };
};
