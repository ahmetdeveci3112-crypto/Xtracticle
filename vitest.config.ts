import { defineConfig } from 'vitest/config';

// Kept apart from vite.config.ts so tests don't load the site build plugins.
export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts', 'extension/test/unit/**/*.test.ts'],
    environment: 'node',
  },
});
