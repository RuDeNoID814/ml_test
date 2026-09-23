import { describe, it, expect } from 'vitest';
import { formulaicTDEEProvider, adaptiveTDEEProvider } from './tdee';

describe('formulaicTDEEProvider', () => {
  it('BMR 1800 × medium (1.55) = 2790', () => {
    const r = formulaicTDEEProvider({
      bmr: 1800,
      activityLevel: 'medium',
    });
    expect(r.value).toBe(2790);
    expect(r.source).toBe('formulaic');
    expect(r.confidence).toBe('ready');
  });

  it('BMR 2000 × sedentary (1.2) = 2400', () => {
    const r = formulaicTDEEProvider({
      bmr: 2000,
      activityLevel: 'sedentary',
    });
    expect(r.value).toBe(2400);
  });
});

describe('adaptiveTDEEProvider — fallback на formulaic до v0.9', () => {
  it('без данных: возвращает formulaic-значение с меткой accumulating', () => {
    const r = adaptiveTDEEProvider({
      bmr: 1800,
      activityLevel: 'medium',
    });
    // Совпадает с formulaic value, но source/confidence отражают adaptive-режим
    expect(r.value).toBe(2790);
    expect(r.source).toBe('adaptive');
    expect(r.confidence).toBe('accumulating');
    expect(r.daysOfData).toBe(0);
  });

  it('daysOfData отражает длину foodLog', () => {
    const r = adaptiveTDEEProvider({
      bmr: 1800,
      activityLevel: 'medium',
      foodLog: [
        { id: '1', timestamp: '', mealType: 'breakfast', entries: [] },
        { id: '2', timestamp: '', mealType: 'lunch', entries: [] },
      ],
    });
    expect(r.daysOfData).toBe(2);
  });

  it('НЕ throw ни при каких входах (защита от crash при DI-swap)', () => {
    expect(() => adaptiveTDEEProvider({ bmr: 1800, activityLevel: 'sedentary' })).not.toThrow();
  });
});
