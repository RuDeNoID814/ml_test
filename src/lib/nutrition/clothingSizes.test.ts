import { describe, it, expect } from 'vitest';
import { calcClothingSizes } from './clothingSizes';

describe('calcClothingSizes — мужчина', () => {
  it('верх: RU = floorEven(грудь / 2), alpha по таблице', () => {
    expect(calcClothingSizes({ sex: 'M', chestCm: 100 }).top).toEqual({ ru: 50, alpha: 'L' });
    expect(calcClothingSizes({ sex: 'M', chestCm: 106 }).top).toEqual({ ru: 52, alpha: 'XL' });
  });

  it('низ: RU = floorEven(талия / 2 + 8)', () => {
    expect(calcClothingSizes({ sex: 'M', waistCm: 82 }).bottom).toEqual({ ru: 48 });
    expect(calcClothingSizes({ sex: 'M', waistCm: 98 }).bottom).toEqual({ ru: 56 });
  });

  it('за пределами таблицы alpha — последняя метка с «+»', () => {
    expect(calcClothingSizes({ sex: 'M', chestCm: 120 }).top).toEqual({
      ru: 60,
      alpha: 'XXXL+',
    });
  });
});

describe('calcClothingSizes — женщина', () => {
  it('верх: RU = floorEven(бюст / 2)', () => {
    expect(calcClothingSizes({ sex: 'F', chestCm: 84 }).top).toEqual({ ru: 42, alpha: 'S' });
    expect(calcClothingSizes({ sex: 'F', chestCm: 92 }).top).toEqual({ ru: 46, alpha: 'L' });
  });

  it('низ: RU = floorEven(бёдра / 2 − 2), считается от hipCm, не waistCm', () => {
    expect(calcClothingSizes({ sex: 'F', hipCm: 92 }).bottom).toEqual({ ru: 44 });
    expect(calcClothingSizes({ sex: 'F', hipCm: 104 }).bottom).toEqual({ ru: 50 });
    // мужская логика низа (по талии) не должна сработать для Ж
    expect(calcClothingSizes({ sex: 'F', waistCm: 82 }).bottom).toBeUndefined();
  });
});

describe('calcClothingSizes — джинсы и воротник (не зависят от пола)', () => {
  it('джинсы W = floor(талия_см / 2.54), американский дюймовый размер', () => {
    expect(calcClothingSizes({ sex: 'M', waistCm: 82 }).jeans).toEqual({ w: 32 });
  });

  it('воротник — округление до ближайших 0.5 см', () => {
    expect(calcClothingSizes({ sex: 'M', neckCm: 38 }).collar).toEqual({ size: 38 });
    expect(calcClothingSizes({ sex: 'M', neckCm: 37.3 }).collar).toEqual({ size: 37.5 });
  });
});

describe('calcClothingSizes — частичные данные', () => {
  it('без каких-либо обхватов — все поля отсутствуют', () => {
    expect(calcClothingSizes({ sex: 'M' })).toEqual({});
  });

  it('только один параметр — считается только он', () => {
    const result = calcClothingSizes({ sex: 'M', neckCm: 40 });
    expect(result.collar).toEqual({ size: 40 });
    expect(result.top).toBeUndefined();
    expect(result.bottom).toBeUndefined();
    expect(result.jeans).toBeUndefined();
  });
});
