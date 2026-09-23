import { describe, it, expect } from 'vitest';
import { calcClothingSizes } from './clothingSizes';

describe('calcClothingSizes — М', () => {
  it('грудь 106 → RU 52 (XL)', () => {
    const r = calcClothingSizes({ sex: 'M', chestCm: 106 });
    expect(r.top).toEqual({ ru: 52, alpha: 'XL' });
  });

  it('грудь 92 → RU 46 (S)', () => {
    const r = calcClothingSizes({ sex: 'M', chestCm: 92 });
    expect(r.top).toEqual({ ru: 46, alpha: 'S' });
  });

  it('грудь 100 → RU 50 (L)', () => {
    const r = calcClothingSizes({ sex: 'M', chestCm: 100 });
    expect(r.top).toEqual({ ru: 50, alpha: 'L' });
  });

  it('талия 82 → RU 48 (низ)', () => {
    const r = calcClothingSizes({ sex: 'M', waistCm: 82 });
    expect(r.bottom).toEqual({ ru: 48 });
  });

  it('талия 98 → джинсы W38 + низ RU 56', () => {
    const r = calcClothingSizes({ sex: 'M', waistCm: 98 });
    expect(r.jeans).toEqual({ w: 38 });
    expect(r.bottom).toEqual({ ru: 56 });
  });

  it('шея 38 → воротник 38', () => {
    const r = calcClothingSizes({ sex: 'M', neckCm: 38 });
    expect(r.collar).toEqual({ size: 38 });
  });
});

describe('calcClothingSizes — Ж', () => {
  it('грудь 80.5 → RU 40 (XS)', () => {
    const r = calcClothingSizes({ sex: 'F', chestCm: 80.5 });
    expect(r.top).toEqual({ ru: 40, alpha: 'XS' });
  });

  it('грудь 88 → RU 44 (M)', () => {
    const r = calcClothingSizes({ sex: 'F', chestCm: 88 });
    expect(r.top).toEqual({ ru: 44, alpha: 'M' });
  });

  it('попа 89.5 → низ RU 42 (S)', () => {
    const r = calcClothingSizes({ sex: 'F', hipCm: 89.5 });
    expect(r.bottom).toEqual({ ru: 42 });
  });

  it('попа 100 → низ RU 48 (XL)', () => {
    const r = calcClothingSizes({ sex: 'F', hipCm: 100 });
    expect(r.bottom).toEqual({ ru: 48 });
  });

  it('талия 66.5 → джинсы W26', () => {
    const r = calcClothingSizes({ sex: 'F', waistCm: 66.5 });
    expect(r.jeans).toEqual({ w: 26 });
  });

  it('Ж без hip → нет низа', () => {
    const r = calcClothingSizes({ sex: 'F', waistCm: 66.5 });
    expect(r.bottom).toBeUndefined();
  });
});

describe('пустые входы', () => {
  it('без обхватов → пустой объект', () => {
    const r = calcClothingSizes({ sex: 'M' });
    expect(r).toEqual({});
  });
});
