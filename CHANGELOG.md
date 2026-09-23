# Changelog

Схема версий:

- **MAJOR** — грандиозное (перекраивание концепции, big rewrite)
- **MINOR** — заметно изменилось (новая фича, новый экран, ощутимое улучшение)
- **PATCH** — мелкие правки (rename, тюнинг цвета, багфикс)

## [0.7.0] — 2026-09-16 · Обхваты тела, BF% и здоровье-маркеры

Первый релиз антропометрии. Приложение выходит за пределы «вес + активность»
и умеет считать композицию тела по швейной рулетке.

### Новый экран `/measurements`

- Форма ввода семи обхватов: шея, грудь, талия, попа, бицепс, бедро, икра.
  Опциональные поля — можно заполнять частично, минимум 1 значение.
- История замеров с датой и всеми значениями. Правка и удаление.
- Карточка **последний замер** — все обхваты одним блоком.
- Карточка **BF% (Navy formula)** — процент жира, LBM, масса жира.
  Считается автоматически если есть талия + шея (+ бёдра для Ж).

### Интеграция BF% в `/profile`

- **BMR автоматически переключается на Katch-McArdle**, когда есть BF%
  из последних обхватов (`getBFPercent` цепочка). Иначе — Mifflin-St Jeor.
- Плитка **Состав тела** — показывает BF%, LBM и жир в кг.
  Плитка **Обхваты** ушла из «дополнительно» и стала кликабельной,
  ведёт на `/measurements`.

### Секция «Здоровье-маркеры»

Три цветных индикатора на дашборде:

- **BMI** (вес/рост²) — норма 18.5–24.9.
- **WHR** (талия/попа) — риск сердечно-сосудистых. М < 0.90 / Ж < 0.85.
- **Талия/рост** — маркер висцерального жира. Норма < 0.50.

Каждый маркер — зелёный/жёлтый/красный по общепринятым порогам ВОЗ/NHS.
Показываются только при наличии соответствующих замеров.

### Секция «Размеры одежды»

Из обхватов автоматически: RU-размер верха (грудь), низа (талия М / попа Ж),
джинсы W (дюймы), воротник рубашки (шея). Alpha-размер (XS/S/M/L/XL) —
для верха.

### Библиотечные добавления

- `src/lib/nutrition/healthMarkers.ts` — `calcBMI` / `calcWHR` /
  `calcWaistToHeight` с типизированным `MarkerStatus`.
- `src/lib/nutrition/clothingSizes.ts` — `calcClothingSizes` по формулам
  из российской ГОСТ-сетки (`floorEven` округление).
- `src/lib/hooks/useAllMeasurements.ts` и `useLatestMeasurement.ts`.
- `src/components/BodyMeasurementModal.tsx` — многополевая модалка ввода.
- `DexieBodyMeasurementRepository` — раньше был заглушкой, теперь работает.

### Тесты

- +23 юнит-теста: `healthMarkers.test.ts` (13) + `clothingSizes.test.ts` (10).
- Всего в пакете 93 теста, все зелёные.

### Дизайн-система

- В `globals.css` добавлены семантические цвета `--success` и `--warning`
  в дополнение к `--danger` — для трёхстепенной индикации маркеров.

## [0.6.2] — 2026-09-13 · Тупики + валидация цели

Пойманы тупики, найденные при тестировании v0.6.1.

### Тупики UX

- **`/weight` — кнопка «+ новый замер»** прямо на странице, всегда видна.
  Раньше добавление веса было доступно только через плитку в `/profile`,
  а `/profile` без замеров редиректил на `/weight` → circular loop,
  ни там ни там нельзя было добавить.
- **`/weight` empty state** — если 0 замеров, текст «нажми "+ новый замер"»
  вместо мёртвого «пусто».

### Полный wipe при «начать заново»

- `profile.clear()` теперь стирает **все пользовательские таблицы**
  через транзакцию: `profile`, `weight_log`, `sleep_log`, `food_log`,
  `body_measurements`, `bioimpedance_snapshots`. Раньше оставались
  старые замеры → после нового онбординга поверх них новый замер,
  каша.

### Валидация цели в онбординге

