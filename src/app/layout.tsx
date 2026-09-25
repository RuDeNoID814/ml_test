import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import { bricolageGrotesque, jetbrainsMono, onest } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyLife',
  description:
      'Твоё тело — интерактивная 3D-модель. Дневник питания, норма калорий и параметры тела — в одном месте. Local-first, без квестов, без соцсети.',
  icons: {
    icon: [
      { url: '/favicon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('lifegame:theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.dataset.theme = 'dark';
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
      <html
          lang="ru"
          suppressHydrationWarning
          className={`h-full antialiased ${bricolageGrotesque.variable} ${onest.variable} ${jetbrainsMono.variable}`}
      >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="bg-paper text-ink-2 flex min-h-full flex-col">
      <ThemeProvider>{children}</ThemeProvider>
      </body>
      </html>
  );
}
