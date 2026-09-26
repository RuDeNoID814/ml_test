import { getDB } from '@/db/schema';
import type { Profile } from '@/db/types';
import type { ProfileDraft, ProfileRepository } from '../interfaces';

/*
  MVP — один игрок. Профиль хранится под фиксированным id 'me',
  чтобы не хранить «текущего пользователя» отдельным ключом.
  В v2 (multi-user) добавим userId и уберём фиксированный id.
*/
const PROFILE_ID = 'me';

export class DexieProfileRepository implements ProfileRepository {
  async getCurrent(): Promise<Profile | null> {
    const db = getDB();
    const p = await db.profile.get(PROFILE_ID);
    return p ?? null;
  }

  async save(draft: ProfileDraft): Promise<string> {
    const now = new Date().toISOString();
    const db = getDB();
    const existing = await db.profile.get(PROFILE_ID);
    const full: Profile = {
      ...draft,
      id: PROFILE_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await db.profile.put(full);
    return PROFILE_ID;
  }

  async update(id: string, patch: Partial<ProfileDraft>): Promise<void> {
    const db = getDB();
    await db.profile.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  }

  async clear(): Promise<void> {
    // «Начать заново» — полный wipe пользовательских данных.
    // Профиль + все замеры веса + сон + еда + обхваты + биоимпеданс.
    const db = getDB();
    await db.transaction(
      'rw',
      [
        db.profile,
        db.weight_log,
        db.sleep_log,
        db.food_log,
        db.body_measurements,
        db.bioimpedance_snapshots,
      ],
      async () => {
        await db.profile.delete(PROFILE_ID);
        await db.weight_log.clear();
        await db.sleep_log.clear();
        await db.food_log.clear();
        await db.body_measurements.clear();
        await db.bioimpedance_snapshots.clear();
      },
    );
  }
}