- **`lose` требует `target < current`.** Ранее можно было сохранить
  «похудеть» с целью выше стартового веса.
- **`gain` требует `target > current`.** То же в обратную сторону.
- Красный inline-warning под полем сразу когда данные противоречат.
- «Далее» блокируется если противоречие.
- Дополнительный hint если указан вес без даты: «укажи дедлайн для
  расчёта темпа. Без даты — норма = TDEE, без плана».

### UI

- Empty state на `/profile` — кнопка «+ добавить замер» вместо «открыть /weight →».

## [0.6.1] — 2026-09-13 · Audit response — критично + защита от crash

Результат полной ревизии проекта. 27 расхождений с research зафиксированы,
9 приоритетных правок применены. Никаких новых фич — только правки.

### Критично (данные)

- **calcAge — таймзоны исправлены.** `YYYY-MM-DD` парсится как локальная
  дата, не UTC. Раньше в западных таймзонах давал off-by-one в день
  рождения → неправильный BMR → неправильная норма.
- **Safety floor: медицинский минимум по полу.** WHO/Cleveland Clinic:
  1500 ккал/сут М, 1200 ккал/сут Ж. Итоговый безопасный минимум =
  `max(BMR, medical_min)`. Раньше проверялся только BMR — у худой Ж
  с BMR 1150 warning не срабатывал.

### Защита от crash

- `/profile` empty state — если 0 замеров веса, показывается CTA
  «добавь первый замер», не бесконечный «загружаю…».
- `useProfile` guard — профили созданные до v0.6.0 (без `goal`)
  трактуются как «нет профиля» → редирект на онбординг.
- `adaptiveTDEEProvider` больше не `throw` — fallback на formulaic с
  меткой `confidence: 'accumulating'` и `source: 'adaptive'`.
  Заявленный DI-swap перестал крашить при пустых данных.

### Архитектура

