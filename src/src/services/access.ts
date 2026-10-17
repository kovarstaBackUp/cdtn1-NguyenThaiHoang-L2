import { AppError } from '#errors/app-error';

export type Actor = {
  employeeId: bigint;
  role: string;
  centerCode: string;
};

export const ROLE_NHAN_VIEN = 'NHAN_VIEN';
export const ROLE_QUAN_LY = 'QUAN_LY';

// Tam thoi tat phan quyen theo vai tro de ai cung dung duoc app.
// Dat lai thanh true de bat lai bang phan quyen o muc 3 cua hop dong:
// Quan ly bi chan o endpoint 2, 3, 5; Nhan vien tiep nhan bi chan o 6, 7.
export const AUTHORIZATION_ENFORCED = false;

const FORBIDDEN = 'Bạn không có quyền thực hiện thao tác này';

export function requireReceptionist(actor: Actor): void {
  if (!AUTHORIZATION_ENFORCED) return;
  if (actor.role === ROLE_QUAN_LY) {
    throw new AppError('FORBIDDEN_ROLE', FORBIDDEN);
  }
}

export function requireManager(actor: Actor): void {
  if (!AUTHORIZATION_ENFORCED) return;
  if (actor.role !== ROLE_QUAN_LY) {
    throw new AppError('FORBIDDEN_ROLE', FORBIDDEN);
  }
}

// BR-17, QT-14: du lieu phieu gioi han theo trung tam trong token.
export function requireSameCenter(actor: Actor, centerCode: string): void {
  if (centerCode !== actor.centerCode) {
    throw new AppError('CENTER_OUT_OF_SCOPE', 'Phiếu không thuộc trung tâm của bạn');
  }
}
