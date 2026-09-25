import { describe, it, expect } from 'vitest';
import { calcWeightTrend } from './weightTrend';
import type { WeightEntry } from '@/db/types';

const NOW = new Date('2026-01-08T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 3600 * 1000).toISOString();

function entry(id: string, kg: number, daysBack: number, context: WeightEntry['context']): WeightEntry {
  return { id, kg, timestamp: daysAgo(daysBack), context };
}

describe('calcWeightTrend', () => {
  it('нет ни одной записи — source=none, value=0', () => {
    expect(calcWeightTrend([], NOW)).toEqual({
      value: 0,
      source: 'none',
      entriesUsed: 0,
      confidence: 'accumulating',
    });
  });

  it('≥3 morning-fasted в окне — взвешенное среднее (WMA), новые записи весят больше', () => {
    const entries = [
      entry('a', 80.0, 6, 'morning-fasted'),
      entry('b', 79.5, 3, 'morning-fasted'),
      entry('c', 79.0, 1, 'morning-fasted'),
    ];
    expect(calcWeightTrend(entries, NOW)).toEqual({
      value: 79.3,
      source: 'trend',
      entriesUsed: 3,
      confidence: 'ready',
    });
  });

  it('<3 morning-fasted в окне — берётся последняя morning-fasted запись, даже если она вне окна', () => {
    const entries = [
      entry('old', 85.0, 20, 'morning-fasted'), // за пределами 7-дневного окна
      entry('y', 79.5, 2, 'morning-fasted'),
      entry('z', 79.0, 1, 'morning-fasted'), // самая свежая — она и должна победить
    ];
    expect(calcWeightTrend(entries, NOW)).toEqual({
      value: 79.0,
      source: 'latest',
      entriesUsed: 2,
      confidence: 'accumulating',
    });
  });

  it('нет ни одной morning-fasted — fallback на последнюю запись любого контекста', () => {
    const entries = [
      entry('p', 81.0, 5, 'evening'),
      entry('q', 80.5, 1, 'daytime'),
    ];
    expect(calcWeightTrend(entries, NOW)).toEqual({
      value: 80.5,
      source: 'latest',
      entriesUsed: 0,
      confidence: 'accumulating',
    });
  });
});
