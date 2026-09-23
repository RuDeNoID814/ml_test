# Data Schema (v1)

Все данные — в IndexedDB через Dexie. Ключи `id` — UUID (`crypto.randomUUID()`).

## Таблицы

### profile
Одна запись на пользователя.
```ts
type Sex = 'M' | 'F'

type ActivityLevel =
  | 'sedentary'   // 1.2  — офис
  | 'light'       // 1.375 — 1–3 тренировки/нед
  | 'medium'      // 1.55  — 3–5 тренировок/нед
  | 'high'        // 1.725 — 6–7 тренировок/нед
  | 'very_high'   // 1.9   — физическая работа + спорт

type GoalType =
  | 'hold'      // удержать вес
  | 'lose'      // похудеть
  | 'gain'      // набрать
  | 'recomp'    // рекомпозиция (жир → мышцы, вес +/- 200 ккал от TDEE)
  | 'track'     // просто трек, без плана изменения веса

type Goal = {
  type: GoalType
  targetWeightKg?: number   // для lose/gain
  targetDate?: string       // ISO date, опц.
  createdAt: string
  // weeklyPaceKg НЕ хранится — вычисляется в calcTarget
  //   из targetWeight + targetDate + currentWeight на лету.
  //   Убирает риск staleness при частичных updateField.
}

type Profile = {
  id: string
  nickname: string
  sex: Sex
  dateOfBirth: string       // ISO date, YYYY-MM-DD
  heightCm: number
  activityLevel: ActivityLevel  // используется для TDEE_formulaic
  goal: Goal                    // обязательное, ставится 4-м шагом онбординга
  createdAt: string
  updatedAt: string
}

// Вес — не в Profile, а в weight_log отдельными замерами.
// При онбординге создаётся первая запись context: 'morning-fasted'.
// BMR/TDEE — не хранятся, считаются на лету через lib/nutrition с fallback-цепочкой.
```

### weight_log
```ts
type WeightContext =
  | 'morning-fasted'      // эталон: утро, натощак, после туалета
  | 'morning-post-meal'   // утро после еды/воды
  | 'daytime'             // день, шум
  | 'evening'             // вечер, самый большой шум
  | 'post-workout'        // после тренировки, обезвоживание
  | 'other'

type WeightEntry = {
  id: string
  timestamp: string      // ISO datetime
  kg: number
  context: WeightContext
  notes?: string
  // hoursSinceLastMeal удалён в v0.6.1 — не писался и не читался.
  // Контекст замера полностью покрывается WeightContext + timestamp.
}

// В расчёты (weight_trend, BMR) идёт ТОЛЬКО `morning-fasted`.
// Остальные контексты — для истории и информации.
// weight_trend = 7-day weighted moving average на morning-fasted, min 3 entries.
// Пока entries < 3 → используется latest morning-fasted (или всех если нет).
```

### sleep_log
```ts
type SleepEntry = {
  id: string
  sleepStart: string     // ISO datetime, когда лёг
  sleepEnd: string       // ISO datetime, когда проснулся
  qualityNote?: string
}
```

### products
Локальный справочник продуктов, вводится вручную.
```ts
type Product = {
  id: string
  name: string
  barcode?: string       // на v2, пока опционально
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  createdAt: string
}
```

### meals
Пользовательские блюда: список ингредиентов + итоговый вес → автоматически вычисляется калорийность на 100 г.
```ts
type Meal = {
  id: string
  name: string
  ingredients: {
    productId: string
    grams: number
  }[]
  totalWeightG: number          // финальный вес готового блюда
  computedKcalPer100g: number   // (∑ kcal * grams / 100) / totalWeightG * 100
  computedProteinPer100g: number
  computedCarbsPer100g: number
  computedFatPer100g: number
  createdAt: string
}
```

### food_log
```ts
type FoodEntry = {
  id: string
  timestamp: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  entries: {
    sourceType: 'product' | 'meal'
    sourceId: string
    grams: number
  }[]
}
```

