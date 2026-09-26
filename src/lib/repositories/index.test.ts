import { describe, it, expect } from 'vitest';
import { getRepositories } from './index';

describe('getRepositories', () => {
  it('возвращает все 8 репозиториев', () => {
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

  it('singleton — повторный вызов возвращает тот же объект, не создаёт новый набор', () => {
    expect(getRepositories()).toBe(getRepositories());
  });
});
