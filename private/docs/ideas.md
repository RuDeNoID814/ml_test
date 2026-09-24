# Идеи и план

Всё что запланировано, но ещё не сделано. Отсортировано по приоритету.
Когда что-то закрыто → перенести в [`docs/done.md`](done.md) с указанием версии.

Легенда: **P0** — блокер MVP · **P1** — важно для «золотой середины» · **P2** — нужно позже · **P3** — идеи-заготовки.

---

## Модель домена (единая для всех версий)

Nutrition-калькуляции проектируем сразу с расчётом на биоимпеданс и обхваты. BF% имеет цепочку fallback:

```
INPUTS                                COMPUTED (fallback chain)                       DISPLAYED
──────                                ──────────────────────────                      ─────────

sex, DoB, heightCm ──────► age
weight_entries[] (context)─► weight_trend (7-day WMA на morning-fasted, min 3)

biompedance_snapshots[] ─► BF%_bi (fatPercent)              ┐
body_measurements[]     ─► BF%_navy (waist,neck,hip формула)┼─► BF%_active = coalesce(BF%_bi, BF%_navy, null)
                                                             ┘        ▲ приоритет: bi > navy > null
                                                                       │
                                                             LBM = weight × (1 − BF%_active/100) [if BF%]
                                                                       │
                                                             BMR = katchMcArdle(LBM) [«уточнён»]
                                                                   else mifflinStJeor(...) [«по умолчанию»]

activityLevel + BMR ──────► TDEE_formulaic = BMR × coef
                            ═══► SWAP-IN: TDEE_adaptive(food_log, weight_trend, 14d)
                                 [v0.9+, одна функция, интерфейс TDEE-provider]

goal (type, pace, target) ─► calcTarget(TDEE_active, goal, weight_trend)
                                       │
                                       ├─► /profile «твоя норма»
                                       ├─► /home полоса «съедено / target»
                                       └─► /food калорийная полоса (зелёный/жёлтый/красный)

BMR ──► safety_floor: показать красный warning если goal='lose' AND target < BMR
BMI ──► HIDDEN в v0.6+ (нет edge к actionable output, дезинформирует без композиции)
```

### Схема Profile — обновление v0.6.0

```ts
type Profile = {
  id, nickname, sex, dateOfBirth, heightCm, activityLevel,
  goal: Goal,                    // ← НОВОЕ обязательное
  createdAt, updatedAt,
}

type Goal = {
  type: 'hold' | 'lose' | 'gain' | 'recomp' | 'track',
  targetWeightKg?: number,
  targetDate?: string,           // ISO date
  weeklyPaceKg: number,          // вычисляется из target+date ИЛИ ввод
  createdAt: string,
}
```

BF% источники — таблицы `bioimpedance_snapshots` + `body_measurements` (уже в схеме). В Profile НЕ дублируются — читаются как latest snapshot из своих таблиц.

### Схема WeightContext — расширение v0.6.0

Было: `'fasted' | 'post-meal' | 'evening' | 'other'`
Стало: `'morning-fasted' | 'morning-post-meal' | 'daytime' | 'evening' | 'post-workout' | 'other'`

Миграция Dexie v1 → v2 автомигрирует существующие записи.

**Для расчётов (weight_trend, BMR) используется ТОЛЬКО `morning-fasted`.** Остальные контексты для истории и информации.

---

## В работе

_ничего_

---

## P0 — v0.6.0 (Goal + Weight tracking)

### Пакет 1 — Weight tracking (фундамент)

- [ ] **Расширить `WeightContext`** до 6 значений + Dexie миграция v1→v2 (context values автопереименование).
- [ ] **`calcWeightTrend(entries, windowDays=7, minEntries=3)`** — фильтр `morning-fasted`, weighted moving average (newer = 1.0, oldest = 0.3), fallback на latest. Тесты в vitest.
- [ ] **`/weight` страница** — dark refined:
  - Список замеров, newest first
  - Фильтр: «всё / только эталон (morning-fasted)»
  - Клик по замеру → редактор (переиспользуем `EditFieldModal`)
  - Кнопка удаления с confirm
