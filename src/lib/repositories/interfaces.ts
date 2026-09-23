import type {
  Profile,
  WeightEntry,
  SleepEntry,
  Product,
  Meal,
  FoodEntry,
  BodyMeasurement,
  BioimpedanceSnapshot,
} from '@/db/types';

export interface Repository<T> {
  add(entry: T): Promise<string>;
  get(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  update(id: string, patch: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}

export type ProfileDraft = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProfileRepository {
  getCurrent(): Promise<Profile | null>;
  save(draft: ProfileDraft): Promise<string>;
  update(id: string, patch: Partial<ProfileDraft>): Promise<void>;
  clear(): Promise<void>;
}

export interface WeightRepository extends Repository<WeightEntry> {
  latest(): Promise<WeightEntry | null>;
  range(fromIso: string, toIso: string): Promise<WeightEntry[]>;
}

export interface SleepRepository extends Repository<SleepEntry> {
  latest(): Promise<SleepEntry | null>;
  range(fromIso: string, toIso: string): Promise<SleepEntry[]>;
}

export interface ProductRepository extends Repository<Product> {
  findByBarcode(barcode: string): Promise<Product | null>;
  searchByName(query: string): Promise<Product[]>;
}

export interface MealRepository extends Repository<Meal> {
  searchByName(query: string): Promise<Meal[]>;
}

export interface FoodLogRepository extends Repository<FoodEntry> {
  range(fromIso: string, toIso: string): Promise<FoodEntry[]>;
  byDay(dateIso: string): Promise<FoodEntry[]>;
}

export interface BodyMeasurementRepository extends Repository<BodyMeasurement> {
  latest(): Promise<BodyMeasurement | null>;
  range(fromIso: string, toIso: string): Promise<BodyMeasurement[]>;
}

export interface BioimpedanceRepository extends Repository<BioimpedanceSnapshot> {
  latest(): Promise<BioimpedanceSnapshot | null>;
  range(fromIso: string, toIso: string): Promise<BioimpedanceSnapshot[]>;
}

export interface RepositoryBundle {
  profile: ProfileRepository;
  weight: WeightRepository;
  sleep: SleepRepository;
  products: ProductRepository;
  meals: MealRepository;
  foodLog: FoodLogRepository;
  bodyMeasurements: BodyMeasurementRepository;
  bioimpedance: BioimpedanceRepository;
}
