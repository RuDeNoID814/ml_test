import type { WeightEntry } from '@/db/types';

export type WeightTrend = {
  value: number; // килограмм
  source: 'trend' | 'latest' | 'none';
  entriesUsed: number; // сколько записей вошло в расчёт
  confidence: 'accumulating' | 'ready'; // ready когда >= minEntries
};

/**
 * Weighted moving average по последним `windowDays` дням для контекста 'morning-fasted'.
 *
 * Логика:
 *  1. Отбираем записи morning-fasted за последние `windowDays` дней от now.
 *  2. Если entriesUsed >= minEntries → WMA (newer entry = вес 1.0, oldest в окне = 0.3).
 *  3. Если 0 < entriesUsed < minEntries → source='latest', возвращаем kg последней записи.
 *  4. Если нет записей morning-fasted вообще:
 *      - если есть ЛЮБЫЕ weight entries → берём latest как fallback с source='latest'
 *      - иначе source='none', value=0.
 */
export function calcWeightTrend(
  entries: WeightEntry[],
  now: Date = new Date(),
  windowDays = 7,
  minEntries = 3,
): WeightTrend {
  if (!entries.length) {
    return { value: 0, source: 'none', entriesUsed: 0, confidence: 'accumulating' };
  }

  const cutoffMs = now.getTime() - windowDays * 24 * 60 * 60 * 1000;

  const morningFastedInWindow = entries
    .filter((e) => e.context === 'morning-fasted' && new Date(e.timestamp).getTime() >= cutoffMs)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (morningFastedInWindow.length >= minEntries) {
    // WMA: newest = 1.0, oldest в окне = 0.3, линейно
    const n = morningFastedInWindow.length;
    const weights = morningFastedInWindow.map((_, i) => {
      // i=0 — oldest, i=n-1 — newest
      const t = n === 1 ? 1 : i / (n - 1);
      return 0.3 + t * 0.7; // 0.3 → 1.0
    });
    const sumW = weights.reduce((s, w) => s + w, 0);
    const value = morningFastedInWindow.reduce((s, e, i) => s + e.kg * weights[i], 0) / sumW;
    return {
      value: Math.round(value * 10) / 10,
      source: 'trend',
      entriesUsed: n,
      confidence: 'ready',
    };
  }

  // < minEntries morning-fasted в окне → пытаемся latest morning-fasted
  const latestMorningFasted = [...entries]
    .filter((e) => e.context === 'morning-fasted')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  if (latestMorningFasted) {
    return {
      value: latestMorningFasted.kg,
      source: 'latest',
      entriesUsed: morningFastedInWindow.length,
      confidence: 'accumulating',
    };
  }

  // Нет morning-fasted вообще → latest любого контекста
  const latestAny = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];

  return {
    value: latestAny.kg,
    source: 'latest',
    entriesUsed: 0,
    confidence: 'accumulating',
  };
}
