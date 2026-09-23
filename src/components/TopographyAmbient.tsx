/*
  Ambient background: тёплые gradient-хало + слоистые контурные кривые.
  Всё в SVG, движение через CSS keyframes. Не блокирует ввод.
*/
export function TopographyAmbient() {
  return (
    <div className="topography" aria-hidden>
      <div className="halo halo-1" />
      <div className="halo halo-2" />
      <div className="halo halo-3" />
      <div className="halo halo-4" />

      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--line)" stopOpacity="0" />
            <stop offset="0.35" stopColor="var(--line)" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="var(--line)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--line)" stopOpacity="0" />
          </linearGradient>
          <filter id="soften" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        <g
          fill="none"
          stroke="url(#ridge)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#soften)"
        >
          <path
            className="wave wave-a"
            d="M-120,180 C260,110 520,260 780,210 C1040,160 1280,280 1600,220"
          />
          <path
            className="wave wave-b"
            d="M-120,270 C280,220 540,330 800,280 C1060,230 1300,340 1600,300"
            opacity="0.85"
          />
          <path
            className="wave wave-c"
            d="M-120,380 C220,320 500,440 780,390 C1060,340 1320,430 1600,410"
            opacity="0.7"
          />
          <path
            className="wave wave-d"
            d="M-120,500 C260,440 560,560 820,510 C1080,460 1340,560 1600,530"
            opacity="0.6"
          />
          <path
            className="wave wave-e"
            d="M-120,640 C240,580 520,690 800,630 C1080,570 1340,690 1600,660"
            opacity="0.5"
          />
          <path
            className="wave wave-a"
            d="M-120,760 C260,700 540,810 820,750 C1100,690 1360,790 1600,770"
            opacity="0.4"
          />
        </g>

        {/* Тонкие «горизонтали» — намёк на топографическую карту */}
        <g
          fill="none"
          stroke="var(--paper-4)"
          strokeWidth="0.5"
          strokeDasharray="1 6"
          opacity="0.5"
        >
          <path
            className="wave wave-b"
            d="M-120,120 C300,90 600,180 900,140 C1200,100 1400,170 1600,150"
          />
          <path
            className="wave wave-d"
            d="M-120,830 C300,800 600,870 900,830 C1200,790 1400,850 1600,830"
          />
        </g>
      </svg>
    </div>
  );
}
