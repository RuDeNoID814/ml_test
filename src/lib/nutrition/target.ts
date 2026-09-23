import type { Goal, Sex } from '@/db/types';

/*
  calcTarget — дневная норма ккал по цели.
  Ключевые правила:
    - weeklyPaceKg вычисляется здесь, НЕ хранится в Goal.
    - 1 кг = 7700 ккал (static rule, упрощение; заменится adaptive TDEE в v0.9).
    - Safety floor учитывает медицинский минимум (WHO/Cleveland Clinic):
      1500 ккал М / 1200 ккал Ж. Итоговый floor = max(BMR, medical_min).
    - paceIsAggressive — pace > 1% массы тела/нед.
*/

const KCAL_PER_KG = 7700;

const MEDICAL_MIN_KCAL: Record<Sex, number> = {
  M: 1500,
  F: 1200,
};

export type TargetResult = {
  target: number; // ккал/сутки
  weeklyPaceKg: number; // вычислено из goal + currentWeight
  deficitKcal: number; // 0 для hold/track; отрицательное для gain
  safeMinKcal: number; // max(BMR, medicalMin)
  medicalMinKcal: number; // 1500 М / 1200 Ж
  bmrKcal: number; // reference
  isSafeMinBreached: boolean; // target < safeMinKcal при lose
  paceIsAggressive: boolean; // pace > 1% массы тела/нед
  aggressiveLimitKg: number; // всегда возвращается (не только при превышении)
  isGoalExpired: boolean; // targetDate в прошлом
};

export function calcTarget(input: {
  tdee: number;
  bmr: number;
  sex: Sex;
  goal: Goal;
  currentWeightKg: number;
  now?: Date;
}): TargetResult {
  const { tdee, bmr, sex, goal, currentWeightKg, now } = input;

  const medicalMinKcal = MEDICAL_MIN_KCAL[sex];
  const safeMinKcal = Math.max(bmr, medicalMinKcal);
  const aggressiveLimitKg = Math.round(currentWeightKg * 0.01 * 100) / 100;

  // Проверка expired date — до всех расчётов
  const isGoalExpired = (() => {
    if (!goal.targetDate) return false;
    const d = new Date(goal.targetDate);
    const nowRef = now ?? new Date();
    return d.getTime() < nowRef.getTime();
  })();

  // Вычисляем pace из goal + currentWeight (не читаем из Goal)
  const weeklyPaceKg =
    goal.type === 'lose' || goal.type === 'gain'
      ? calcWeeklyPaceFromGoal({
          currentWeightKg,
          targetWeightKg: goal.targetWeightKg,
          targetDate: goal.targetDate,
          now,
        })
      : 0;

  let target = tdee;
  let deficitKcal = 0;

  switch (goal.type) {
    case 'hold':
    case 'track':
      target = tdee;
      break;
    case 'lose':
      deficitKcal = Math.round((weeklyPaceKg * KCAL_PER_KG) / 7);
      target = tdee - deficitKcal;
      break;
    case 'gain':
      deficitKcal = -Math.round((weeklyPaceKg * KCAL_PER_KG) / 7);
      target = tdee - deficitKcal;
      break;
    case 'recomp':
      deficitKcal = 200;
      target = tdee - deficitKcal;
      break;
  }

  const paceIsAggressive =
    (goal.type === 'lose' || goal.type === 'gain') && weeklyPaceKg > aggressiveLimitKg;

  const isSafeMinBreached = goal.type === 'lose' && target < safeMinKcal;

  return {
    target,
    weeklyPaceKg,
    deficitKcal,
    safeMinKcal,
    medicalMinKcal,
    bmrKcal: bmr,
    isSafeMinBreached,
    paceIsAggressive,
    aggressiveLimitKg,
    isGoalExpired,
  };
}

/**
 * Вычисляет weeklyPaceKg из targetWeight + targetDate + currentWeight.
 * Возвращает 0 если данных недостаточно или дата в прошлом.
 * (`isGoalExpired` в TargetResult даёт различие «нет данных» vs «дата прошла».)
 */
export function calcWeeklyPaceFromGoal(input: {
  currentWeightKg: number;
  targetWeightKg?: number;
  targetDate?: string;
  now?: Date;
}): number {
  const { currentWeightKg, targetWeightKg, targetDate } = input;
  if (targetWeightKg == null || !targetDate) return 0;

  const now = input.now ?? new Date();
  const target = new Date(targetDate);
  const weeksLeft = (target.getTime() - now.getTime()) / (7 * 24 * 3600 * 1000);
  if (weeksLeft <= 0) return 0;

  const kgDelta = Math.abs(currentWeightKg - targetWeightKg);
  return Math.round((kgDelta / weeksLeft) * 100) / 100;
}
