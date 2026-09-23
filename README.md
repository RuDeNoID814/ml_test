# Life Game

Играй в свою жизнь — веб-приложение с интерактивной 3D-моделью тела, где реальные параметры (вес, сон, еда, обхваты, биоимпеданс) live-меняют модель и выдают data-driven подсказки.

## Стек

- **Next.js 15** (App Router, static export) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** — 3D-модель
- **Zustand** — глобальный стейт
- **Dexie.js** (IndexedDB) — local-first БД
- **Vitest** — юнит-тесты (jsdom для UI, node для `src/lib`)
- **Prettier** + **ESLint** — форматирование и линт

Детальнее в [`docs/tech-stack.md`](docs/tech-stack.md).

## Команды

```bash
pnpm dev           # dev-сервер (http://localhost:3000)
pnpm build         # production static build (out/)
pnpm test          # запустить все тесты один раз
pnpm test:watch    # тесты в watch-режиме
pnpm typecheck     # проверка типов
pnpm lint          # eslint
pnpm format        # prettier --write
```

## Структура

```
docs/                     — спецификация проекта (vision, mvp-scope, схемы)
docs/references/          — визуальные референсы 3D-модели
model/                    — GLB-файлы 3D-модели (появится позже)
src/app/                  — Next.js App Router
src/components/           — React UI
src/lib/                  — бизнес-логика (без window/document)
src/lib/repositories/     — repository pattern поверх Dexie
src/db/                   — Dexie schema и типы
```

## Архитектурные правила

- Бизнес-логика — только в `src/lib`. Компоненты рендерят и вызывают функции.
- БД — только через repository-интерфейсы. Реализация Dexie изолирована в `src/lib/repositories/dexie/`.
- Ноль браузер-специфичного (`window`, `document`, `localStorage`) в `src/lib`.
- Static export обязателен: никакого SSR и server actions.

Детальнее в [`docs/tech-stack.md`](docs/tech-stack.md#архитектурные-правила-обязательны-с-первого-коммита).