### body_measurements (заглушка v1, наполняется в v2)
```ts
type BodyMeasurement = {
  id: string
  timestamp: string
  chestCm?: number
  waistCm?: number
  hipCm?: number
  bicepCm?: number
  thighCm?: number
  neckCm?: number
  calfCm?: number
}
```

### bioimpedance_snapshots (заглушка v1)
```ts
type BioimpedanceSnapshot = {
  id: string
  timestamp: string
  fatPercent?: number
  musclePercent?: number
  waterPercent?: number
  visceralFat?: number
  boneMassKg?: number
  metabolicAgeYears?: number
}
```

## Индексы Dexie

```ts
db.version(1).stores({
  profile: 'id',
  weight_log: 'id, timestamp',
  sleep_log: 'id, sleepStart',
  products: 'id, name, barcode',
  meals: 'id, name',
  food_log: 'id, timestamp, mealType',
  body_measurements: 'id, timestamp',
  bioimpedance_snapshots: 'id, timestamp',
})

// v0.6.0 — миграция WeightContext значений
db.version(2).upgrade(async (tx) => {
  await tx.table('weight_log').toCollection().modify((e: any) => {
    if (e.context === 'fasted') e.context = 'morning-fasted'
    else if (e.context === 'post-meal') e.context = 'morning-post-meal'
    // 'evening' и 'other' остаются как есть
  })
})
```

## BF%-цепочка для BMR/TDEE

Nutrition-калькуляции ищут BF% с приоритетом:

```
BF%_active = coalesce(
  bioimpedance_snapshots.latest.fatPercent,   // прямой замер, высший приоритет
  navyFormula(body_measurements.latest),      // талия + шея (+ бёдра для Ж), средний
  null                                         // fallback → Mifflin без BF%
)
```

Downstream:
- `BF% !== null` → LBM = weight × (1 − BF%/100) → BMR_katch = 370 + 21.6 × LBM_kg
- `BF% === null` → BMR_mifflin = 10·вес + 6.25·рост − 5·возраст ± 5/−161

BMR помечается source-label:
- `'katch-mcardle'` + `bfSource: 'bioimpedance' | 'navy'`
- `'mifflin-st-jeor'` — по умолчанию

## TDEE-provider интерфейс

```ts
type TDEEProvider = (input: {
  profile: Profile
  weightTrend: number
  bmr: number
  foodLog?: FoodEntry[]  // для adaptive
  weightHistory?: WeightEntry[]  // для adaptive
}) => {
  value: number
  source: 'formulaic' | 'adaptive'
  confidence: 'accumulating' | 'ready'
}
```

- **v0.6.0**: `formulaicTDEEProvider` = BMR × activityCoef. Confidence всегда 'ready'.
- **v0.9.0**: `adaptiveTDEEProvider` — back-calculating из food + weight за 14+ дней. Confidence 'accumulating' первые 14 дней, потом 'ready'. Свапается на месте formulaic без переписывания downstream.

## Repository интерфейсы

Каждая таблица имеет свой репозиторий с базовым набором методов. Пример:

```ts
interface Repository<T> {
  add(entry: T): Promise<string>
  get(id: string): Promise<T | null>
  list(): Promise<T[]>
  update(id: string, patch: Partial<T>): Promise<void>
  delete(id: string): Promise<void>
}

interface WeightRepository extends Repository<WeightEntry> {
  latest(): Promise<WeightEntry | null>
  range(fromIso: string, toIso: string): Promise<WeightEntry[]>
}
```

Файлы:
- `/lib/repositories/interfaces.ts` — все интерфейсы
- `/lib/repositories/dexie/*.ts` — реализация под Dexie
- `/lib/repositories/index.ts` — фабрика, возвращающая нужную реализацию (сейчас Dexie, в мобильной сборке — SQLite-адаптер)

## Экспорт / импорт
- Экспорт всей БД в JSON-файл — простая функция, дампит все таблицы
- Импорт — валидирует структуру, перезаписывает БД
- Использовать для бэкапа до появления синхронизации в v2
