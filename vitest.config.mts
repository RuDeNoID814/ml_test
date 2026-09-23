import { defineConfig } from 'vitest/config';
import path from 'node:path';

const alias = {
  '@': path.resolve(import.meta.dirname, './src'),
};

export default defineConfig({
  resolve: { alias },
  test: {
    globals: true,
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'lib',
          environment: 'node',
          include: ['src/lib/**/*.{test,spec}.{ts,tsx}'],
          globals: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: [
            'src/components/**/*.{test,spec}.{ts,tsx}',
            'src/app/**/*.{test,spec}.{ts,tsx}',
          ],
          globals: true,
        },
      },
    ],
  },
});
