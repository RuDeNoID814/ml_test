import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Life Game — играй в свою жизнь',
  description:
    'Твоё тело — интерактивная 3D-модель. Твои параметры — реальная механика игры. Local-first, без квестов, без соцсети.',
};

// Читает тему из localStorage до первого рендера — предотвращает flash of wrong theme.
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('lifegame:theme');
    if (t === 'dark') document.documentElement.dataset.theme = 'dark';
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full antialiased">
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
