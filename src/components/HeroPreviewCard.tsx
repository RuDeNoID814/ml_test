/*
  Плавающая glass-карточка справа от hero-заголовка.
  Мокап того, что будет внутри приложения (по референсу _.jpeg / _ (1).jpeg):
  силует 3D-модели + строчки метрик. Пока «превью недоступно», без данных.
*/
export function HeroPreviewCard() {
  return (
    <div
      className="hero-card border-line/50 bg-paper-2/60 relative w-full max-w-[420px] rounded-[20px] border p-5 shadow-[0_40px_80px_-40px_rgba(31,24,21,0.35)] backdrop-blur-md"
      aria-hidden
    >
      {/* Верхняя строка «окна» */}
      <div className="border-line/40 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-accent/70 h-2 w-2 rounded-full" />
          <span className="bg-line/70 h-2 w-2 rounded-full" />
          <span className="bg-line/70 h-2 w-2 rounded-full" />
        </div>
        <span className="text-ink-3 font-mono text-[10px] tracking-[0.18em] uppercase">превью</span>
      </div>

      {/* Тело: силует 3D + панель метрик справа */}
      <div className="grid grid-cols-5 gap-4 pt-5">
        {/* Силует модели */}
        <div className="col-span-3">
          <div className="bg-paper-3/60 relative flex h-[240px] items-center justify-center overflow-hidden rounded-[12px]">
            {/* Абстрактный силует «человечка» */}
            <svg
              viewBox="0 0 120 240"
              className="h-full w-auto opacity-70"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Голова */}
              <circle cx="60" cy="34" r="20" fill="var(--ink)" opacity="0.85" />
              {/* Плечи + торс */}
              <path
                d="M28,72 Q28,60 40,60 L80,60 Q92,60 92,72 L92,140 Q92,148 88,148 L32,148 Q28,148 28,140 Z"
                fill="var(--ink)"
                opacity="0.85"
              />
              {/* Руки */}
              <path
                d="M28,72 Q22,74 20,82 L14,140 Q13,150 22,150 Q30,150 30,140 L34,88"
                fill="var(--ink)"
                opacity="0.75"
              />
              <path
                d="M92,72 Q98,74 100,82 L106,140 Q107,150 98,150 Q90,150 90,140 L86,88"
                fill="var(--ink)"
                opacity="0.75"
              />
              {/* Ноги */}
              <path
                d="M40,148 L38,220 Q38,230 46,230 L52,230 Q56,230 56,220 L58,148 Z"
                fill="var(--ink)"
                opacity="0.85"
              />
              <path
                d="M62,148 L64,220 Q64,230 68,230 L74,230 Q82,230 82,220 L80,148 Z"
                fill="var(--ink)"
                opacity="0.85"
              />
            </svg>

            {/* Пятно-подсветка */}
            <span className="bg-accent/20 pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full blur-2xl" />
          </div>

          <div className="text-ink-3 mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase">
            <span>модель</span>
            <span>на подходе</span>
          </div>
        </div>

        {/* Правая колонка — «параметры» */}
        <div className="col-span-2 flex flex-col justify-between gap-3">
          {[
            { label: 'вес', val: '—' },
            { label: 'сон', val: '—' },
            { label: 'ккал', val: '—' },
            { label: 'жир%', val: '—' },
          ].map((row) => (
            <div
              key={row.label}
              className="border-line/30 flex items-baseline justify-between border-b pb-1.5"
            >
              <span className="text-ink-3 font-mono text-[9px] tracking-[0.18em] uppercase">
                {row.label}
              </span>
              <span className="font-display text-ink text-[18px] leading-none">{row.val}</span>
            </div>
          ))}

          <div className="bg-accent/15 mt-1 rounded-[6px] px-2 py-1.5">
            <span className="text-accent-deep font-mono text-[9px] tracking-[0.16em] uppercase">
              подсказка
            </span>
            <p className="text-ink-2 mt-1 text-[10px] leading-tight">лечь сегодня к 23:30</p>
          </div>
        </div>
      </div>
    </div>
  );
}
