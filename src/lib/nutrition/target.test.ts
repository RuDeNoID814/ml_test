import { describe, it, expect } from 'vitest';
import { calcTarget, calcWeeklyPaceFromGoal } from './target';

const NOW = new Date('2026-01-01T00:00:00Z');
const in8Weeks = new Date(NOW.getTime() + 8 * 7 * 24 * 3600 * 1000).toISOString();
const in20Weeks = new Date(NOW.getTime() + 20 * 7 * 24 * 3600 * 1000).toISOString();
const weekAgo = new Date(NOW.getTime() - 7 * 24 * 3600 * 1000).toISOString();

describe('calcWeeklyPaceFromGoal', () => {
  it('|текущий − целевой| / недель_до_даты, округление до 0.01', () => {
    const pace = calcWeeklyPaceFromGoal({
      currentWeightKg: 90,
      targetWeightKg: 80,
      targetDate: in8Weeks,
      now: NOW,
    });
    expect(pace).toBe(1.25);
  });

  it('без targetWeightKg или targetDate — 0', () => {
    expect(calcWeeklyPaceFromGoal({ currentWeightKg: 90, now: NOW })).toBe(0);
    expect(
      calcWeeklyPaceFromGoal({ currentWeightKg: 90, targetWeightKg: 80, now: NOW }),
    ).toBe(0);
  });

  it('дата в прошлом — 0 (не отрицательный темп)', () => {
    expect(
      calcWeeklyPaceFromGoal({
        currentWeightKg: 90,
        targetWeightKg: 80,
        targetDate: weekAgo,
        now: NOW,
      }),
    ).toBe(0);
  });
});

describe('calcTarget', () => {
  it('hold/track — target = tdee, без дефицита', () => {
    const r = calcTarget({
      tdee: 2200,
      bmr: 1500,
      sex: 'F',
      goal: { type: 'hold', createdAt: '' },
      currentWeightKg: 70,
      now: NOW,
    });
    expect(r.target).toBe(2200);
    expect(r.deficitKcal).toBe(0);
    expect(r.weeklyPaceKg).toBe(0);
  });

  it('lose — агрессивный темп и пробитие безопасного минимума калорий одновременно', () => {
    const r = calcTarget({
      tdee: 1800,
      bmr: 1600,
      sex: 'M',
      goal: { type: 'lose', targetWeightKg: 80, targetDate: in8Weeks, createdAt: '' },
      currentWeightKg: 90,
      now: NOW,
    });
    expect(r.weeklyPaceKg).toBe(1.25);
    expect(r.deficitKcal).toBe(1375);
    expect(r.target).toBe(425);
    expect(r.safeMinKcal).toBe(1600); // max(bmr=1600, medicalMin[M]=1500)
    expect(r.isSafeMinBreached).toBe(true);
    expect(r.paceIsAggressive).toBe(true); // 1.25 > 1% от 90кг = 0.9
  });

  it('lose — щадящий темп, ничего не пробито', () => {
    const r = calcTarget({
      tdee: 2200,
      bmr: 1500,
      sex: 'F',
      goal: { type: 'lose', targetWeightKg: 65, targetDate: in20Weeks, createdAt: '' },
      currentWeightKg: 70,
      now: NOW,
    });
    expect(r.weeklyPaceKg).toBe(0.25);
    expect(r.target).toBe(1925);
    expect(r.isSafeMinBreached).toBe(false);
    expect(r.paceIsAggressive).toBe(false);
  });

  it('gain — дефицит отрицательный, target выше tdee', () => {
    const r = calcTarget({
      tdee: 2923,
      bmr: 1886,
      sex: 'M',
      goal: { type: 'gain', targetWeightKg: 75, targetDate: in8Weeks, createdAt: '' },
      currentWeightKg: 70,
      now: NOW,
    });
    expect(r.deficitKcal).toBe(-693);
    expect(r.target).toBe(3616);
    expect(r.target).toBeGreaterThan(r.weeklyPaceKg > 0 ? 2923 : 0);
  });

  it('recomp — фиксированный дефицит 200 ккал', () => {
    const r = calcTarget({
      tdee: 2500,
      bmr: 1600,
      sex: 'M',
      goal: { type: 'recomp', createdAt: '' },
      currentWeightKg: 80,
      now: NOW,
    });
    expect(r.deficitKcal).toBe(200);
    expect(r.target).toBe(2300);
    expect(r.weeklyPaceKg).toBe(0);
  });

  it('targetDate в прошлом — isGoalExpired=true, темп безопасно уходит в 0 (не отрицательный)', () => {
    const r = calcTarget({
      tdee: 2200,
      bmr: 1500,
      sex: 'F',
      goal: { type: 'lose', targetWeightKg: 65, targetDate: weekAgo, createdAt: '' },
      currentWeightKg: 70,
      now: NOW,
    });
    expect(r.isGoalExpired).toBe(true);
    expect(r.weeklyPaceKg).toBe(0);
  });
});
