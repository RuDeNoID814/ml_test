/*
  Большая карточка-рамка справа от hero-заголовка (размер/оформление — по новому макету).
  Внутри — тот же самый абстрактный силуэт «человечка», что был на старом лендинге:
  настоящей 3D-модели ещё нет, честная заглушка вместо выдуманного рендера.
*/
export function HeroPreviewCard() {
  return (
    <div
      className="border-line/50 bg-paper-2/60 relative flex h-[420px] w-full max-w-[480px] items-center justify-center overflow-hidden rounded-[24px] border shadow-[0_40px_80px_-40px_rgba(31,24,21,0.25)] backdrop-blur-md sm:h-[500px] lg:h-[580px] lg:max-w-[560px]"
      aria-hidden
    >
      <span className="bg-accent/15 pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full blur-[60px]" />
      <span className="pointer-events-none absolute -top-16 -left-10 h-44 w-44 rounded-full bg-[rgba(107,140,174,0.13)] blur-[60px]" />

      <div className="relative flex flex-col items-center gap-4">
        <svg
          viewBox="0 0 120 240"
          className="h-[280px] w-auto opacity-70 sm:h-[340px] lg:h-[380px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="34" r="20" fill="var(--ink)" opacity="0.85" />
          <path
            d="M28,72 Q28,60 40,60 L80,60 Q92,60 92,72 L92,140 Q92,148 88,148 L32,148 Q28,148 28,140 Z"
            fill="var(--ink)"
            opacity="0.85"
          />
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

        <div className="text-ink-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase">
          <span>модель</span>
          <span className="bg-line/60 h-1 w-1 rounded-full" />
          <span>на подходе</span>
        </div>
      </div>
    </div>
  );
}
