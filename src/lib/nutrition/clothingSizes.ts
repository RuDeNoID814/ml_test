import type { Sex } from '@/db/types';

/*
  Размеры одежды из обхватов тела.
  Русская (RU) сетка используется как основная, соответствует EU/DE для тела.
  Alpha (XS/S/M/L/XL/XXL) — обобщённая.

  Формулы (округление к ближайшему чётному вниз — "floorEven"):
    М верх:   RU = chest / 2         (например 100 → 50 / L, 106 → 52 / XL)
    М низ:    RU = waist / 2 + 8     (например 82 → 48, 98 → 56)
    Ж верх:   RU = bust / 2          (например 84 → 42, 92 → 46)
    Ж низ:    RU = hip / 2 − 2       (например 92 → 44, 104 → 50)
    Джинсы W: floor(waist_cm / 2.54) — американская дюймовая
    Воротник: neck_cm, округл до 0.5
*/

export type ClothingSizes = {
  top?: { ru: number; alpha: string }; // верх (грудь)
  bottom?: { ru: number }; // низ (талия М / бёдра Ж)
  jeans?: { w: number }; // джинсы W (дюймы, талия)
  collar?: { size: number }; // воротник (шея, см)
};

const ALPHA_M: Array<{ maxRu: number; label: string }> = [
  { maxRu: 44, label: 'XS' },
  { maxRu: 46, label: 'S' },
  { maxRu: 48, label: 'M' },
  { maxRu: 50, label: 'L' },
  { maxRu: 52, label: 'XL' },
  { maxRu: 54, label: 'XXL' },
  { maxRu: 56, label: 'XXXL' },
];

const ALPHA_F: Array<{ maxRu: number; label: string }> = [
  { maxRu: 40, label: 'XS' },
  { maxRu: 42, label: 'S' },
  { maxRu: 44, label: 'M' },
  { maxRu: 46, label: 'L' },
  { maxRu: 48, label: 'XL' },
  { maxRu: 50, label: 'XXL' },
  { maxRu: 52, label: 'XXXL' },
];

function floorEven(n: number): number {
  return Math.floor(n / 2) * 2;
}

function alphaFor(ru: number, sex: Sex): string {
  const scale = sex === 'M' ? ALPHA_M : ALPHA_F;
  for (const step of scale) {
    if (ru <= step.maxRu) return step.label;
  }
  return scale[scale.length - 1].label + '+';
}

export function calcClothingSizes(input: {
  sex: Sex;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
}): ClothingSizes {
  const { sex, chestCm, waistCm, hipCm, neckCm } = input;
  const out: ClothingSizes = {};

  if (chestCm) {
    const ru = sex === 'M' ? floorEven(chestCm / 2) : floorEven(chestCm / 2);
    out.top = { ru, alpha: alphaFor(ru, sex) };
  }

  if (sex === 'M' && waistCm) {
    out.bottom = { ru: floorEven(waistCm / 2 + 8) };
  } else if (sex === 'F' && hipCm) {
    out.bottom = { ru: floorEven(hipCm / 2 - 2) };
  }

  if (waistCm) {
    out.jeans = { w: Math.floor(waistCm / 2.54) };
  }

  if (neckCm) {
    out.collar = { size: Math.round(neckCm * 2) / 2 };
  }

  return out;
}
