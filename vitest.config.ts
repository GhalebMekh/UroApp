import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // questionGuards has no dependencies, so it runs here even where server/ isn't installed (Codemagic).
    include: ['src/**/*.test.ts', 'server/articles/questionGuards.test.js'],
  },
});
