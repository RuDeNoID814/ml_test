import { describe, it, expect } from 'vitest';
import { calcAge, calcBMR, calcNutrition, ACTIVITY_COEFFICIENTS } from './index';

describe('calcAge — таймзона-независимо', () => {
  // Все тесты используют локальный Date-конструктор для стабильности:
  // new Date(y, m-1, d) — локальная полночь, не UTC.
  it('считает полные годы', () => {
    expect(calcAge('2000-05-25', new Date(2026, 8, 12))).toBe(26);
  });

  it('день рождения ещё не наступил в этом году', () => {
    expect(calcAge('2000-12-25', new Date(2026, 8, 12))).toBe(25);
  });

  it('день рождения сегодня — засчитывается', () => {
    expect(calcAge('2000-09-12', new Date(2026, 8, 12))).toBe(26);
  });

  it('день рождения завтра — ещё не наступил', () => {
    expect(calcAge('2000-09-13', new Date(2026, 8, 12))).toBe(25);
  });

  it('за день до дня рождения (был bug в v0.6.0 — off-by-one)', () => {
    // Пользователь родился 2005-09-13, сегодня 2026-09-12 → 20 лет (не 21)
    expect(calcAge('2005-09-13', new Date(2026, 8, 12))).toBe(20);
  });

  it('пустая дата → 0', () => {
    expect(calcAge('')).toBe(0);
  });

  it('невалидная дата → 0', () => {
    expect(calcAge('not a date')).toBe(0);
  });

  it('невалидный формат → 0', () => {
    expect(calcAge('2005/09/13')).toBe(0);
    expect(calcAge('2005-13-01')).toBeGreaterThan(0); // month overflow → Date roll-over, тест что не crash
  });
});

describe('calcBMR (селектор) — Mifflin по умолчанию', () => {
  it('М, 21, 83 кг, 185 см → 1886 через Mifflin', () => {
    const r = calcBMR({ sex: 'M', weightKg: 83, heightCm: 185, ageYears: 21 });
    expect(r.value).toBe(1886);
    expect(r.source).toBe('mifflin-st-jeor');
  });

  it('Ж, 25, 60 кг, 165 см → 1345 через Mifflin', () => {
    const r = calcBMR({ sex: 'F', weightKg: 60, heightCm: 165, ageYears: 25 });
    expect(r.value).toBe(1345);
  });
});

describe('ACTIVITY_COEFFICIENTS — соответствие docs/formulas.md', () => {
  it('пять уровней с правильными множителями', () => {
    expect(ACTIVITY_COEFFICIENTS).toEqual({
      sedentary: 1.2,
      light: 1.375,
      medium: 1.55,
      high: 1.725,
      very_high: 1.9,
    });
  });
});

describe('calcNutrition — интеграционный', () => {
  it('М, 21, 83 кг, 185 см, средняя активность → BMR 1886, TDEE 2923', () => {
    const result = calcNutrition({
      sex: 'M',
      dateOfBirth: '2005-05-15',
      heightCm: 185,
      weightKg: 83,
      activityLevel: 'medium',
      now: new Date('2026-09-12'),
    });
    expect(result.ageYears).toBe(21);
    expect(result.bmr.value).toBe(1886);
    expect(result.bmr.source).toBe('mifflin-st-jeor');
    expect(result.tdee.value).toBe(Math.round(1886 * 1.55));
    expect(result.tdee.source).toBe('formulaic');
    expect(result.tdee.confidence).toBe('ready');
  });

  it('с BF% 15% → BMR через Katch-McArdle', () => {
    const result = calcNutrition({
      sex: 'M',
      dateOfBirth: '2005-05-15',
      heightCm: 185,
      weightKg: 83,
      activityLevel: 'medium',
      bfPercent: 15,
      bfSource: 'bioimpedance',
      now: new Date('2026-09-12'),
    });
    expect(result.bmr.source).toBe('katch-mcardle');
    expect(result.bmr.bfSource).toBe('bioimpedance');
    // LBM = 83 * 0.85 = 70.55 → 70.6. BMR = 370 + 21.6*70.6 = 1894.96 → 1895
    expect(result.bmr.value).toBe(1895);
  });
});
