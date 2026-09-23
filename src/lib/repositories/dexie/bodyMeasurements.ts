import { getDB } from '@/db/schema';
import type { BodyMeasurement } from '@/db/types';
import type { BodyMeasurementRepository } from '../interfaces';

export class DexieBodyMeasurementRepository implements BodyMeasurementRepository {
  async add(entry: BodyMeasurement): Promise<string> {
    const db = getDB();
    const id = entry.id || crypto.randomUUID();
    await db.body_measurements.put({ ...entry, id });
    return id;
  }

  async get(id: string): Promise<BodyMeasurement | null> {
    const db = getDB();
    const e = await db.body_measurements.get(id);
    return e ?? null;
  }

  async list(): Promise<BodyMeasurement[]> {
    const db = getDB();
    return db.body_measurements.orderBy('timestamp').toArray();
  }

  async update(id: string, patch: Partial<BodyMeasurement>): Promise<void> {
    const db = getDB();
    await db.body_measurements.update(id, patch);
  }

  async delete(id: string): Promise<void> {
    const db = getDB();
    await db.body_measurements.delete(id);
  }

  async latest(): Promise<BodyMeasurement | null> {
    const db = getDB();
    const e = await db.body_measurements.orderBy('timestamp').reverse().first();
    return e ?? null;
  }

  async range(fromIso: string, toIso: string): Promise<BodyMeasurement[]> {
    const db = getDB();
    return db.body_measurements
      .where('timestamp')
      .between(fromIso, toIso, true, true)
      .sortBy('timestamp');
  }
}
