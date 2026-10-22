import { expect, test } from 'vitest';

import { calculateDueDate, toVietnamIso } from '../src/lib/due-date';

test('a CAO ticket gets 24 hours (BR-10)', () => {
  const received = new Date('2026-10-16T09:00:00+07:00'); // Friday

  expect(toVietnamIso(calculateDueDate(received, 'CAO'))).toBe(
    '2026-10-17T09:00:00+07:00',
  );
});

test('Sunday is skipped, so a Saturday ticket lands on Monday (BR-10)', () => {
  const received = new Date('2026-10-17T09:00:00+07:00'); // Saturday

  expect(toVietnamIso(calculateDueDate(received, 'CAO'))).toBe(
    '2026-10-19T09:00:00+07:00',
  );
});
