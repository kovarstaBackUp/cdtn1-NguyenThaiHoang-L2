export function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function toPositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

export function toQueryInt(
  raw: string | null,
  fallback: number,
  max: number,
): number | null {
  if (raw === null || raw.trim() === '') return fallback;
  if (!/^\d+$/.test(raw.trim())) return null;

  const parsed = Number(raw.trim());
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) return null;

  return parsed;
}

export function toPathId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return null;

  return parsed;
}
