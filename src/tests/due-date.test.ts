import { expect, test } from 'vitest';

import { calculateDueDate, toVietnamIso } from '../src/lib/due-date';

test('TC-04 muc CAO cong 24 gio, khong vuong Chu Nhat (BR-09)', () => {
  const nhanLuc = new Date('2026-10-16T09:00:00+07:00'); // thu Sau

  expect(toVietnamIso(calculateDueDate(nhanLuc, 'CAO'))).toBe('2026-10-17T09:00:00+07:00');
});

test('TC-05 bo qua Chu Nhat, nhan thu Bay thi han roi vao thu Hai (BR-10)', () => {
  const nhanLuc = new Date('2026-10-17T09:00:00+07:00'); // thu Bay

  expect(toVietnamIso(calculateDueDate(nhanLuc, 'CAO'))).toBe('2026-10-19T09:00:00+07:00');
});
