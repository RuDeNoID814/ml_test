import Link from 'next/link';
import { TopographyAmbient } from '@/components/TopographyAmbient';
import { HeroPreviewCard } from '@/components/HeroPreviewCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingCTA } from '@/components/LandingCTA';

const steps = [
  {
    n: '01',
    title: 'Задай параметры',
    body: 'никнейм, рост, дата рождения, вес. Дальше — по мере готовности: сон, еда, обхваты, биоимпеданс.',
  },
  {
    n: '02',
    title: 'Смотри модель',
    body: 'твоё тело в 3D. Меняется live от каждого нового замера. Не аватар, не мультик — фигура твоей текущей формы.',
  },
  {
    n: '03',
    title: 'Читай связи',
    body: 'приложение показывает, что от чего зависит: сон↔вес, кортизол↔жир, обхваты↔размер одежды. Нейтральный тон.',
  },
];

const features = [
  {
    tag: 'I',
    title: 'Local-first',
    body: 'все данные в браузере (IndexedDB). Никаких серверов, аккаунтов, облака. Экспорт в JSON — если хочешь бэкап.',
  },
  {
    tag: 'II',
    title: 'Без квестов',
    body: 'ни XP, ни стриков, ни ачивок. Заходишь когда что-то изменилось. Приложение молчит, пока ты сам не спросил.',
  },
  {
    tag: 'III',
    title: 'Data-driven',
    body: 'подсказки формата «лечь сегодня в 23:30», не «молодец, вперёд». Правила — конфигом, не в коде.',
  },
  {
    tag: 'IV',
    title: 'Работает офлайн',
    body: 'PWA-совместимый static-билд. Раз загрузил — работает без сети. Мобильный порт (Capacitor) — v2.',
  },
];

export default function Home() {
  return (
    <>
      <TopographyAmbient />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-8 sm:px-10 sm:py-14 lg:px-16">
        {/* ── Header ── */}
        <header className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[20px] font-extrabold tracking-tight text-ink sm:text-[22px]">
              Life<span className="text-accent">.</span>Game
            </span>
            <span className="hidden text-[10px] font-mono tracking-[0.18em] uppercase text-ink-3 sm:inline">
              выпуск 001 · пролог
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="eyebrow shrink-0 hidden sm:inline">v0.7</span>
            <ThemeToggle />
          </div>
        </header>

        <div className="mt-6 rule sm:mt-8" />

        {/* ── Hero: заголовок слева, preview-карточка справа ── */}
        <section className="grid grid-cols-1 gap-10 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-14 lg:pt-20 lg:pb-24">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">персональный дашборд · один игрок</p>

            <h1 className="font-display text-ink leading-[0.92] tracking-[-0.035em] text-[52px] sm:text-[76px] lg:text-[112px]">
              Играй
              <br />
              <span className="font-display-italic text-accent">в свою</span>
              <br />
              жизнь<span className="text-accent">.</span>
            </h1>

            <p className="mt-8 max-w-[46ch] text-[17px] leading-[1.55] text-ink-2 sm:text-[19px]">
              Твоё тело — интерактивная 3D-модель. Твои параметры — реальная
              механика.{' '}
              <span className="text-ink-3">
                Не мотивация, не соцсеть, не квесты. Только данные и связи,
                которые в жизни не видны.
              </span>
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LandingCTA variant="hero" />
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-paper/60 px-5 py-3.5 text-[15px] font-medium text-ink-2 backdrop-blur-sm transition-colors hover:border-ink/60 hover:text-ink"
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
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-ink text-[28px] leading-[1] tracking-tight sm:text-[36px] lg:text-[44px]">
              Как это{' '}
              <span className="font-display-italic text-ink-3">работает</span>
            </h2>
            <span className="eyebrow shrink-0">три шага</span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4 lg:gap-8">
            {steps.map((s) => (
              <div
                key={s.n}
                className="border-t border-line/70 pt-5 sm:pt-6"
              >
                <div className="mb-6 flex items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-line/50" />
                </div>
                <h3 className="font-display text-[24px] leading-tight text-ink sm:text-[28px]">
                  {s.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-3 sm:text-[15px]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="rule" />

        {/* ── Что внутри ── */}
        <section className="pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-ink text-[28px] leading-[1] tracking-tight sm:text-[36px] lg:text-[44px]">
              Что{' '}
              <span className="font-display-italic text-ink-3">внутри</span>
            </h2>
            <span className="eyebrow shrink-0">принципы</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {features.map((f) => (
              <article
                key={f.tag}
                className="group relative flex flex-col overflow-hidden rounded-[8px] border border-line/60 bg-paper-2/60 p-5 backdrop-blur-sm transition-all hover:border-ink/40 hover:bg-paper-2/90 sm:p-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-accent">
                    {f.tag}
                  </span>
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-accent/60 transition-all group-hover:scale-150"
                  />
                </div>
                <h3 className="font-display text-[22px] leading-tight text-ink sm:text-[24px]">
                  {f.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Финальная CTA-полоса ── */}
        <section className="my-8 rounded-[16px] border border-ink/15 bg-ink px-6 py-12 text-paper sm:my-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[42ch]">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">
                готов к прологу?
              </p>
              <h2 className="font-display text-paper text-[36px] leading-[1] tracking-tight sm:text-[48px] lg:text-[64px]">
                Твоя игра.
                <br />
                <span className="font-display-italic text-accent">
                  Твои правила.
                </span>
              </h2>
            </div>

            <LandingCTA variant="primary" />
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto pt-8 sm:pt-10">
          <div className="rule mb-5 sm:mb-6" />
          <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 sm:text-[11px]">
              Life.Game · v0.7 · made for one player
            </span>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
              {['local-first', 'без квестов', 'без соцсети', 'офлайн'].map(
                (p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink-3 sm:text-[12px]"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {p}
                  </li>
                ),
              )}
            </ul>
          </div>
        </footer>
      </main>
    </>
  );
}
