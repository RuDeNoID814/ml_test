# Мультитемы (v2+)

Идея: пользователь выбирает визуальную тему сайта из пресетов. Каждая тема — свой набор палитры + типографики + плотности + фонового движения.

## Пресеты, которые видим

- **`warm-paper`** *(текущая, дефолт)* — тёплые бежевые + жжёный оранж + Bricolage. «Уютный дневник».
- **`dark-refined`** — тёмный по референсу `_.jpeg` / `_ (1).jpeg`. Глубокие серые, floating glass-карточки, мягкая подсветка.
- **`high-contrast`** — чёрный/белый, крупный кегль, минимум фонового движения. Для читаемости.
- **`playground`** — по референсу `Menu Animation`. Много движения, морфинг чёрных форм, playful.

## Как реализовать

### CSS-архитектура
Всё через `data-theme` на `<html>` + слои переменных.

```css
:root {
  /* базовые токены, инвариантные к теме */
  --radius: 4px;
  --font-mono: 'JetBrains Mono', monospace;
}

:root[data-theme='warm-paper'] {
  --paper: #f3eeea;
  --ink: #1f1815;
  --accent: #e85d2f;
  --font-display: 'Bricolage Grotesque', sans-serif;
  --font-body: 'Onest', sans-serif;
  /* и т.д. */
}

:root[data-theme='dark-refined'] {
  --paper: #17171a;
  --ink: #f4f4f6;
  --accent: #ff8a4c;
  --font-display: 'Onest', sans-serif;
  --font-body: 'Onest', sans-serif;
}
```

### State
Активная тема хранится в:
1. Zustand-стор `useTheme` — источник истины в runtime.
2. `localStorage['lifegame:theme']` — персист между сессиями.
3. `data-theme` атрибут на `<html>` — DOM-снапшот, что читает CSS.

### UI
Селектор в шапке (или в настройках профиля):
- иконка/кнопка → dropdown с превью 4 пресетов
- инстант-переключение без reload
- CSS transition ~200ms на `background-color`/`color` для плавности

### Компонентные правила

Компоненты **не должны** захардкоживать цвета. Только через переменные:
- ✅ `bg-paper`, `text-ink`, `border-line`
- ❌ `bg-[#f3eeea]`, `text-[#1f1815]`

Фон (`TopographyAmbient`) — тоже читает переменные (`--accent`, `--paper-*`), поэтому меняется вместе с темой.

### Фоновое движение
Некоторые темы могут отключать анимацию фона:
- `high-contrast` → статичный
- `warm-paper` / `playground` → живой
- `dark-refined` → subtle

Реализация: `data-theme` включает/выключает `.topography .halo, .topography .wave` через `animation: none`.

## Что не делаем (v1)
- Пользовательский конструктор тем (свои цвета)
- Импорт/экспорт тем как JSON
- Синхронизация темы между устройствами (не имеет смысла до auth)

## Когда делаем
После MVP (v1) — когда основной функционал (ввод параметров, модель, подсказки) закрыт. Мультитемы — это «полировка», не блокирующая MVP.
