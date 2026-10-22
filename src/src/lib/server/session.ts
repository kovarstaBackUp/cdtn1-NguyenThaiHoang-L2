import type { Actor } from '#services/access';

export const SESSION_COOKIE = 'session';

// Where each role starts after signing in.
export function landingFor(role: string): string {
  return role === 'QUAN_LY' ? '/duyetPhieuBaoHanh' : '/traCuuKhachHang';
}

// The cookie and the Bearer token carry the same payload, so one decoder
// handles both.
export function encodeSession(actor: Actor): string {
  const payload = {
    employee_id: Number(actor.employeeId),
    role: actor.role,
    center_code: actor.centerCode,
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeSession(value: string | null | undefined): Actor | null {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));

    return {
      employeeId: BigInt(payload.employee_id),
      role: String(payload.role),
      centerCode: String(payload.center_code),
    };
  } catch {
    return null;
  }
}
