import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import { bricolageGrotesque, jetbrainsMono, onest } from './fonts';
import './globals.css';

const description =
    'Твоё тело — интерактивная 3D-модель. Дневник питания, норма калорий и параметры тела — в одном месте. Local-first, без квестов, без соцсети.';

export const metadata: Metadata = {
  // TODO(тикет 14): заменить на реальный адрес после деплоя на Cloudflare Pages.
  metadataBase: new URL('https://mylife.pages.dev'),
  title: 'MyLife',
  description,
  icons: {
    icon: [
      { url: '/favicon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
  openGraph: {
    title: 'MyLife',
    description,
    type: 'website',
    locale: 'ru_RU',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MyLife — персональный дашборд тела' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyLife',
    description,
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
      <html
          lang="ru"
          suppressHydrationWarning
          className={`h-full antialiased ${bricolageGrotesque.variable} ${onest.variable} ${jetbrainsMono.variable}`}
      >
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-paper text-ink-2 flex min-h-full flex-col">
      <ThemeProvider>{children}</ThemeProvider>
      </body>
      </html>
  );
}