- [ ] **EditFieldModal** — обновить weight-редактор до 6 контекстов.

### Пакет 2 — Goal + BF% pipeline

- [ ] **Схема Goal + Profile.goal** в `db/types.ts`.
- [ ] **Nutrition lib расширение**:
  - `getBFPercent(sources)` — coalesce chain: bi > navy > null
  - `calcBFPercentFromNavy({sex, waistCm, neckCm, hipCm?, heightCm})` — US Navy формула
  - `calcLBM(weightKg, bfPercent)`
  - `calcBMRKatch(lbmKg)` — Katch-McArdle
  - `calcBMR(input)` — селектор Katch vs Mifflin с source label
  - **TDEE provider интерфейс**: `type TDEEProvider = (profile, weightTrend) => { value: number; source: 'formulaic' | 'adaptive'; confidence: 'accumulating' | 'ready' }`
  - `formulaicTDEEProvider` — v0.6.0 стартовая реализация
  - Заглушка `adaptiveTDEEProvider` (throws — свапаем в v0.9)
  - `calcTarget(tdee, goal, currentWeight)` — daily target по типу цели
  - `calcSafeMinTarget(bmr, goal)` — safety floor
- [ ] **`/goal` НЕ ОТДЕЛЬНАЯ страница** — цель = **4-й шаг онбординга**, атомарный save всего пакета.
- [ ] **Онбординг 4-й шаг**:
  - Тип цели (5 кнопок)
  - Если lose/gain/recomp → блок «целевой вес + дедлайн» → live-расчёт weeklyPace
  - Warning если pace > 1% массы тела/нед
  - Warning если target < BMR (red)
- [ ] **Редактирование цели с `/profile`** — плитка «Цель» → модалка (тот же UI что 4-й шаг онбординга).

### Пакет 3 — /profile перекрой

- [ ] **Удалить 3-диапазон hero** (raw TDEE больше не показывается).
- [ ] **Новый hero: «твоя дневная норма»** — `calcTarget()` результат. Одна цифра, подпись «для цели X».
- [ ] **BMR safety floor** — показывается только `goal='lose' AND target < BMR` как красный warning под hero.
- [ ] **BMI убрать с primary дисплея**. В «сводке обо мне» тоже спрятать до появления BF%.
- [ ] **Индикатор confidence** для TDEE:
  - `confidence: 'accumulating'` → «накопление данных, точность повышается по мере логгирования» (в v0.6 не срабатывает — но интерфейс готов)
  - `confidence: 'ready'` → нормальное отображение
- [ ] **Спарклайн веса** отложен в v0.6.1 (нужен chart компонент).

### v0.6.1 — доработка

- [ ] Chart компонент (SVG line chart с dots + trend line).
- [ ] `/weight` — большой график.
- [ ] `/profile` — мини-спарклайн последних 14 дней.
- [ ] Пересчёт цели при существенном изменении weight_trend (> 0.5 кг) — banner «твой тренд сместился, обнови цель?».

---

## P1 — v0.7.0+ (Еда, ядро)

### v0.7.0 — /food

- [ ] Локальный справочник продуктов — ручной ввод (название, ккал/100г, Б/Ж/У).
- [ ] Конструктор блюд — ингредиенты + итоговый вес → авто-расчёт ккал/100г готового.
- [ ] Дневной лог — таймлайн по типам приёма (завтрак/обед/ужин/перекус).
- [ ] Цветная полоса «съедено / target»: зелёная 0-90%, жёлтая 90-100%, красная 100%+.
- [ ] История дневников по датам.

### v0.8.0 — /home дневной дашборд

