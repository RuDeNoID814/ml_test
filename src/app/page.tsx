import { TopographyAmbient } from '@/components/TopographyAmbient';
import { HeroPreviewCard } from '@/components/HeroPreviewCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingCTA } from '@/components/LandingCTA';
import { HeaderAuthButtons } from '@/components/HeaderAuthButtons';

const steps = [
  {
    title: 'Задай параметры',
    body: 'Занеси основные данные и цель — получишь свою суточную норму калорий.',
  },
  {
    title: 'Веди дневник',
    body: 'Записывай приёмы пищи — калории и БЖУ по каждому приёму пищи считаются автоматически.',
  },
  {
    title: 'Смотри модель',
    body: 'Твоё тело в 3D. Меняется вместе с тобой — по весу, объёмам и питанию.',
  },
];

export default function Home() {
  return (
      <>
        <TopographyAmbient />

        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-8 sm:px-10 sm:py-14 lg:px-16">
          {/* ── Header ── */}
          <header className="flex items-center justify-between gap-4">
            <span className="font-display text-ink text-[20px] font-extrabold tracking-tight sm:text-[22px]">
              MyLife<span className="text-accent">.</span>
            </span>

            <div className="flex items-center gap-3">
              <HeaderAuthButtons />
              <ThemeToggle />
            </div>
          </header>

          <div className="rule mt-6 sm:mt-8" />

          {/* ── Hero: заголовок слева, preview-карточка справа ── */}
          <section className="grid grid-cols-1 gap-10 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-14 lg:pt-20 lg:pb-24">
            <div className="lg:col-span-7">
              <div className="border-line/40 bg-paper-2 mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
                <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden />
                <span className="eyebrow">персональный дашборд тела</span>
              </div>

              <h1 className="text-ink text-[48px] leading-[1] font-extrabold tracking-[-0.02em] sm:text-[68px] sm:leading-[0.98] lg:text-[90px] lg:leading-[0.98]">
                Играй
                <br />
                <span className="text-accent">в свою</span>
                <br />
                жизнь<span className="text-accent">.</span>
              </h1>

              <p className="text-ink-2 mt-8 max-w-[46ch] text-[16px] leading-[1.55] sm:text-[18px]">
                Твоё тело — интерактивная 3D-модель. Твои параметры — реальная механика. Не
                мотивация, не соцсеть, не квесты. Только данные и связи, которые в жизни не видны.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <LandingCTA variant="hero" />
                <a
                    href="#how"
                    className="border-line/70 bg-paper/60 text-ink-2 hover:border-ink/60 hover:text-ink inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-medium backdrop-blur-sm transition-colors"
                >
                  Как это работает
                </a>
              </div>
            </div>

            {/* Preview-карточка */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <HeroPreviewCard />
            </div>
          </section>

          <div className="rule" />

          {/* ── Как это работает ── */}
          <section id="how" className="pt-14 pb-16 lg:pt-20 lg:pb-24">
            <h2 className="text-ink mb-10 text-[28px] leading-[1] font-bold tracking-tight sm:text-[36px] lg:text-[44px]">
              Как это <span className="text-ink-3">работает</span>
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4 lg:gap-8">
              {steps.map((s) => (
                  <div key={s.title}>
                    <h3 className="text-ink text-[24px] leading-tight font-bold sm:text-[26px] sm:leading-[32px]">
                      {s.title}
                    </h3>
                    <div className="border-line/70 mt-3 border-t pt-5 sm:pt-6">
                      <p className="text-ink-3 text-[14px] leading-relaxed sm:text-[15px] sm:leading-[24px]">
                        {s.body}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="mt-auto pt-8 sm:pt-10">
            <div className="rule mb-5 sm:mb-6" />
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div>
                <span className="font-display text-ink text-[16px] font-extrabold tracking-tight">
                  MyLife<span className="text-accent">.</span>
                </span>
                <p className="text-ink-3 mt-2 max-w-[32ch] text-[13px] leading-relaxed">
                  Персональный дашборд тела. Твоё здоровье — твои данные.
                </p>
              </div>
              <div>
                <p className="text-ink-3 mb-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                  разделы
                </p>
                <ul className="space-y-2">
                  <li>
                    <a href="#how" className="text-ink-2 hover:text-ink text-[13px] transition-colors">
                      Как это работает
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="rule my-5 sm:my-6" />
            <span className="text-ink-3 font-mono text-[10px] tracking-[0.18em] sm:text-[11px]">
              © 2026 MyLife<span className="text-accent">.</span>
            </span>
          </footer>
        </main>
      </>
  );
}
