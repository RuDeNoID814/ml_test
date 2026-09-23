import type { SleepEntry } from '@/db/types';
import type { SleepRepository } from '../interfaces';

export class DexieSleepRepository implements SleepRepository {
  add(_entry: SleepEntry): Promise<string> {
    throw new Error('not implemented');
  }
  get(_id: string): Promise<SleepEntry | null> {
    throw new Error('not implemented');
  }
  list(): Promise<SleepEntry[]> {
    throw new Error('not implemented');
  }
  update(_id: string, _patch: Partial<SleepEntry>): Promise<void> {
    throw new Error('not implemented');
  }
  delete(_id: string): Promise<void> {
    throw new Error('not implemented');
  }
  latest(): Promise<SleepEntry | null> {
    throw new Error('not implemented');
  }
  range(_fromIso: string, _toIso: string): Promise<SleepEntry[]> {
    throw new Error('not implemented');
  }
}
