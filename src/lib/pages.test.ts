import { describe, it, expect } from 'vitest';
import { getPageEntry, pages } from './pages';

describe('getPageEntry', () => {
  it('главная — live', () => {
    expect(getPageEntry('/')).toEqual({ route: '/', label: 'Главная', status: 'live' });
  });

  it('онбординг — placeholder', () => {
    expect(getPageEntry('/onboarding').status).toBe('placeholder');
  });

  it('профиль/вес/обхваты — hidden', () => {
    expect(getPageEntry('/profile').status).toBe('hidden');
    expect(getPageEntry('/weight').status).toBe('hidden');
    expect(getPageEntry('/measurements').status).toBe('hidden');
  });

  it('незарегистрированный маршрут — считается hidden по умолчанию (безопасный fallback)', () => {
    const entry = getPageEntry('/что-то-несуществующее');
    expect(entry.status).toBe('hidden');
    expect(entry.route).toBe('/что-то-несуществующее');
  });

  it('в реестре нет дублей маршрутов', () => {
    const routes = pages.map((p) => p.route);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
