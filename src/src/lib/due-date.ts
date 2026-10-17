export type Priority = 'CAO' | 'TRUNG_BINH' | 'THAP';

export const COMMITMENT_HOURS: Record<Priority, number> = {
  CAO: 24,
  TRUNG_BINH: 72,
  THAP: 120,
};

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const OFFSET_MS = 7 * HOUR_MS;

export function isPriority(value: unknown): value is Priority {
  return value === 'CAO' || value === 'TRUNG_BINH' || value === 'THAP';
}

export function toVietnamIso(date: Date): string {
  const shifted = new Date(date.getTime() + OFFSET_MS);

  return `${shifted.toISOString().slice(0, 19)}+07:00`;
}

export function toVietnamDdMmYy(isoDateTime: string): string {
  return `${isoDateTime.slice(8, 10)}/${isoDateTime.slice(5, 7)}/${isoDateTime.slice(2, 4)}`;
}

export function calculateDueDate(receivedAt: Date, priority: Priority): Date {
  const hours = COMMITMENT_HOURS[priority];

  if (!Number.isFinite(hours)) {
    throw new Error(`Unknown priority: ${priority}`);
  }

  let local = receivedAt.getTime() + OFFSET_MS;
  let remaining = hours * HOUR_MS;

  while (remaining > 0) {
    const dayStart = Math.floor(local / DAY_MS) * DAY_MS;
    const weekday = new Date(dayStart).getUTCDay();

    if (weekday === 0) {
      local = dayStart + DAY_MS;
      continue;
    }

    const sundayStart = dayStart + (7 - weekday) * DAY_MS;
    const used = Math.min(sundayStart - local, remaining);

    local += used;
    remaining -= used;
  }

  return new Date(local - OFFSET_MS);
}
