import { describe, it, expect } from 'vitest';
import { calcBMI, calcWHR, calcWaistToHeight } from './healthMarkers';

describe('calcBMI — пороги WHO', () => {
  it('норма (18.5–24.9)', () => {
    expect(calcBMI(70, 175)).toEqual({ value: 22.9, status: 'good', label: 'норма' });
  });

  it('недобор веса (<18.5)', () => {
    expect(calcBMI(50, 175)).toEqual({ value: 16.3, status: 'warning', label: 'недобор веса' });
  });

  it('избыточный вес (25.0–29.9)', () => {
    expect(calcBMI(85, 175)).toEqual({
      value: 27.8,
      status: 'warning',
      label: 'избыточный вес',
    });
  });

  it('ожирение (≥30.0)', () => {
    expect(calcBMI(100, 175)).toEqual({ value: 32.7, status: 'bad', label: 'ожирение' });
  });
});

describe('calcWHR — пороги разные для М/Ж', () => {
  it('М: норма <0.90', () => {
    expect(calcWHR(80, 95, 'M')).toEqual({ value: 0.84, status: 'good', label: 'норма' });
  });

  it('М: ≥1.0 — высокий риск', () => {
    expect(calcWHR(100, 100, 'M')).toEqual({ value: 1, status: 'bad', label: 'высокий риск' });
  });

  it('Ж: тот же WHR что и у М-примера — но по женским порогам уже не «норма»', () => {
    expect(calcWHR(85, 95, 'F')).toEqual({
      value: 0.89,
      status: 'warning',
      label: 'умеренный риск',
    });
    expect(calcWHR(70, 95, 'F')).toEqual({ value: 0.74, status: 'good', label: 'норма' });
  });
});

describe('calcWaistToHeight — пороги NHS, одинаковые для М/Ж', () => {
  it('норма (0.4–0.49)', () => {
    expect(calcWaistToHeight(80, 175)).toEqual({ value: 0.46, status: 'good', label: 'норма' });
  });

  it('повышенный риск (0.5–0.59)', () => {
    expect(calcWaistToHeight(95, 175)).toEqual({
      value: 0.54,
      status: 'warning',
      label: 'повышенный риск',
    });
  });

  it('высокий риск (≥0.6)', () => {
    expect(calcWaistToHeight(110, 175)).toEqual({
      value: 0.63,
      status: 'bad',
      label: 'высокий риск',
    });
  });
});
