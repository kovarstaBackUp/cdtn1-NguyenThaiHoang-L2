import { afterEach, expect, test, vi } from 'vitest';

import type { AppError } from '../src/errors/app-error';
import { validateDeviceInput } from '../src/validators/device.validator';

const DAU_VAO = {
  customer_id: 1024,
  serial_no: 'SN-EXT-999',
  is_external: true,
  origin_note: 'mua tại CellphoneS',
  warranty_months: 12,
};

// Goi mot ham va tra ve loi no nem ra, de kiem duoc ca ma loi lan thong diep.
function batLoi(goi: () => unknown): AppError {
  try {
    goi();
  } catch (error) {
    return error as AppError;
  }

  throw new Error('Mong doi co loi nhung khong co loi nao duoc nem ra');
}

afterEach(() => {
  vi.useRealTimers();
});

test('TC-13 ngay mua la hom nay theo gio Viet Nam duoc chap nhan (hoi quy BUG-02)', () => {
  // 01:00 gio Viet Nam ngay 06/11/2026. Luc do gio UTC moi la 18:00 ngay 05/11,
  // nen cach cu (lay ngay UTC) se tu choi sai ngay cua hom nay.
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-05T18:00:00Z'));

  const ketQua = validateDeviceInput({ ...DAU_VAO, purchase_date: '2026-11-06' });

  expect(ketQua.purchaseDate).toBe('2026-11-06');
});

test('TC-14 ngay mua sai dinh dang hoac khong co that thi bi tu choi (hoi quy BUG-03)', () => {
  const saiDinhDang = batLoi(() =>
    validateDeviceInput({ ...DAU_VAO, purchase_date: '10/02/2026' }),
  );
  expect(saiDinhDang.code).toBe('VALIDATION_FAILED');
  expect(saiDinhDang.status).toBe(400);
  expect(saiDinhDang.message).toBe('Ngày mua không hợp lệ');

  const ngayKhongCoThat = batLoi(() =>
    validateDeviceInput({ ...DAU_VAO, purchase_date: '2026-02-30' }),
  );
  expect(ngayKhongCoThat.code).toBe('VALIDATION_FAILED');
});
