import { describe, it, expect } from 'vitest';
import { calcBMR, calcBMRKatch, calcBMRMifflin } from './bmr';

describe('calcBMRKatch', () => {
  it('370 + 21.6 × LBM, округление до целого', () => {
    expect(calcBMRKatch(70)).toBe(1882);
    expect(calcBMRKatch(55)).toBe(1558);
  });
});

describe('calcBMRMifflin', () => {
  it('М: 10×вес + 6.25×рост − 5×возраст + 5', () => {
    expect(calcBMRMifflin({ sex: 'M', weightKg: 83, heightCm: 185, ageYears: 21 })).toBe(1886);
  });

  it('Ж: 10×вес + 6.25×рост − 5×возраст − 161', () => {
    expect(calcBMRMifflin({ sex: 'F', weightKg: 60, heightCm: 165, ageYears: 25 })).toBe(1345);
  });
});

describe('calcBMR — выбор формулы по наличию BF%', () => {
  const base = { sex: 'M' as const, weightKg: 83, heightCm: 185, ageYears: 21 };

  it('без bfPercent → Mifflin-St Jeor', () => {
    const r = calcBMR(base);
    expect(r.source).toBe('mifflin-st-jeor');
    expect(r.value).toBe(1886);
    expect(r.bfSource).toBeUndefined();
  });

  it('с валидным bfPercent → Katch-McArdle, метка источника прокидывается', () => {
    const r = calcBMR({ ...base, bfPercent: 15, bfSource: 'bioimpedance' });
    expect(r.source).toBe('katch-mcardle');
    expect(r.bfSource).toBe('bioimpedance');
    // LBM = round(83 × 0.85, 1) = 70.6; BMR = round(370 + 21.6×70.6) = 1895
    expect(r.value).toBe(1895);
  });

  it('bfPercent = 0 (граница, некорректно) → fallback на Mifflin', () => {
    expect(calcBMR({ ...base, bfPercent: 0 }).source).toBe('mifflin-st-jeor');
  });

  it('bfPercent = 60 (граница, некорректно) → fallback на Mifflin', () => {
    expect(calcBMR({ ...base, bfPercent: 60 }).source).toBe('mifflin-st-jeor');
  });

  it('bfPercent из Navy formula → метка источника navy', () => {
    const r = calcBMR({ ...base, bfPercent: 18, bfSource: 'navy' });
    expect(r.source).toBe('katch-mcardle');
    expect(r.bfSource).toBe('navy');
  });
});
