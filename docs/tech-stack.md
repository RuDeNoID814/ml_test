# Tech Stack

## Frontend
- **Next.js 15** — App Router, режим **static export** обязателен с первого дня
- **TypeScript** — везде, `strict: true`
- **Tailwind CSS** — стилизация
- **React 19** — идёт в комплекте с Next.js 15

## 3D
- **Three.js** — рендер-движок
- **@react-three/fiber** — React-обвязка
- **@react-three/drei** — набор хелперов (useGLTF, OrbitControls, Environment)

## State
- **Zustand** — глобальный стейт (профиль, вычисленные морфы, активный экран)

## Локальная БД
- **Dexie.js** — обёртка над IndexedDB
- Схема — см. `data-schema.md`

## Auth
Нет в v1. В v2 — Supabase (email + Google OAuth), миграция локальной БД в Postgres.

## Хостинг
- **Vercel** — деплой из main-ветки GitHub
- Только static export, никакого SSR, никаких серверных API-routes с бизнес-логикой

## Мобильный порт (v2)
- **Capacitor** — оборачивает готовый Next.js static build в APK / iOS
- WebView-based, Three.js работает без переписывания
- Требование к v1, вытекающее из этого: **static export с первого дня**, никаких `getServerSideProps`, никаких server components с fetch к API

## Архитектурные правила (обязательны с первого коммита)

### 1. Бизнес-логика вне компонентов
Всё в `/lib`:
- расчёты калорий/БЖУ
- маппинг параметров профиля → морфы модели
- движок правил рекомендаций
- утилиты

Компоненты только рендерят и вызывают функции из `/lib`.

### 2. Repository pattern для БД
Компоненты и `/lib` не обращаются к Dexie напрямую. Только через интерфейсы:

```ts
interface WeightRepository {
  add(entry: WeightEntry): Promise<string>
  latest(): Promise<WeightEntry | null>
  range(from: string, to: string): Promise<WeightEntry[]>
  delete(id: string): Promise<void>
}
```

Реализация `DexieWeightRepository` в `/lib/repositories/dexie/`. При замене Dexie → SQLite (в мобильной сборке) — меняется только реализация, интерфейсы стабильны.

### 3. Ноль браузер-специфичного в `/lib`
Никаких `window`, `document`, `localStorage` в бизнес-логике. Всё через инжектируемые адаптеры (например, `Clock` для текущего времени, `IdGenerator` для UUID).

### 4. Static export mandatory
```js
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true }
}
```

## Инструменты разработки
- **Node.js** LTS (22.x на момент старта)
- **pnpm** (быстрее npm, лучше с монорепами на будущее)
- **Claude Code** — основной способ разработки
- **VSCode** + расширения: ESLint, Prettier, Tailwind IntelliSense, GitLens, Error Lens

## Тесты
- **Vitest** — юнит-тесты для `/lib` (движок правил, маппинг морфов, расчёты калорий)
- E2E — не в v1

## Что явно НЕ используем
- Redux / MobX (Zustand достаточно)
- Styled Components / Emotion (Tailwind достаточно)
- Prisma (для IndexedDB не подходит)
- Server components / Server actions (несовместимо со static export)
- Unity WebGL (тяжёлый билд, слабая AI-поддержка)
- Ready Player Me (глубокая параметризация тела ограничена)