- **`TDEE-provider через DI, не module-level.** `calcNutrition`принимает
опциональный`tdeeProvider`. Убран `activeTDEEProvider` export — был
  fake swap point. Downstream не зависит от module state.
- **`Goal.weeklyPaceKg` больше не хранится.** Всегда вычисляется в
  `calcTarget` из `targetWeight + targetDate + currentWeight`. Убирает
  риск staleness при частичных `updateField`.
- **`TargetResult` расширен**: `weeklyPaceKg`, `safeMinKcal`,
  `medicalMinKcal`, `bmrKcal`, `isGoalExpired`, `aggressiveLimitKg`
  всегда возвращается (не только при превышении).

### Dead code удалён

- `WeightEntry.hoursSinceLastMeal` — поле не писалось и не читалось.
- `PartialProfileDraft` — тип не использовался.

### UI-адаптация

- `/profile`, `/onboarding`, `GoalEditModal` — переведены на новую
  сигнатуру `calcTarget` (принимает `sex`), новую форму `TargetResult`.
  Все warning'и теперь показывают безопасный минимум с разбивкой
  (BMR vs медицинский).
- `GoalEditModal` теперь показывает **безопасный максимум темпа всегда**,
  не только при превышении.
- В hero-плашке `/profile` темп читается из `target.weeklyPaceKg`,
  не из `profile.goal.weeklyPaceKg` (которого больше нет).

### Тесты: 67 (было 61, +6)

- 6 новых для safety floor (мед. минимум М/Ж), calcAge (bug regression
  test для off-by-one), goal expired, adaptiveTDEE fallback.

### Docs

- `docs/data-schema.md` — синхронизирован (Goal без weeklyPaceKg,
  WeightEntry без hoursSinceLastMeal).

## [0.6.0] — 2026-09-13 · Цель + Weight tracking + BF% pipeline

Крупный релиз с проектированием на будущее: биоимпеданс и обхваты уже заложены в архитектуре nutrition-калькуляций, adaptive TDEE подключается свапом одной функции.

### Модель домена

- **Полный граф зависимостей** отражён в `docs/ideas.md` и `docs/data-schema.md`.
- Nutrition-калькуляции спроектированы с BF%-цепочкой fallback: **биоимпеданс > обхваты (Navy formula) > null**. Downstream не переписывается при появлении новых источников BF%.
- TDEE-provider интерфейс с pluggable реализациями. v0.6 — `formulaicTDEEProvider`, v0.9 — `adaptiveTDEEProvider`. Свап без переписывания UI.

### Схема

- `Profile.goal: Goal` — обязательное поле, задаётся 4-м шагом онбординга.
- `Goal { type, targetWeightKg?, targetDate?, weeklyPaceKg, createdAt }` — 5 типов: `hold | lose | gain | recomp | track`.
- `WeightContext` расширен до 6 значений: `morning-fasted | morning-post-meal | daytime | evening | post-workout | other`. Dexie v2 upgrade автомигрирует старые значения.
- В расчёты (weight_trend, BMR) идёт **только `morning-fasted`**.

### Nutrition lib

- **`src/lib/nutrition/bodyComposition.ts`** — `calcBFPercentFromNavy`, `getBFPercent` (priority chain), `calcLBM`. 9 тестов.
- **`src/lib/nutrition/bmr.ts`** — `calcBMRKatch` (Katch-McArdle), `calcBMRMifflin`, `calcBMR` селектор с source label. 5 тестов.
- **`src/lib/nutrition/weightTrend.ts`** — `calcWeightTrend` — 7-day weighted moving average на morning-fasted, min 3 entries, confidence label. 9 тестов.
- **`src/lib/nutrition/tdee.ts`** — `TDEEProvider` тип, `formulaicTDEEProvider`, `adaptiveTDEEProvider` заглушка, `activeTDEEProvider`. 3 теста.
- **`src/lib/nutrition/target.ts`** — `calcTarget(tdee, bmr, goal, currentWeight)` для 5 типов цели + `calcWeeklyPaceFromGoal`. 12 тестов.

### UI

- **Онбординг 4 шага**: Основа → Тело → Цель → Готово. Шаг 3 показывает live-расчёт daily target с warning'ами (agressive pace, safety floor).
- **`/weight`** — история замеров с фильтром «Все / ★ Утро натощак», edit + delete + hero-тренд с confidence label.
- **`/profile` перекроен**:
  - **Убран 3-диапазон hero TDEE** — вместо него **goal-based daily target** одна цифра.
  - Copy под hero объясняет откуда цифра (для цели X · дефицит/профицит Y ккал · темп Z кг/нед).
  - **BMR safety floor warning** — красная плашка **только** когда `goal='lose' AND target < BMR`.
  - **Aggressive pace warning** — оранжевая плашка когда pace > 1% массы тела/нед.
  - **BMI убран с primary дисплея** (нет edge к actionable output, дезинформирует без композиции).
  - Плитка «Цель» в сводке → клик → `GoalEditModal`.
  - Плитка «Вес» показывает **weight_trend** а не latest.
- **`GoalEditModal`** — модалка редактирования цели: type + targetWeight + date + live pace + warnings.
- Nav-pill «Вес» теперь линкует между `/profile` и `/weight`.

### Тесты: 61 (было 27, +34)

## [0.5.0] — 2026-09-13 · «золотая середина» профиля

Цель релиза: профиль с начальными данными готов на 100%. Каждый параметр можно править, каждая цифра — со смыслом.

### Добавлено

- **Переключатель темы** (`ThemeToggle`, Zustand-стор + localStorage) в шапке всех страниц (`/`, `/onboarding`, `/profile`).
  - `data-theme="dark"` на `<html>`, применяется inline-скриптом до рендера — нет flash of wrong theme.
  - Обе темы работают на всех страницах.
- **Редактирование любой плитки сводки** по клику через модалку `EditFieldModal`:
  - никнейм → text
  - пол → M/F
  - дата рождения → date
  - рост → number
  - активность → 5 вариантов
  - **вес → добавляет НОВУЮ запись** в `weight_log` с контекстом (натощак / после еды / вечером / другое), старые не теряются
  - На save → пересчёт BMR/TDEE автоматически.
- **BMR/BMI/TDEE с объяснением** — что делать с числом:
  - **TDEE** плюс 3 диапазона-подсказки: `удержать = N`, `похудеть = N × 0.85 (−15%)`, `набрать = N × 1.1 (+10%)`.
  - **BMR** карточка: «сжигаешь просто лёжа; не опускайся ниже при похудении».
  - **BMI** карточка: категория (норма/избыточный/…) + «не различает жир/мышцы — детализируется биоимпедансом».
- **Адаптивная CTA лендинга** (`LandingCTA`) — «Начать» → onboarding если профиля нет, «Продолжить» → profile если есть.
- **`useProfile.updateField(patch)`** — точечное обновление одного поля (для inline-редактора).

### Изменилось

- **Онбординг:** выбор пола М/Ж на шаге 1. `Profile.sex: 'M' | 'F'`. BMR корректно считает для обоих полов (Mifflin-St Jeor даёт `+5` для М, `−161` для Ж).
- **`/profile`:** 4 stat-карточки убраны, вместо них ОДНА «Сводка обо мне» из 8 плиток (основа: никнейм/пол/ДР+возраст; тело: рост/вес/активность; дополнительно: биоимпеданс/обхваты). Каждая — источник в meta, hover-hint, клик — редактор.
- **Тёмная тема** больше не хардкод `.theme-dark` на `/profile` — теперь через глобальный `data-theme`. Юзер решает, где какая.
- **Убрана «вода» на `/profile`**: снята прозаичная строка «Профиль сохранён локально… Дальше — начнём считать твой BMR, TDEE и рисовать модель». Теперь только actionable инфо.

### Исправлено

- Стартовый вес при онбординге попадает в `weight_log` (было в v0.4.0).
- Anti-flash of wrong theme на первом рендере.

## [0.4.0] — 2026-09-13

### Добавлено

- **Nutrition lib** (`src/lib/nutrition/`) — `calcAge`, `calcBMR` (Mifflin-St Jeor), `calcTDEE`, `ACTIVITY_COEFFICIENTS`, `ACTIVITY_LABELS`. 16 vitest-тестов.
- **`DexieWeightRepository`** — рабочая реализация всех методов (`add`, `latest`, `range`, `list`, `get`, `update`, `delete`).
- **`useLatestWeight()`** — React-хук для получения последнего замера веса.
- **`.theme-dark`** — CSS-класс для переопределения палитры на тёмную. Пока используется на `/profile`, дальше — как первый пресет мультитем.

### Изменилось

- **Profile schema:** убран `postureLevel` (был не нужен для главной задачи — просчёта калорий). Добавлен `activityLevel: 'sedentary'|'light'|'medium'|'high'|'very_high'` — используется для TDEE.
- **Онбординг Step 2:** вместо слайдера осанки — 5-вариантный выбор активности с описаниями и множителями (× 1.2 / 1.375 / 1.55 / 1.725 / 1.9).
- **Онбординг Step 3:** превью с рассчитанной **дневной нормой калорий (TDEE)** большими цифрами + BMR + возраст. На сохранении: `Profile` в `profile` + первый `WeightEntry` в `weight_log`.
- **`/profile` полностью перекроен** под тёмный refined-стиль (референс `_.jpeg`):
  - Верхняя пилюля-навбар (Профиль / Еда / Вес / Модель).
  - Hero-карточка «дневная норма» с гигантским TDEE.
  - Сайдбар «сводка» — BMR, возраст, активность, обновлено.
  - Row из 4 stat-cards — рост, вес, BMI, пол.
  - «Что дальше» — 3 плейсхолдера (логировать еду, замеры веса, 3D-модель).
- **`docs/data-schema.md`:** отражены изменения Profile.

### Исправлено

- Стартовый вес при онбординге теперь попадает в `weight_log` (раньше терялся).

## [0.3.0] — 2026-09-13

### Добавлено

- **`/onboarding`** — 3-шаговая форма знакомства (Основа → Тело → Готово):
  - Шаг 1: никнейм + дата рождения.
  - Шаг 2: рост, вес, осанка (слайдер 0-1).
  - Шаг 3: превью данных + сохранение.
  - Валидация полей на переход между шагами.
  - Дизайн по референсу `Insurance Projects`: белая карточка, оранжевые blob'ы (`OnboardingBlobs`), progress-stepper с активными/пройденными состояниями.
  - Сохранение через `useProfile().save()` → редирект на `/profile`.
- **`/profile`** — минимальный дашборд после входа:
  - «Привет, {никнейм}» + карточки основных данных (никнейм, возраст, рост, осанка).
  - Секция «Что дальше» с 3 плейсхолдерами (замерить вес, записать сон, открыть модель).
  - Кнопка «начать заново» → `profile.clear()` + редирект.
  - Автоматический редирект на `/onboarding` если профиля нет.
- **`OnboardingBlobs`** — декоративный фон из 5 оранжевых пятен, `mix-blend-mode: multiply`, respect `prefers-reduced-motion`.
- **`.input` и `.posture-slider`** — стилизованные form-controls.

### Изменилось

- Лендинг: обе CTA-кнопки («Начать» в hero, «Задать параметры» в финальной полосе) теперь `<Link>` на `/onboarding`.

## [0.2.1] — 2026-09-13

### Изменилось

- **Лендинг перекроен** под маркетинг-роль (до входа в приложение):
  - Убраны пустые метрики-плейсхолдеры (не для гостя, а для дашборда).
  - Добавлена `HeroPreviewCard` — glass-мокап справа от заголовка: силует 3D-модели + строчки метрик + плашка «подсказка». Референс — `_.jpeg` / `_ (1).jpeg`.
  - Секция «Как это работает» — три шага (01/02/03).
  - Секция «Что внутри» — 4 карточки с реальными фичами (local-first, без квестов, data-driven, офлайн).
  - Финальная тёмная CTA-полоса «Твоя игра. Твои правила.»

### Добавлено

- `docs/theming.md` — план мультитем на v2+ (пресеты `warm-paper` / `dark-refined` / `high-contrast` / `playground`, реализация через `data-theme` + переменные).

## [0.2.0] — 2026-09-13

### Изменилось

- **Шрифт display:** Playfair Display → **Bricolage Grotesque** (variable, opsz/wdth axes). Менее «журнально-литературно», более современный grotesque.
- **Акцент:** унифицирован в один `#E85D2F` (жжёный оранж). Убран конфликт оранжевый italic + красная точка.
- **Фон:** усилена амплитуда движения (волны 30 → 110 px, halo 4vmax → 8vmax), добавлен 4-й halo, короче циклы (32s → 22s), scale+opacity дыхание для «переливающегося» ощущения.
- **Мобильная адаптация:** метрики 1 колонка → 2 колонки на sm, hero-кегль ужат под маленькие экраны, sidebar-marginalia скрыт на мобилке.

