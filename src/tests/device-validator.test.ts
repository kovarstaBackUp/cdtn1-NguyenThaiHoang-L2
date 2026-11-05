import { afterEach, expect, test, vi } from 'vitest';

import { validateDeviceInput } from '../src/validators/device.validator';

const DAU_VAO = {
  customer_id: 1024,
  serial_no: 'SN-EXT-999',
  is_external: true,
  origin_note: 'mua tại CellphoneS',
  warranty_months: 12,
};

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
