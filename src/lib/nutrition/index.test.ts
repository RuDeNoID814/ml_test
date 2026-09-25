import { describe, it, expect } from 'vitest';
import { calcAge, calcNutrition, ACTIVITY_COEFFICIENTS, ACTIVITY_LEVELS } from './index';

describe('calcAge', () => {
  const now = new Date(2026, 0, 1); // 1 января 2026, локальная полночь

  it('день рождения ещё не наступил в этом году — год не засчитан', () => {
    expect(calcAge('2004-06-15', now)).toBe(21);
  });

  it('день рождения ровно сегодня — год засчитан', () => {
    expect(calcAge('2000-01-01', now)).toBe(26);
  });

  it('день рождения завтра — год ещё не засчитан', () => {
    expect(calcAge('2000-01-02', now)).toBe(25);
  });

  it('пустая или некорректная дата — 0, без падения', () => {
    expect(calcAge('', now)).toBe(0);
    expect(calcAge('не-дата', now)).toBe(0);
  });
});

describe('ACTIVITY_COEFFICIENTS / ACTIVITY_LEVELS', () => {
  it('5 уровней активности, коэффициенты совпадают со стандартной таблицей', () => {
    expect(ACTIVITY_LEVELS).toEqual(['sedentary', 'light', 'medium', 'high', 'very_high']);
    expect(ACTIVITY_COEFFICIENTS).toEqual({
      sedentary: 1.2,
      light: 1.375,
      medium: 1.55,
      high: 1.725,
      very_high: 1.9,
    });
  });
});

describe('calcNutrition — сквозной расчёт возраст + BMR + TDEE', () => {
  it('без bfPercent: Mifflin-St Jeor + formulaic TDEE (провайдер по умолчанию)', () => {
    const now = new Date(2026, 0, 1);
    const result = calcNutrition({
      sex: 'M',
      dateOfBirth: '2004-06-15', // 21 год на `now`
      heightCm: 185,
      weightKg: 83,
      activityLevel: 'medium',
      now,
    });
    expect(result.ageYears).toBe(21);
    expect(result.bmr).toEqual({ value: 1886, source: 'mifflin-st-jeor' });
    expect(result.tdee).toEqual({ value: 2923, source: 'formulaic', confidence: 'ready' });
  });

  it('с bfPercent: BMR переключается на Katch-McArdle, TDEE считается от него же', () => {
    const now = new Date(2026, 0, 1);
    const result = calcNutrition({
      sex: 'M',
      dateOfBirth: '2004-06-15',
      heightCm: 185,
      weightKg: 83,
      activityLevel: 'medium',
      bfPercent: 15,
      bfSource: 'bioimpedance',
      now,
    });
    expect(result.bmr.source).toBe('katch-mcardle');
    expect(result.bmr.value).toBe(1895);
    expect(result.tdee.value).toBe(Math.round(1895 * ACTIVITY_COEFFICIENTS.medium));
  });
});
