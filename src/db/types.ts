export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'medium'
  | 'high'
  | 'very_high';

export type Sex = 'M' | 'F';

export type GoalType =
  | 'hold'      // удержать вес
  | 'lose'      // похудеть
  | 'gain'      // набрать
  | 'recomp'    // рекомпозиция (жир → мышцы, вес ~ TDEE − 200)
  | 'track';    // трек без плана изменения

export type Goal = {
  type: GoalType;
  targetWeightKg?: number;    // для lose/gain
  targetDate?: string;         // ISO date, опц.
  createdAt: string;
  // weeklyPaceKg НЕ хранится — вычисляется в calcTarget из target+date+currentWeight
};

export type Profile = {
  id: string;
  nickname: string;
  sex: Sex;
  dateOfBirth: string;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;                  // обязательное с v0.6.0, задаётся 4-м шагом онбординга
  createdAt: string;
  updatedAt: string;
};

export type WeightContext =
  | 'morning-fasted'      // эталон: утро, натощак, после туалета
  | 'morning-post-meal'   // утро после еды/воды
  | 'daytime'             // день, шум
  | 'evening'             // вечер, большой шум
  | 'post-workout'        // после тренировки, обезвоживание
  | 'other';

export type WeightEntry = {
  id: string;
  timestamp: string;
  kg: number;
  context: WeightContext;
  notes?: string;
};

export type SleepEntry = {
  id: string;
  sleepStart: string;
  sleepEnd: string;
  qualityNote?: string;
};

export type Product = {
  id: string;
  name: string;
  barcode?: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  createdAt: string;
};

export type MealIngredient = {
  productId: string;
  grams: number;
};

export type Meal = {
  id: string;
  name: string;
  ingredients: MealIngredient[];
  totalWeightG: number;
  computedKcalPer100g: number;
  computedProteinPer100g: number;
  computedCarbsPer100g: number;
  computedFatPer100g: number;
  createdAt: string;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodEntrySource = {
  sourceType: 'product' | 'meal';
  sourceId: string;
  grams: number;
};

export type FoodEntry = {
  id: string;
  timestamp: string;
  mealType: MealType;
  entries: FoodEntrySource[];
};

export type BodyMeasurement = {
  id: string;
  timestamp: string;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  bicepCm?: number;
  thighCm?: number;
  neckCm?: number;
  calfCm?: number;
};

export type BioimpedanceSnapshot = {
  id: string;
  timestamp: string;
  fatPercent?: number;
  musclePercent?: number;
  waterPercent?: number;
  visceralFat?: number;
  boneMassKg?: number;
  metabolicAgeYears?: number;
};
