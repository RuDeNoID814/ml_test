import Dexie, { type Table } from 'dexie';
import type {
  Profile,
  WeightEntry,
  SleepEntry,
  Product,
  Meal,
  FoodEntry,
  BodyMeasurement,
  BioimpedanceSnapshot,
} from './types';

export class LifeGameDB extends Dexie {
  profile!: Table<Profile, string>;
  weight_log!: Table<WeightEntry, string>;
  sleep_log!: Table<SleepEntry, string>;
  products!: Table<Product, string>;
  meals!: Table<Meal, string>;
  food_log!: Table<FoodEntry, string>;
  body_measurements!: Table<BodyMeasurement, string>;
  bioimpedance_snapshots!: Table<BioimpedanceSnapshot, string>;

  constructor() {
    super('lifegame');
    this.version(1).stores({
      profile: 'id',
      weight_log: 'id, timestamp',
      sleep_log: 'id, sleepStart',
      products: 'id, name, barcode',
      meals: 'id, name',
      food_log: 'id, timestamp, mealType',
      body_measurements: 'id, timestamp',
      bioimpedance_snapshots: 'id, timestamp',
    });

    // v0.6.0 — миграция WeightContext значений
    this.version(2)
      .stores({})
      .upgrade(async (tx) => {
        await tx
          .table('weight_log')
          .toCollection()
          .modify((e: { context?: string }) => {
            if (e.context === 'fasted') e.context = 'morning-fasted';
            else if (e.context === 'post-meal') e.context = 'morning-post-meal';
          });
      });
  }
}

let instance: LifeGameDB | null = null;

export function getDB(): LifeGameDB {
  if (!instance) instance = new LifeGameDB();
  return instance;
}
