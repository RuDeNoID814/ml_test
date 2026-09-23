import { describe, it, expect } from 'vitest';
import { calcBMR, calcBMRKatch, calcBMRMifflin } from './bmr';

describe('calcBMRKatch (Katch-McArdle)', () => {
  it('LBM 70 кг → 370 + 21.6*70 = 1882', () => {
    expect(calcBMRKatch(70)).toBe(1882);
  });

  it('LBM 55 кг → 370 + 21.6*55 = 1558', () => {
    expect(calcBMRKatch(55)).toBe(1558);
  });
});

describe('calcBMRMifflin (Mifflin-St Jeor)', () => {
  it('М, 21, 83 кг, 185 см → 1886', () => {
    expect(calcBMRMifflin({ sex: 'M', weightKg: 83, heightCm: 185, ageYears: 21 })).toBe(1886);
  });

  it('Ж, 25, 60 кг, 165 см → 1345', () => {
    expect(calcBMRMifflin({ sex: 'F', weightKg: 60, heightCm: 165, ageYears: 25 })).toBe(1345);
  });
});

describe('calcBMR selector', () => {
  const base = { sex: 'M' as const, weightKg: 83, heightCm: 185, ageYears: 21 };

  it('без BF% → Mifflin', () => {
    const r = calcBMR(base);
    expect(r.source).toBe('mifflin-st-jeor');
    expect(r.value).toBe(1886);
    expect(r.bfSource).toBeUndefined();
  });

  it('с BF% 15% → Katch-McArdle с меткой источника', () => {
    const r = calcBMR({ ...base, bfPercent: 15, bfSource: 'bioimpedance' });
    expect(r.source).toBe('katch-mcardle');
    expect(r.bfSource).toBe('bioimpedance');
    // LBM = 83 × 0.85 = 70.55, round=70.6. BMR = 370 + 21.6*70.6 = 1894.96 → 1895
    expect(r.value).toBe(1895);
  });

  it('BF% 0 (некорректно) → Mifflin fallback', () => {
    const r = calcBMR({ ...base, bfPercent: 0 });
    expect(r.source).toBe('mifflin-st-jeor');
  });

  it('BF% > 60 (некорректно) → Mifflin fallback', () => {
    const r = calcBMR({ ...base, bfPercent: 70 });
    expect(r.source).toBe('mifflin-st-jeor');
  });

  it('BF% из navy обозначен как navy', () => {
    const r = calcBMR({ ...base, bfPercent: 18, bfSource: 'navy' });
    expect(r.bfSource).toBe('navy');
  });
});
