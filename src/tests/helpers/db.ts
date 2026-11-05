// Helper cho bon ca can co so du lieu that: TC-09 den TC-12.
//
// Repository cua du an chi co doc va ghi, khong co ham xoa, va runtime Prisma khong lo
// truy van tho, nen khong the don sach bang TRUNCATE tu trong test. Thay vao do moi ca
// tu tao khach va thiet bi rieng voi so dien thoai va serial sinh tu dong ho, nen chay
// lai bao nhieu lan hay doi thu tu chay deu khong dam vao nhau.

import type { Actor } from '../../src/services/access';
import { customerService } from '../../src/services/customer.service';

// Hai tai khoan nay la hai dong ma seed tao ra, ma nhan vien 1 va quan ly 2, cung TT01.
export const NHAN_VIEN: Actor = {
  employeeId: BigInt(1),
  role: 'NHAN_VIEN',
  centerCode: 'TT01',
};

export const QUAN_LY: Actor = {
  employeeId: BigInt(2),
  role: 'QUAN_LY',
  centerCode: 'TT01',
};

// Cung la quan ly nhung thuoc trung tam khac, de kiem gioi han du lieu cua BR-17.
export const QUAN_LY_TRUNG_TAM_KHAC: Actor = {
  employeeId: BigInt(2),
  role: 'QUAN_LY',
  centerCode: 'TT02',
};

let dem = 0;

// So dien thoai hop le phai dung 10 chu so bat dau bang 0, va khong trung lan chay truoc.
export function soDienThoaiMoi(): string {
  dem += 1;

  return `0${String(Date.now() + dem).slice(-9)}`;
}

export function serialMoi(): string {
  dem += 1;

  return `SN-TEST-${Date.now()}-${dem}`;
}

export type KhachVaThietBi = {
  customerId: number;
  deviceId: number;
};

// Tao mot khach va mot thiet bi moi, de ca test khong dung chung du lieu voi ca khac.
export async function taoKhachVaThietBi(): Promise<KhachVaThietBi> {
  const khach = await customerService.create({
    phone: soDienThoaiMoi(),
    fullName: 'Khach Kiem Thu',
    address: null,
  });

  const thietBi = await customerService.registerDevice({
    customerId: khach.customer_id,
    serialNo: serialMoi(),
    isExternal: true,
    originNote: 'khach mua tai cua hang khac',
    purchaseDate: null,
    warrantyMonths: 12,
  });

  return { customerId: khach.customer_id, deviceId: thietBi.device_id };
}
