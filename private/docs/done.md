# Готово

Что реально в мастере, сверху вниз по версиям.
Полный технический changelog — в [`CHANGELOG.md`](../CHANGELOG.md).
Что в планах — [`docs/ideas.md`](ideas.md).

---

## v0.6.0 — Цель + Weight tracking + BF% pipeline (13.09.2026)

**Тег:** `v0.6.0`

### Модель домена
- Полный граф зависимостей отражён в docs. Проектирование сразу под биоимпеданс и обхваты (через BF% цепочку fallback: bioimpedance > navy > null).
- TDEE-provider интерфейс с pluggable реализациями. Formulaic сейчас, adaptive — свапом функции в v0.9.

### Схема
- `Profile.goal` — обязательное, 4-м шагом онбординга.
- `Goal` 5 типов: hold / lose / gain / recomp / track.
- `WeightContext` 6 значений. Dexie v2 миграция.

### Nutrition lib (34 новых теста)
- `bodyComposition` — Navy formula, LBM, BF% chain.
- `bmr` — Katch-McArdle селектор.
- `weightTrend` — 7-day WMA на morning-fasted.
- `tdee` — provider интерфейс + formulaic + adaptive заглушка.
- `target` — calcTarget для 5 целей + safety floor + aggressive pace.

### UI
- Онбординг 4 шага (Цель как 4-й).
- `/weight` — история + фильтр + edit + delete + hero-тренд.
- `/profile` перекроен: goal-based hero, BMR только safety floor, BMI убран, плитка Цель, GoalEditModal.
- Nav «Вес» линкует между `/profile` и `/weight`.

---

## v0.5.0 — «золотая середина» профиля (13.09.2026)

**Тег:** `v0.5.0` · **коммит:** `d0a0d46`

### Профиль редактируем
- Клик по любой плитке сводки → модалка `EditFieldModal`.
- Никнейм / пол / ДР / рост / активность → правится через `useProfile.updateField(patch)`.
- Вес → **новая запись** в `weight_log` с контекстом. Старые не теряются.
- BMR/TDEE пересчитывается автоматически после правки.

### Объяснения цифр
- **TDEE hero** + 3 диапазона (удержать / −15% / +10%). _Уже неверно, будет заменено в 0.6.0 на цель-центричный подход._
- **BMR-карточка** с описанием «сжигаешь просто лёжа, minimum для дефицита».
- **BMI-карточка** с категорией + оговоркой про биоимпеданс.

### Инфраструктура тем
- `useThemeStore` (Zustand) + localStorage персист.
- `ThemeToggle` — sun/moon кнопка в шапке всех страниц.
- `data-theme="dark"` на `<html>`, inline-скрипт до рендера — anti-flash.
- `:root[data-theme='dark']` переопределяет палитру.

### Лендинг
- `LandingCTA` client-компонент: адаптивная CTA «Начать» / «Продолжить» в зависимости от наличия профиля.
- Убрана «вода» из копирайта на `/profile`.

---

## v0.4.0 — просчёт калорий (13.09.2026)

**Тег:** `v0.4.0` · **коммит:** `f3060a2`

- **Nutrition lib**: `calcAge`, `calcBMR` (Mifflin-St Jeor М+Ж), `calcTDEE`, `ACTIVITY_COEFFICIENTS`. **16 unit-тестов**.
- **`DexieWeightRepository`** — все методы (add / latest / range / list / get / update / delete).
- **`useLatestWeight()`** — React-хук.
- **Профиль сохраняется + первый WeightEntry в `weight_log`** при онбординге.
- **Схема**: убран `postureLevel`, добавлен `activityLevel: sedentary|light|medium|high|very_high`.
- **Онбординг Step 2**: выбор активности вместо слайдера осанки.
- **`/profile` тёмный refined** по референсу `_.jpeg`.
- `Profile.sex: 'M' | 'F'` (сначала было `'M'`, потом расширено).

---

## v0.3.0 — онбординг + профиль-заглушка (13.09.2026)

**Тег:** `v0.3.0` · **коммит:** `1b1394c`

- **`/onboarding`** — 3-шаговая форма знакомства (Основа → Тело → Готово).
- **`OnboardingBlobs`** — оранжевые blob'ы (референс `Insurance Projects`).
- **Прогресс-stepper** — 3 состояния (активный / пройденный / впереди).
- **Сохранение через `useProfile().save()`** → редирект на `/profile`.
- **`/profile` минимальная страница** — Привет + карточки данных.
- **CTA лендинга** линкуется на `/onboarding`.

---

## v0.2.1 — рекомпозиция лендинга (13.09.2026)

**Тег:** `v0.2.1` · **коммит:** `608213d`

- **`HeroPreviewCard`** — glass-мокап справа от заголовка (силует 3D + метрики + подсказка).
- **Секция «Как это работает»** — 01 / 02 / 03 шаги.
- **Секция «Что внутри»** — 4 карточки принципов.
- **Финальная тёмная CTA-полоса** «Твоя игра. Твои правила.»
- **`docs/theming.md`** — план мультитем.

---

## v0.2.0 — дизайн-система (13.09.2026)

**Тег:** `v0.2.0` · **коммит:** `7df19f9`

- **`DexieProfileRepository`** — первый живой репозиторий (get / save / update / clear).
- **`useProfile()`** — React-хук.
- **Шрифт**: Playfair → Bricolage Grotesque.
- **Акцент**: унифицирован в `#E85D2F`.
- **Фон**: усилены амплитуды волн и хало.
- **Git remote** → `github.com/RuDeNoID814/MyLife-AI` (не запушено).

---

## v0.1.0 — первая версия лендинга (12.09.2026)

**Тег:** `v0.1.0` · **коммит:** `31ae0f8`

- **Home page** editorial arrival.
- **`TopographyAmbient`** — SVG-фон с волнами.
- **Дизайн-система**: палитра paper / ink / accent, типографика через CSS `@import`.

---

## v0.0.1 — setup инфраструктуры (12.09.2026)

**Коммит:** `e2562b8` + серия последующих

- Next.js 15 + React 19 + TypeScript strict + Tailwind 4.
- Three.js + @react-three/fiber + drei, Zustand, Dexie.
- Vitest, Prettier, ESLint (FlatCompat для Next 15).
- Заглушки: Dexie schema (8 таблиц), интерфейсы репозиториев.
- Docs: [`vision.md`](vision.md), [`mvp-scope.md`](mvp-scope.md), [`tech-stack.md`](tech-stack.md), [`data-schema.md`](data-schema.md), [`body-model-spec.md`](body-model-spec.md), [`formulas.md`](formulas.md).
- Референсы модели тела в `docs/references/body-model/`.
- Референсы UI в `docs/references/site-model/`.

---

## Порядок работы

1. Перед началом сессии: прочитать [`docs/ideas.md`](ideas.md) и этот файл.
2. Взять из ideas.md пункт → отметить в разделе «В работе».
3. Сделать → закоммитить → тег → перенести пункт из ideas.md в done.md с версией и коммитом.
4. Обновить [`CHANGELOG.md`](../CHANGELOG.md) с техническими деталями.
