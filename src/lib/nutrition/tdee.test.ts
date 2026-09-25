import { describe, it, expect } from 'vitest';
import { formulaicTDEEProvider, adaptiveTDEEProvider } from './tdee';

describe('formulaicTDEEProvider', () => {
  it('BMR × коэффициент активности, округление до целого', () => {
    expect(formulaicTDEEProvider({ bmr: 1886, activityLevel: 'sedentary' })).toEqual({
      value: 2263,
      source: 'formulaic',
      confidence: 'ready',
    });
    expect(formulaicTDEEProvider({ bmr: 1886, activityLevel: 'medium' })).toEqual({
      value: 2923,
      source: 'formulaic',
      confidence: 'ready',
    });
    expect(formulaicTDEEProvider({ bmr: 1886, activityLevel: 'very_high' })).toEqual({
      value: 3583,
      source: 'formulaic',
      confidence: 'ready',
    });
  });
});

describe('adaptiveTDEEProvider — пока fallback на formulaic', () => {
  it('то же значение, что formulaic, но с другой меткой и confidence=accumulating', () => {
    const input = { bmr: 1886, activityLevel: 'medium' as const };
    const result = adaptiveTDEEProvider(input);
    expect(result.value).toBe(formulaicTDEEProvider(input).value);
    expect(result.source).toBe('adaptive');
    expect(result.confidence).toBe('accumulating');
  });

  it('daysOfData = длина переданного foodLog, 0 если не передан', () => {
    const input = { bmr: 1886, activityLevel: 'medium' as const };
    expect(adaptiveTDEEProvider(input).daysOfData).toBe(0);
    expect(
      adaptiveTDEEProvider({ ...input, foodLog: [{}, {}, {}] as never }).daysOfData,
    ).toBe(3);
  });
});
