import { expect, test } from 'vitest';

import { maskPhone, normalizePhone } from '../src/lib/phone';

test('TC-01 che so dien thoai, giu ba so dau va ba so cuoi (NFR2)', () => {
  expect(maskPhone('0901234567')).toBe('090****567');
});

test('TC-02 chuan hoa so co +84 kem dau cham (BR-02)', () => {
  expect(normalizePhone('+84 90.123.4567')).toBe('0901234567');
});

test('TC-03 so chin chu so thi tu choi (BR-02)', () => {
  expect(normalizePhone('090123')).toBeNull();
});

test('TC-06 so muoi mot chu so thi tu choi (BR-02)', () => {
  expect(normalizePhone('09012345678')).toBeNull();
});
