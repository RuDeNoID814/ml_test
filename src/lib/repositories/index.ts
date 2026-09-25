import type { RepositoryBundle } from './interfaces';
import { DexieProfileRepository } from './dexie/profile';
import { DexieWeightRepository } from './dexie/weight';
import { DexieSleepRepository } from './dexie/sleep';
import { DexieProductRepository } from './dexie/products';
import { DexieMealRepository } from './dexie/meals';
import { DexieFoodLogRepository } from './dexie/foodLog';
import { DexieBodyMeasurementRepository } from './dexie/bodyMeasurements';
import { DexieBioimpedanceRepository } from './dexie/bioimpedance';

let bundle: RepositoryBundle | null = null;

export function getRepositories(): RepositoryBundle {
  if (!bundle) {
    bundle = {
      profile: new DexieProfileRepository(),
      weight: new DexieWeightRepository(),
      sleep: new DexieSleepRepository(),
      products: new DexieProductRepository(),
      meals: new DexieMealRepository(),
      foodLog: new DexieFoodLogRepository(),
      bodyMeasurements: new DexieBodyMeasurementRepository(),
      bioimpedance: new DexieBioimpedanceRepository(),
    };
  }
  return bundle;
}

export type { RepositoryBundle } from './interfaces';
