import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import { bricolageGrotesque, jetbrainsMono, onest } from './fonts';
import './globals.css';

const description =
    'Твоё тело — интерактивная 3D-модель. Дневник питания, норма калорий и параметры тела — в одном месте. Local-first, без квестов, без соцсети.';

// На GitHub Pages сайт живёт по подпути /ml_test/ — абсолютные пути к
// статике из public/ (иконки, скрипты) сами basePath не подхватывают
// (в отличие от next/link и собранных _next/-чанков), поэтому префиксуем
// вручную тем же значением, что next.config.ts передаёт в basePath.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  // Обновить, если/когда подключим свой домен вместо *.workers.dev.
  metadataBase: new URL('https://mylife.rudenko-231.workers.dev'),
  title: 'MyLife',
  description,
  icons: {
    icon: [
      { url: `${basePath}/favicon-light.svg`, media: '(prefers-color-scheme: light)' },
      { url: `${basePath}/favicon-dark.svg`, media: '(prefers-color-scheme: dark)' },
    ],
  },
  openGraph: {
    title: 'MyLife',
    description,
    type: 'website',
    locale: 'ru_RU',
    images: [{ url: `${basePath}/og-image.jpg`, width: 1200, height: 630, alt: 'MyLife — персональный дашборд тела' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyLife',
    description,
    images: [`${basePath}/og-image.jpg`],
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
        <Script src={`${basePath}/theme-init.js`} strategy="beforeInteractive" />
      </head>
      <body className="bg-paper text-ink-2 flex min-h-full flex-col">
      <ThemeProvider>{children}</ThemeProvider>
      </body>
      </html>
  );
}
