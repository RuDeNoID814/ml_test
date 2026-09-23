import { describe, it, expect } from 'vitest';
import {
  calcBFPercentFromNavy,
  calcLBM,
  getBFPercent,
} from './bodyComposition';

describe('calcBFPercentFromNavy', () => {
  it('М: талия 85, шея 40, рост 185 → ~15%', () => {
    const bf = calcBFPercentFromNavy({
      sex: 'M',
      waistCm: 85,
      neckCm: 40,
      heightCm: 185,
    });
    expect(bf).not.toBeNull();
    expect(bf!).toBeGreaterThan(10);
    expect(bf!).toBeLessThan(20);
  });

  it('Ж: талия 75, шея 34, бёдра 100, рост 168 → ~25%', () => {
    const bf = calcBFPercentFromNavy({
      sex: 'F',
      waistCm: 75,
      neckCm: 34,
      hipCm: 100,
      heightCm: 168,
    });
    expect(bf).not.toBeNull();
    expect(bf!).toBeGreaterThan(20);
    expect(bf!).toBeLessThan(30);
  });

  it('Ж без бёдер → null', () => {
    const bf = calcBFPercentFromNavy({
      sex: 'F',
      waistCm: 75,
      neckCm: 34,
      heightCm: 168,
    });
    expect(bf).toBeNull();
  });

  it('М без талии → null', () => {
    const bf = calcBFPercentFromNavy({
      sex: 'M',
      neckCm: 40,
      heightCm: 185,
    });
    expect(bf).toBeNull();
  });

  it('невалидные значения (шея > талия) → null', () => {
    const bf = calcBFPercentFromNavy({
      sex: 'M',
      waistCm: 30,
      neckCm: 50,
      heightCm: 185,
    });
    expect(bf).toBeNull();
  });
});

describe('calcLBM', () => {
  it('83 кг, 15% жира → 70.6 кг', () => {
    expect(calcLBM(83, 15)).toBe(70.6);
  });

  it('60 кг, 25% → 45 кг', () => {
    expect(calcLBM(60, 25)).toBe(45);
  });
});

describe('getBFPercent — приоритет источников', () => {
  const profile = { sex: 'M' as const, heightCm: 185 };

  it('нет источников → null', () => {
    expect(getBFPercent({ profile })).toBeNull();
  });

  it('только биоимпеданс → source=bioimpedance', () => {
    const r = getBFPercent({
      profile,
      bioimpedance: {
        id: '1',
        timestamp: '',
        fatPercent: 17,
      },
    });
    expect(r).toEqual({ value: 17, source: 'bioimpedance' });
  });

  it('только обхваты → source=navy', () => {
    const r = getBFPercent({
      profile,
      circumferences: {
        id: '1',
        timestamp: '',
        waistCm: 85,
        neckCm: 40,
      },
    });
    expect(r?.source).toBe('navy');
    expect(r?.value).toBeGreaterThan(10);
  });

  it('оба источника → приоритет биоимпеданса', () => {
    const r = getBFPercent({
      profile,
      bioimpedance: {
        id: '1',
        timestamp: '',
        fatPercent: 17,
      },
      circumferences: {
        id: '2',
        timestamp: '',
        waistCm: 85,
        neckCm: 40,
      },
    });
    expect(r?.source).toBe('bioimpedance');
    expect(r?.value).toBe(17);
  });

  it('биоимпеданс без fatPercent → fallback на navy', () => {
    const r = getBFPercent({
      profile,
      bioimpedance: {
        id: '1',
        timestamp: '',
        musclePercent: 40,
      },
      circumferences: {
        id: '2',
        timestamp: '',
        waistCm: 85,
        neckCm: 40,
      },
    });
    expect(r?.source).toBe('navy');
  });
});
