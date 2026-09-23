import type { Sex } from '@/db/types';

/*
  Здоровье-маркеры из антропометрии.
  Не медицина, а ориентиры на базе общепринятых порогов (WHO, NHS).
  Возвращают {value, status, label} — status пригоден для UI-цвета:
    'good'    — зелёный
    'warning' — жёлтый (умеренный риск)
    'bad'     — красный (повышенный риск)
*/

export type MarkerStatus = 'good' | 'warning' | 'bad';

export type MarkerResult = {
  value: number;
  status: MarkerStatus;
  label: string;
};

/**
 * BMI (Body Mass Index) = вес(кг) / рост(м)²
 * WHO пороги:
 *   <18.5   — underweight → warning
 *   18.5–24.9 — норма → good
 *   25.0–29.9 — избыточный вес → warning
 *   ≥30.0   — ожирение → bad
 */
export function calcBMI(weightKg: number, heightCm: number): MarkerResult {
  const meters = heightCm / 100;
  const raw = weightKg / (meters * meters);
  const value = Math.round(raw * 10) / 10;

  // Классификацию делаем по неокруглённому значению — граница 25.0 vs 24.96
  // не должна зависеть от округления вывода.
  let status: MarkerStatus;
  let label: string;
  if (raw < 18.5) {
    status = 'warning';
    label = 'недобор веса';
  } else if (raw < 25) {
    status = 'good';
    label = 'норма';
  } else if (raw < 30) {
    status = 'warning';
    label = 'избыточный вес';
  } else {
    status = 'bad';
    label = 'ожирение';
  }

  return { value, status, label };
}

/**
 * WHR (Waist-to-Hip Ratio) = талия / попа.
 * WHO пороги:
 *   М: <0.90 good, 0.90–0.99 warning, ≥1.0 bad
 *   Ж: <0.85 good, 0.85–0.89 warning, ≥0.90 bad
 */
export function calcWHR(waistCm: number, hipCm: number, sex: Sex): MarkerResult {
  const raw = waistCm / hipCm;
  const value = Math.round(raw * 100) / 100;

  const thresholds = sex === 'M' ? { good: 0.9, warn: 1.0 } : { good: 0.85, warn: 0.9 };

  let status: MarkerStatus;
  let label: string;
  if (value < thresholds.good) {
    status = 'good';
    label = 'норма';
  } else if (value < thresholds.warn) {
    status = 'warning';
    label = 'умеренный риск';
  } else {
    status = 'bad';
    label = 'высокий риск';
  }

  return { value, status, label };
}

/**
 * WHtR (Waist-to-Height Ratio) = талия / рост.
 * Более чувствительный к висцеральному жиру чем BMI.
 * NHS пороги (одинаковые для М и Ж):
 *   <0.4 warning (истощение)  — не характерно, включаем для полноты
 *   0.4–0.49 good
 *   0.5–0.59 warning (повышенный риск)
 *   ≥0.6 bad (высокий риск)
 */
export function calcWaistToHeight(waistCm: number, heightCm: number): MarkerResult {
  const raw = waistCm / heightCm;
  const value = Math.round(raw * 100) / 100;

  let status: MarkerStatus;
  let label: string;
  if (value < 0.4) {
    status = 'warning';
    label = 'слишком мало';
  } else if (value < 0.5) {
    status = 'good';
    label = 'норма';
  } else if (value < 0.6) {
    status = 'warning';
    label = 'повышенный риск';
  } else {
    status = 'bad';
    label = 'высокий риск';
  }

  return { value, status, label };
}
