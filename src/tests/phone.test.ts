import { expect, test } from 'vitest';

import { maskPhone, normalizePhone } from '../src/lib/phone';

test('maskPhone hides the middle of a phone number (NFR2)', () => {
  expect(maskPhone('0901234567')).toBe('090****567');
});

test('normalizePhone accepts a +84 number with spaces and dots (BR-03)', () => {
  expect(normalizePhone('+84 90.123.4567')).toBe('0901234567');
});

test('normalizePhone rejects a number that is too short', () => {
  expect(normalizePhone('090123')).toBeNull();
});
