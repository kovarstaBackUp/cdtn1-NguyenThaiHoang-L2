import { AppError } from '#errors/app-error';

import { readText } from './common';

const DEFAULT_WARRANTY_MONTHS = 12;
const MIN_WARRANTY_MONTHS = 1;
const MAX_WARRANTY_MONTHS = 120;

export type DeviceInput = {
  customerId: number;
  serialNo: string;
  isExternal: boolean;
  originNote: string | null;
  purchaseDate: string | null;
  warrantyMonths: number;
};

export function validateDeviceInput(body: Record<string, unknown>): DeviceInput {
  const customerId = body.customer_id;
  if (typeof customerId !== 'number' || !Number.isInteger(customerId) || customerId <= 0) {
    throw new AppError('VALIDATION_FAILED', 'Khách hàng là trường bắt buộc', {
      customer_id: 'Trường bắt buộc',
    });
  }

  const serialNo = readText(body.serial_no);
  if (!serialNo) {
    throw new AppError('VALIDATION_FAILED', 'Số serial/IMEI là trường bắt buộc', {
      serial_no: 'Trường bắt buộc',
    });
  }

  const isExternal = body.is_external === true;
  const originNote = readText(body.origin_note);
  if (isExternal && !originNote) {
    throw new AppError('VALIDATION_FAILED', 'Thiết bị mua ngoài phải có ghi chú nguồn gốc', {
      origin_note: 'Trường bắt buộc',
    });
  }

  const rawPurchaseDate = body.purchase_date ?? null;
  const purchaseDate = typeof rawPurchaseDate === 'string' ? rawPurchaseDate : null;
  if (purchaseDate !== null && purchaseDate > new Date().toISOString().slice(0, 10)) {
    throw new AppError('VALIDATION_FAILED', 'Ngày mua không hợp lệ', {
      purchase_date: 'Không được sau ngày hiện tại',
    });
  }

  const rawWarrantyMonths = body.warranty_months ?? DEFAULT_WARRANTY_MONTHS;
  const warrantyMonths = typeof rawWarrantyMonths === 'number' ? rawWarrantyMonths : Number.NaN;
  if (
    !Number.isInteger(warrantyMonths) ||
    warrantyMonths < MIN_WARRANTY_MONTHS ||
    warrantyMonths > MAX_WARRANTY_MONTHS
  ) {
    throw new AppError('VALIDATION_FAILED', 'Số tháng bảo hành không hợp lệ', {
      warranty_months: 'Từ 1 đến 120',
    });
  }

  return {
    customerId,
    serialNo,
    isExternal,
    originNote: originNote || null,
    purchaseDate,
    warrantyMonths,
  };
}
