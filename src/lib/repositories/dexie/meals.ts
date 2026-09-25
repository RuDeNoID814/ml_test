import type { Meal } from '@/db/types';
import type { MealRepository } from '../interfaces';

export class DexieMealRepository implements MealRepository {
  add(_entry: Meal): Promise<string> {
    throw new Error('not implemented');
  }
  get(_id: string): Promise<Meal | null> {
    throw new Error('not implemented');
  }
  list(): Promise<Meal[]> {
    throw new Error('not implemented');
  }
  update(_id: string, _patch: Partial<Meal>): Promise<void> {
    throw new Error('not implemented');
  }
  delete(_id: string): Promise<void> {
    throw new Error('not implemented');
  }
  searchByName(_query: string): Promise<Meal[]> {
    throw new Error('not implemented');
  }
}
