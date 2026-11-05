import { expect, test } from 'vitest';

import { runSeed } from '../src/prisma/seed';
import { unitOfWork } from '../src/repositories/index';

// Tep rieng cho TC-12, vi hai ly do:
// 1. src/prisma/seed.ts goi connectDatabase(), ma ham do nem loi neu client da ket noi.
//    Dat ca nay o tep rieng thi no la noi dung cham co so du lieu dau tien, nen ket noi
//    con sach.
// 2. seed() chi chay mot lan moi tien trinh, nen ca nay goi runSeed() truc tiep.

test('TC-12 chay seed lan thu hai khong nhan doi du lieu (tinh tai lap)', async () => {
  await runSeed();

  const danhMucLanMot = await unitOfWork.categories.list();
  const khachLanMot = await unitOfWork.customers.findByPhone('0900000001');
  const thietBiLanMot = khachLanMot
    ? await unitOfWork.devices.listByCustomer(khachLanMot.customerId)
    : [];

  await runSeed();

  const danhMucLanHai = await unitOfWork.categories.list();
  const khachLanHai = await unitOfWork.customers.findByPhone('0900000001');
  const thietBiLanHai = khachLanHai
    ? await unitOfWork.devices.listByCustomer(khachLanHai.customerId)
    : [];

  expect(danhMucLanHai).toHaveLength(danhMucLanMot.length);
  expect(danhMucLanHai).toHaveLength(6);

  expect(thietBiLanHai).toHaveLength(thietBiLanMot.length);
  expect(thietBiLanHai).toHaveLength(3);

  expect(khachLanHai?.customerId).toBe(khachLanMot?.customerId);
});
