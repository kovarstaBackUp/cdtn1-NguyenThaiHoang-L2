import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Tro test sang database rieng, dat trong tests/helpers/setup-env.ts.
    // Nap truoc moi tep test de db.ts doc duoc DATABASE_URL dung luc nap module.
    setupFiles: ['tests/helpers/setup-env.ts'],
  },
});
