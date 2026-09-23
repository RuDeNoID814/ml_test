import type { FoodEntry } from '@/db/types';
import type { FoodLogRepository } from '../interfaces';

export class DexieFoodLogRepository implements FoodLogRepository {
  add(_entry: FoodEntry): Promise<string> {
    throw new Error('not implemented');
  }
  get(_id: string): Promise<FoodEntry | null> {
    throw new Error('not implemented');
  }
  list(): Promise<FoodEntry[]> {
    throw new Error('not implemented');
  }
  update(_id: string, _patch: Partial<FoodEntry>): Promise<void> {
    throw new Error('not implemented');
  }
  delete(_id: string): Promise<void> {
    throw new Error('not implemented');
  }
  range(_fromIso: string, _toIso: string): Promise<FoodEntry[]> {
    throw new Error('not implemented');
  }
  byDay(_dateIso: string): Promise<FoodEntry[]> {
    throw new Error('not implemented');
  }
}
