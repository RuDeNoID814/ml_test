import type { BioimpedanceSnapshot } from '@/db/types';
import type { BioimpedanceRepository } from '../interfaces';

export class DexieBioimpedanceRepository implements BioimpedanceRepository {
  add(_entry: BioimpedanceSnapshot): Promise<string> {
    throw new Error('not implemented');
  }
  get(_id: string): Promise<BioimpedanceSnapshot | null> {
    throw new Error('not implemented');
  }
  list(): Promise<BioimpedanceSnapshot[]> {
    throw new Error('not implemented');
  }
  update(_id: string, _patch: Partial<BioimpedanceSnapshot>): Promise<void> {
    throw new Error('not implemented');
  }
  delete(_id: string): Promise<void> {
    throw new Error('not implemented');
  }
  latest(): Promise<BioimpedanceSnapshot | null> {
    throw new Error('not implemented');
  }
  range(_fromIso: string, _toIso: string): Promise<BioimpedanceSnapshot[]> {
    throw new Error('not implemented');
  }
}
