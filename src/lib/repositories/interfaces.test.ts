import { describe, it, expect } from 'vitest';
import { getRepositories } from './index';

describe('repository factory', () => {
  it('возвращает все репозитории', () => {
    const r = getRepositories();
    expect(r.profile).toBeDefined();
    expect(r.weight).toBeDefined();
    expect(r.sleep).toBeDefined();
    expect(r.products).toBeDefined();
    expect(r.meals).toBeDefined();
    expect(r.foodLog).toBeDefined();
    expect(r.bodyMeasurements).toBeDefined();
    expect(r.bioimpedance).toBeDefined();
  });

  it('singleton — вызовы возвращают одинаковый бандл', () => {
    expect(getRepositories()).toBe(getRepositories());
  });
});
