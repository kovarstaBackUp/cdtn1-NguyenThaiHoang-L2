import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // src/prisma/db.ts tao client ngay khi tep duoc nap, va can DATABASE_URL de khong nem loi.
    // Cac ca unit khong truy van gi nen khong mo ket noi nao.
    env: {
      DATABASE_URL: 'postgres://postgres:postgres@127.0.0.1:5432/capstoneone',
    },
  },
});
