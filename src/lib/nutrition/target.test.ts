import { describe, it, expect } from 'vitest';
import { calcTarget, calcWeeklyPaceFromGoal } from './target';
import type { Goal, Sex } from '@/db/types';

function makeGoal(g: Partial<Goal>): Goal {
  return {
    type: 'hold',
    createdAt: '2026-09-13',
    ...g,
  };
}

const NOW = new Date(2026, 8, 13); // 13 сентября 2026 (локально)

describe('calcTarget', () => {
  it('hold → target = TDEE, pace = 0', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({ type: 'hold' }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.target).toBe(2500);
    expect(r.deficitKcal).toBe(0);
    expect(r.weeklyPaceKg).toBe(0);
    expect(r.isSafeMinBreached).toBe(false);
  });

  it('lose 5 кг за 10 недель → pace 0.5 → target 2500 − 550 = 1950', () => {
    const targetDate = new Date(2026, 10, 22); // ~10 недель от 13.09
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 78,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.weeklyPaceKg).toBeCloseTo(0.5, 1);
    expect(r.deficitKcal).toBeCloseTo(550, 0);
    expect(r.target).toBeCloseTo(1950, 0);
    expect(r.isSafeMinBreached).toBe(false);
    expect(r.safeMinKcal).toBe(1800); // max(1800 BMR, 1500 M-мин) = 1800
    expect(r.medicalMinKcal).toBe(1500);
  });

  it('gain 3 кг за 10 недель → pace 0.3 → target 2500 + 330', () => {
    const targetDate = new Date(2026, 10, 22);
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'gain',
        targetWeightKg: 86,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.weeklyPaceKg).toBeCloseTo(0.3, 1);
    expect(r.deficitKcal).toBeCloseTo(-330, 0);
    expect(r.target).toBeCloseTo(2830, 0);
  });

  it('recomp → фиксированный −200 ккал', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({ type: 'recomp' }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.deficitKcal).toBe(200);
    expect(r.target).toBe(2300);
  });

  it('track → target = TDEE (аналогично hold)', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({ type: 'track' }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.target).toBe(2500);
    expect(r.deficitKcal).toBe(0);
  });

  it('safety floor: target < BMR → isSafeMinBreached (М, BMR 1800)', () => {
    // Похудеть 10 кг за 10 недель → 1 кг/нед → deficit 1100 → target 1400
    const targetDate = new Date(2026, 10, 22);
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 73,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.target).toBeLessThan(1800);
    expect(r.isSafeMinBreached).toBe(true);
    expect(r.safeMinKcal).toBe(1800); // BMR выше медицинского 1500
  });

  it('safety floor: медицинский минимум срабатывает если BMR < 1500 (М)', () => {
    // Худой мужчина: BMR 1400. target 1400 не должен пройти — медицинский минимум 1500.
    const targetDate = new Date(2026, 10, 22);
    const r = calcTarget({
      tdee: 2000,
      bmr: 1400,
      sex: 'M',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 60,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 65, // pace ~0.5 → deficit ~550 → target 1450
      now: NOW,
    });
    expect(r.safeMinKcal).toBe(1500);
    expect(r.medicalMinKcal).toBe(1500);
    expect(r.isSafeMinBreached).toBe(true); // target 1450 < safeMin 1500
  });

  it('safety floor: медицинский минимум 1200 для Ж срабатывает', () => {
    // Худая женщина: BMR 1100. Медицинский минимум 1200 срабатывает.
    const targetDate = new Date(2026, 10, 22);
    const r = calcTarget({
      tdee: 1600,
      bmr: 1100,
      sex: 'F',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 47,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 52,
      now: NOW,
    });
    expect(r.safeMinKcal).toBe(1200); // max(1100, 1200) = 1200
    expect(r.medicalMinKcal).toBe(1200);
  });

  it('safety floor НЕ срабатывает для gain даже если target < BMR', () => {
    const targetDate = new Date(2026, 10, 22);
    const r = calcTarget({
      tdee: 100,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'gain',
        targetWeightKg: 85,
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.isSafeMinBreached).toBe(false);
  });

  it('paceIsAggressive: 1% от массы тела — граница', () => {
    // 83 × 1% = 0.83 кг/нед. Pace 1.0 кг/нед → превышение.
    const targetDate = new Date(2026, 9, 18); // ровно 5 недель от 13.09
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 78, // −5 кг за 5 недель = 1 кг/нед
        targetDate: targetDate.toISOString(),
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.weeklyPaceKg).toBeCloseTo(1.0, 1);
    expect(r.paceIsAggressive).toBe(true);
    expect(r.aggressiveLimitKg).toBe(0.83);
  });

  it('aggressiveLimitKg возвращается всегда, не только при превышении', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({ type: 'hold' }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.aggressiveLimitKg).toBe(0.83);
  });

  it('isGoalExpired: дата в прошлом → флаг + pace = 0', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1800,
      sex: 'M',
      goal: makeGoal({
        type: 'lose',
        targetWeightKg: 78,
        targetDate: new Date(2026, 0, 1).toISOString(), // 1 января 2026
      }),
      currentWeightKg: 83,
      now: NOW,
    });
    expect(r.isGoalExpired).toBe(true);
    expect(r.weeklyPaceKg).toBe(0);
  });
});

describe('calcWeeklyPaceFromGoal', () => {
  it('83 → 78 кг за 10 недель = 0.5 кг/нед', () => {
    const target = new Date(2026, 10, 22);
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 83,
      targetWeightKg: 78,
      targetDate: target.toISOString(),
      now: NOW,
    });
    expect(pace).toBeCloseTo(0.5, 1);
  });

  it('без targetWeight → 0', () => {
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 83,
      targetDate: new Date(2026, 10, 22).toISOString(),
      now: NOW,
    });
    expect(pace).toBe(0);
  });

  it('без targetDate → 0', () => {
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 83,
      targetWeightKg: 78,
      now: NOW,
    });
    expect(pace).toBe(0);
  });

  it('дата в прошлом → 0', () => {
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 83,
      targetWeightKg: 78,
      targetDate: new Date(2026, 0, 1).toISOString(),
      now: NOW,
    });
    expect(pace).toBe(0);
  });

  it('набор веса (target > current) → положительный pace', () => {
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 70,
      targetWeightKg: 75,
      targetDate: new Date(2026, 10, 22).toISOString(),
      now: NOW,
    });
    expect(pace).toBeCloseTo(0.5, 1);
  });
});
