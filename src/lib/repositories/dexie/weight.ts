import { getDB } from '@/db/schema';
import type { WeightEntry } from '@/db/types';
import type { WeightRepository } from '../interfaces';

export class DexieWeightRepository implements WeightRepository {
  async add(entry: WeightEntry): Promise<string> {
    const db = getDB();
    const id = entry.id || crypto.randomUUID();
    await db.weight_log.put({ ...entry, id });
    return id;
  }

  async get(id: string): Promise<WeightEntry | null> {
    const db = getDB();
    const e = await db.weight_log.get(id);
    return e ?? null;
  }

  async list(): Promise<WeightEntry[]> {
    const db = getDB();
    return db.weight_log.orderBy('timestamp').toArray();
  }

  async update(id: string, patch: Partial<WeightEntry>): Promise<void> {
    const db = getDB();
    await db.weight_log.update(id, patch);
  }

  async delete(id: string): Promise<void> {
    const db = getDB();
    await db.weight_log.delete(id);
  }

  async latest(): Promise<WeightEntry | null> {
    const db = getDB();
    const e = await db.weight_log.orderBy('timestamp').reverse().first();
    return e ?? null;
  }

  async range(fromIso: string, toIso: string): Promise<WeightEntry[]> {
    const db = getDB();
    return db.weight_log.where('timestamp').between(fromIso, toIso, true, true).sortBy('timestamp');
  }
}
