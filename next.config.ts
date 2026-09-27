import type { NextConfig } from "next";

// GitHub Pages для этого репозитория отдаёт сайт по подпути /ml_test/
// (github.io/<repo>), а не с корня домена — basePath задаётся только
// при сборке для Pages (см. .github/workflows/deploy-pages.yml),
// локальный dev/build им не затронут. NEXT_PUBLIC_-префикс нужен, чтобы
// то же значение было доступно в клиентском коде (layout.tsx — иконки,
// theme-init.js), а не только здесь, в next.config.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