- [ ] Съедено сегодня + target + полоса.
- [ ] Последний вес + weight_trend + недельный тренд.
- [ ] Последний сон (если есть).
- [ ] Quick add: `+ вес`, `+ еда`, `+ сон`.
- [ ] Навигация → /profile, /food, /weight, /goal.
- [ ] После онбординга редирект на `/home`.

### v0.9.0 — Adaptive TDEE + Сон

- [ ] `adaptiveTDEEProvider` — реальная реализация (Macrofactor-style back-calculation из food_log + weight_trend за 14+ дней).
- [ ] Индикатор confidence переключается на 'ready' после 14 дней данных.
- [ ] Логгирование сна (события засыпание / пробуждение).
- [ ] Расчёт длительности сна + среднее за неделю.
- [ ] `/sleep` — история + график.

### v1.0.0 — MVP закрыт

- [ ] Автор использует приложение 7 дней подряд без багов, блокирующих логгирование или отображение.
- [ ] Все критерии из [`docs/mvp-scope.md`](mvp-scope.md) выполнены.

---

## P2 — После MVP (1.x)

### v1.1.x — Обхваты (BF% via Navy)

- [ ] Форма ввода обхватов (талия, шея, для Ж — бёдра).
- [ ] `calcBFPercentFromNavy` подключается к BF%-chain как средний приоритет.
- [ ] BMR автоматически переходит на Katch-McArdle. Label «уточнён по обхватам».
- [ ] На `/profile` появляется secondary плитка «Композиция (грубо)».

### v1.2.x — Биоимпеданс

- [ ] Форма ввода биоимпеданса (жир %, мышцы %, вода %, висцеральный, костная, метаболический возраст).
- [ ] `getBFPercent` использует биоимпеданс как высший приоритет.
- [ ] Karth-McArdle BMR становится ещё точнее.
- [ ] Плитка «Композиция (точно)» — полная разбивка.

### v1.3.x — Data-driven подсказки

- [ ] Движок правил в конфиге (JSON или TS).
- [ ] 5-10 стартовых правил (сон + вес + еда взаимосвязи).
- [ ] Нейтральный тон, никаких «молодец / плохо».

### v2.x — 3D-модель, женская модель, мультитемы, экспорт/импорт

_детали в [`docs/mvp-scope.md`](mvp-scope.md) и [`docs/body-model-spec.md`](body-model-spec.md)_

---

## P3 — Дальние идеи, без обязательств

- Публичный лендинг + документация
- Штрихкоды продуктов через Open Food Facts
- Фотофиксация «спереди / сбоку / сзади» с интерактивной рамкой
- Сравнение «до / после» слайдером времени
- 360° поворот 3D-модели
- Дополнительные морфы (икры, шея, толщина запястья)
- Auth + облачная БД (Supabase)
- Синхронизация между устройствами
- PWA-манифест + install prompt
- Мобильная сборка через Capacitor
- Голосовой ввод для быстрого логгирования
- Push уведомления «пора взвеситься утром»

---

## Дизайн-долг

- [ ] Landing тексты (Как работает / Что внутри) — освежить под текущий scope
- [ ] Убрать hardcoded `v0.5` в шапках — читать из package.json / env
- [ ] Общий компонент `Frame`/`Card`
- [ ] `bmiCategory` вынести в nutrition lib (дублируется)
- [ ] Loading skeleton вместо «загрузка…»
- [ ] Проверить мобилку на 375×812, 390×844, 414×896

---

## Закрытые вопросы

- ~~Постура на онбординге~~ — убрана в v0.4.0, нет edge к actionable output, вернём когда появится 3D-модель.
- ~~Женская 3D-модель~~ — до появления M-модели вопрос не стоит.
- ~~Голосовой ввод~~ — P3, не приоритет.
- ~~Уведомления~~ — против event-driven принципа, отложены в P3.
- ~~BMI на /profile~~ — HIDDEN в v0.6+ (нет edge к actionable output, дезинформирует).
- ~~TDEE как самоцель на /profile~~ — HIDDEN в v0.6+ (заменяется daily_calorie_target).
