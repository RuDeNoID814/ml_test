import { describe, it, expect } from 'vitest';
import { calcWeightTrend } from './weightTrend';
import type { WeightEntry } from '@/db/types';

function entry(
  kg: number,
  daysAgo: number,
  context: WeightEntry['context'] = 'morning-fasted',
): WeightEntry {
  const timestamp = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();
  return {
    id: `${daysAgo}-${kg}-${context}`,
    kg,
    timestamp,
    context,
  };
}

describe('calcWeightTrend', () => {
  const NOW = new Date('2026-09-13T12:00:00Z');

  function e(
    kg: number,
    daysAgo: number,
    context: WeightEntry['context'] = 'morning-fasted',
  ): WeightEntry {
    return {
      id: `${daysAgo}-${kg}-${context}`,
      kg,
      timestamp: new Date(NOW.getTime() - daysAgo * 24 * 3600 * 1000).toISOString(),
      context,
    };
  }

  it('пустой массив → source=none', () => {
    const r = calcWeightTrend([], NOW);
    expect(r.source).toBe('none');
    expect(r.value).toBe(0);
    expect(r.confidence).toBe('accumulating');
  });

  it('1 morning-fasted в окне → source=latest, confidence=accumulating', () => {
    const r = calcWeightTrend([e(80, 0)], NOW);
    expect(r.source).toBe('latest');
    expect(r.value).toBe(80);
    expect(r.confidence).toBe('accumulating');
    expect(r.entriesUsed).toBe(1);
  });

  it('3 morning-fasted в окне → source=trend, confidence=ready', () => {
    const r = calcWeightTrend([e(82, 6), e(81, 3), e(80, 0)], NOW);
    expect(r.source).toBe('trend');
    expect(r.confidence).toBe('ready');
    expect(r.entriesUsed).toBe(3);
    // newest = 80, oldest = 82. Weights: 0.3, 0.65, 1.0. Sum = 1.95.
    // Value = (82*0.3 + 81*0.65 + 80*1.0) / 1.95 = (24.6 + 52.65 + 80) / 1.95 ≈ 80.64
    expect(r.value).toBeGreaterThan(80);
    expect(r.value).toBeLessThan(82);
  });

  it('non-morning-fasted игнорируются в тренде', () => {
    const r = calcWeightTrend(
      [e(85, 0, 'evening'), e(84, 1, 'daytime'), e(83, 2, 'post-workout')],
      NOW,
    );
    // Все — не morning-fasted, в тренд не идут. Fallback на latest любой.
    expect(r.source).toBe('latest');
    expect(r.entriesUsed).toBe(0);
    expect(r.confidence).toBe('accumulating');
  });

  it('записи вне окна не влияют на тренд', () => {
    const r = calcWeightTrend(
      [
        e(90, 30), // > 7 дней
        e(89, 20),
        e(88, 10),
      ],
      NOW,
    );
    // Все за окном 7 дней → нет morning-fasted В окне → latest morning-fasted → 88
    expect(r.source).toBe('latest');
    expect(r.value).toBe(88);
  });

  it('смешанные контексты — тренд от morning-fasted, остальные для истории', () => {
    const r = calcWeightTrend(
      [
        e(82, 6, 'morning-fasted'),
        e(84, 5, 'evening'), // не в тренд
        e(81, 3, 'morning-fasted'),
        e(83, 2, 'post-workout'), // не в тренд
        e(80, 0, 'morning-fasted'),
      ],
      NOW,
    );
    expect(r.source).toBe('trend');
    expect(r.entriesUsed).toBe(3);
  });

  it('только 2 morning-fasted → пока «накопление», latest', () => {
    const r = calcWeightTrend([e(82, 6), e(80, 0)], NOW);
    expect(r.source).toBe('latest');
    expect(r.confidence).toBe('accumulating');
    expect(r.value).toBe(80); // самая свежая
  });

  it('фолбэк на latest любого контекста если нет morning-fasted', () => {
    const r = calcWeightTrend([e(85, 2, 'evening'), e(84, 0, 'daytime')], NOW);
    expect(r.source).toBe('latest');
    expect(r.value).toBe(84);
  });

  it('округление до 0.1 кг', () => {
    const r = calcWeightTrend([e(82.55, 6), e(81.55, 3), e(80.55, 0)], NOW);
    expect(r.source).toBe('trend');
    // должно быть на 0.1 kg
    expect((r.value * 10) % 1).toBe(0);
  });
});

// Silence unused
void entry;
