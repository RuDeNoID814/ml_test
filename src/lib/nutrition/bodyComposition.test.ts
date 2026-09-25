import { describe, it, expect } from 'vitest';
import { calcBFPercentFromNavy, calcLBM, getBFPercent } from './bodyComposition';

describe('calcBFPercentFromNavy — конвертация см → дюймы', () => {
  it('М: считает по формуле, переведя см в дюймы (регрессия на баг с единицами)', () => {
    // Проверено независимо: 85/38/180 см → 33.46/14.96/70.87 дюймов → 9.8%.
    const result = calcBFPercentFromNavy({ sex: 'M', waistCm: 85, neckCm: 38, heightCm: 180 });
    expect(result).toBe(9.8);
  });

  it('Ж: требует бёдра, тоже считает через дюймы', () => {
    const result = calcBFPercentFromNavy({
      sex: 'F',
      waistCm: 80,
      neckCm: 34,
      hipCm: 100,
      heightCm: 168,
    });
    expect(result).toBe(7.4);
  });

  it('регрессия: см не должны использоваться как дюймы напрямую', () => {
    // Если бы см подставлялись в формулу без конвертации (старый баг),
    // результат был бы другим и заметно выше.
    const fixed = calcBFPercentFromNavy({ sex: 'M', waistCm: 85, neckCm: 38, heightCm: 180 })!;
    const naiveDenom = 1.0324 - 0.19077 * Math.log10(85 - 38) + 0.15456 * Math.log10(180);
    const naiveBuggyValue = Math.round((495 / naiveDenom - 450) * 10) / 10;
    expect(fixed).not.toBe(naiveBuggyValue);
  });

  it('без обязательных полей — null', () => {
    expect(calcBFPercentFromNavy({ sex: 'M', heightCm: 180 })).toBeNull();
    expect(calcBFPercentFromNavy({ sex: 'M', waistCm: 85, heightCm: 180 })).toBeNull();
  });

  it('Ж без бёдер — null (обязательное поле для женской формулы)', () => {
    expect(calcBFPercentFromNavy({ sex: 'F', waistCm: 80, neckCm: 34, heightCm: 168 })).toBeNull();
  });

  it('результат вне разумного диапазона (3–60%) — null', () => {
    // Талия почти равна шее — формула уходит в физически бессмысленный результат.
    expect(calcBFPercentFromNavy({ sex: 'M', waistCm: 40, neckCm: 39, heightCm: 180 })).toBeNull();
  });
});

describe('calcLBM', () => {
  it('вес × (1 − BF%/100), округление до 0.1 кг', () => {
    expect(calcLBM(83, 15)).toBe(70.6);
    expect(calcLBM(60, 25)).toBe(45);
  });
});

describe('getBFPercent — приоритет источников', () => {
  const profile = { sex: 'M' as const, heightCm: 180 };

  it('биоимпеданс — приоритет над обхватами', () => {
    const result = getBFPercent({
      bioimpedance: { fatPercent: 18 } as never,
      circumferences: { waistCm: 85, neckCm: 38 } as never,
      profile,
    });
    expect(result).toEqual({ value: 18, source: 'bioimpedance' });
  });

  it('нет биоимпеданса — падает на Navy formula по обхватам', () => {
    const result = getBFPercent({
      bioimpedance: null,
      circumferences: { waistCm: 85, neckCm: 38 } as never,
      profile,
    });
    expect(result).toEqual({ value: 9.8, source: 'navy' });
  });

  it('нет ни одного источника — null', () => {
    expect(getBFPercent({ bioimpedance: null, circumferences: null, profile })).toBeNull();
  });
});
