import { describe, it, expect } from 'vitest';
import { calcBMI, calcWHR, calcWaistToHeight } from './healthMarkers';

describe('calcBMI', () => {
  it('норма ~25 (граница) → good, статус по неокруглённому', () => {
    // 84.5 / 1.84² = 24.9587, округляется до 25.0, но классификация по raw.
    const r = calcBMI(84.5, 184);
    expect(r.value).toBe(25);
    expect(r.status).toBe('good');
  });

  it('BMI 30+ → bad, ожирение', () => {
    const r = calcBMI(100, 175);
    expect(r.value).toBeCloseTo(32.7, 1);
    expect(r.status).toBe('bad');
    expect(r.label).toBe('ожирение');
  });

  it('BMI 18 → warning, недобор', () => {
    const r = calcBMI(43, 160);
    expect(r.status).toBe('warning');
    expect(r.label).toBe('недобор веса');
  });

  it('BMI 26 → warning, избыток', () => {
    const r = calcBMI(80, 175);
    expect(r.value).toBeCloseTo(26.1, 1);
    expect(r.status).toBe('warning');
    expect(r.label).toBe('избыточный вес');
  });
});

describe('calcWHR (waist-to-hip ratio)', () => {
  it('М 0.92 → warning (умеренный риск)', () => {
    const r = calcWHR(98, 107, 'M');
    expect(r.value).toBeCloseTo(0.92, 2);
    expect(r.status).toBe('warning');
  });

  it('М 0.85 → good', () => {
    const r = calcWHR(85, 100, 'M');
    expect(r.status).toBe('good');
  });

  it('М 1.05 → bad', () => {
    const r = calcWHR(105, 100, 'M');
    expect(r.status).toBe('bad');
  });

  it('Ж 0.74 → good', () => {
    const r = calcWHR(66.5, 89.5, 'F');
    expect(r.value).toBeCloseTo(0.74, 2);
    expect(r.status).toBe('good');
  });

  it('Ж 0.87 → warning', () => {
    const r = calcWHR(87, 100, 'F');
    expect(r.status).toBe('warning');
  });

  it('Ж 0.95 → bad', () => {
    const r = calcWHR(95, 100, 'F');
    expect(r.status).toBe('bad');
  });
});

describe('calcWaistToHeight', () => {
  it('0.53 → warning', () => {
    const r = calcWaistToHeight(98, 184);
    expect(r.value).toBeCloseTo(0.53, 2);
    expect(r.status).toBe('warning');
  });

  it('0.45 → good', () => {
    const r = calcWaistToHeight(66.5, 148);
    expect(r.value).toBeCloseTo(0.45, 2);
    expect(r.status).toBe('good');
  });

  it('0.62 → bad', () => {
    const r = calcWaistToHeight(110, 175);
    expect(r.status).toBe('bad');
  });
});