### Добавлено

- **`DexieProfileRepository`** — рабочая реализация: `getCurrent/save/update/clear`. Хранение под фиксированным id `'me'` (single-player MVP).
- **`useProfile()`** — React-хук для UI-стороны: `profile / loading / error / save / clear / refresh`.
- Git remote `origin` → `https://github.com/RuDeNoID814/MyLife-AI.git`.

## [0.1.0] — 2026-09-12

### Добавлено

- **Home page** (editorial arrival): display-заголовок, italic-акцент, 4 пустых метрики-плейсхолдера (вес/сон/еда/тело), нижняя строка принципов.
- **`TopographyAmbient`** — SVG с контурными волнами + мягкие радиальные хало.
- **Дизайн-система:** палитра `paper/ink/accent`, типографика через CSS `@import` (без билд-тайм сетевых запросов).

## [0.0.1] — 2026-09-12

### Setup

- Next.js 15 (App Router, static export), React 19, TypeScript strict, Tailwind 4.
- Three.js + @react-three/fiber + @react-three/drei, Zustand, Dexie.
- Vitest (jsdom UI + node lib), Prettier, ESLint (FlatCompat).
- Заглушки: Dexie schema (8 таблиц), интерфейсы всех репозиториев, пустые Dexie-реализации.
- Docs: vision, mvp-scope, tech-stack, data-schema, body-model-spec, formulas.
- Референсы модели тела в `docs/references/body-model/`, референсы сайта в `docs/references/site-model/`.
