# Список литературы — Life Game

Цель: понять концепции стека до старта разработки. Ревью кода Claude Code должно быть осмысленным.

Маркеры приоритета:
- **[MUST]** — прочитать перед стартом
- **[USE]** — открывать по ходу как референс
- **[LATER]** — для глубины, не блокирует старт

---

## 1. Языки и синтаксис

### TypeScript
- **[MUST]** TypeScript for Java/C# Programmers — https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html
  Короткий раздел специально для тех, кто идёт из C#. Синтаксис похож, различия критичны.
- **[USE]** TypeScript Handbook (главы: Everyday Types, Narrowing, Object Types, Generics) — https://www.typescriptlang.org/docs/handbook/intro.html

---

## 2. UI-фреймворк

### React
- **[MUST]** react.dev/learn — https://react.dev/learn
  Официальный курс от Meta. Разделы: Describing UI, Adding Interactivity, Managing State. Хуки — обязательно.

### Next.js 15 + App Router
- **[MUST]** Next.js Learn — https://nextjs.org/learn
- **[MUST]** Static Exports (обязательно для Capacitor-порта) — https://nextjs.org/docs/app/guides/static-exports
- **[USE]** App Router documentation — https://nextjs.org/docs/app

### Tailwind CSS
- **[USE]** Docs — https://tailwindcss.com/docs
  Читать по мере необходимости: Layout, Flexbox & Grid, Sizing, Typography, Responsive Design.

---

## 3. Состояние и данные

### Zustand
- **[MUST]** README — https://github.com/pmndrs/zustand
  Главы Basic Usage и Recipes покрывают 90% сценариев.

### Dexie.js + IndexedDB
- **[MUST]** Dexie Tutorial — https://dexie.org/docs/Tutorial/Getting-started
- **[USE]** Dexie API Reference — https://dexie.org/docs/API-Reference
- **[USE]** MDN IndexedDB concepts — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology

---

## 4. 3D модель тела

### Three.js — базовые концепции
- **[MUST]** Discover Three.js (бесплатная книга) — https://discoverthreejs.com
  Лучший старт. Главы 1–4 обязательны: Scene, Camera, Renderer, Mesh, Material, Light.
- **[USE]** Three.js Manual — https://threejs.org/manual/
- **[USE]** Three.js API Docs — https://threejs.org/docs/

### React Three Fiber (обвязка Three.js для React)
- **[MUST]** Introduction — https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- **[MUST]** Hooks (useFrame, useLoader, useThree) — https://docs.pmnd.rs/react-three-fiber/api/hooks
- **[USE]** Objects, Properties and Constructor Arguments — https://docs.pmnd.rs/react-three-fiber/api/objects

### Morph Targets / Shape Keys — ключевая тема для нашей модели
- **[MUST]** GLTF Morph Targets spec — https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#morph-targets
- **[MUST]** Three.js: morphTargetInfluences — https://threejs.org/docs/#api/en/objects/Mesh.morphTargetInfluences

### Blender — создание базового меша с shape keys
- **[MUST]** Blender: Shape Keys manual — https://docs.blender.org/manual/en/latest/animation/shape_keys/index.html
- **[MUST]** Blender: экспорт в glTF/GLB — https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- **[USE]** MakeHuman documentation — http://www.makehumancommunity.org/wiki/Documentation
- Практический workflow: MakeHuman → экспорт FBX/OBJ → Blender → создание shape keys → экспорт в GLB.

### PBR материалы (для матово-белого "манекенного" стиля)
- **[LATER]** Marmoset: Basic Theory of PBR — https://marmoset.co/posts/basic-theory-of-physically-based-rendering/

---

## 5. Портирование под мобильные (закладываем архитектурно)

### Capacitor
- **[USE]** Capacitor Docs — https://capacitorjs.com/docs
- **[USE]** Next.js + Capacitor solution — https://capacitorjs.com/solution/nextjs

---

## 6. Архитектура и проектирование

### Local-first architecture
- **[MUST]** Local-first software manifesto (Ink & Switch) — https://www.inkandswitch.com/local-first/
  Прочитать один раз для понимания принципов. Определяет всю модель данных проекта.

### Repository pattern (для абстракции над БД)
- **[MUST]** Martin Fowler: Repository — https://martinfowler.com/eaaCatalog/repository.html

### Layered architecture (разделение UI / логика / данные)
- **[LATER]** Uncle Bob: The Clean Architecture — https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

### SOLID в контексте TypeScript
- **[LATER]** SOLID principles — https://en.wikipedia.org/wiki/SOLID
  Достаточно википедии для освежения.

---

## 7. Данные для еды и продуктов

### Open Food Facts API (штрихкоды, состав продуктов)
- **[USE]** API docs — https://openfoodfacts.github.io/openfoodfacts-server/api/
- **[USE]** Пример запроса по штрихкоду — https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/

---

## 8. Инструменты

### Git
- **[USE]** Pro Git book (главы 1–3) — https://git-scm.com/book/en/v2

### VSCode расширения (установить сразу)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

---

## Рекомендуемый порядок изучения перед стартом

1. TypeScript for C# programmers — 30 мин
2. React learn: Describing UI + Managing State — 2–3 часа
3. Next.js Learn (до Data Fetching) — 2–3 часа
4. Local-first manifesto — 30 мин
5. Repository pattern (Fowler) — 20 мин
6. Discover Three.js: главы 1–4 — 2–3 часа
7. R3F introduction + первый примерный код — 1–2 часа
8. Blender Shape Keys + один прогон MakeHuman → GLB — 2–3 часа
9. Dexie tutorial — 1 час

**Итого: ~12–18 часов до готовности к старту.**

---

## Что оставляем на "по ходу"

- Тонкости PBR
- Clean Architecture в полном объёме
- Продвинутый TypeScript (conditional types, template literals)
- Оптимизация Three.js (draw calls, instancing)
- Capacitor настройка — открываем когда пойдёт мобильный порт
