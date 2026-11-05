// Moi test chay tren mot database rieng, khong dung DATABASE_URL cua ung dung.
//
// Tep nay duoc Vitest nap TRUOC khi nap bat ky tep test nao, nen khi
// src/prisma/db.ts doc process.env.DATABASE_URL thi da co dung gia tri test.
// Do la ly do phai dat o day chu khong dat trong tung tep test: lenh import
// duoc keo len dau tep, nen gan bien o dau tep test se chay qua muon.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/capstoneone_test';
