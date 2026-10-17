import { AppError } from '#errors/app-error';
import { normalizePhone } from '#lib/phone';

import { readText } from './common';

const INVALID_PHONE = 'Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)';

export type CustomerInput = {
  phone: string;
  fullName: string;
  address: string | null;
};

export function validateCustomerPhone(raw: string): string {
  const phone = normalizePhone(raw);

  if (!phone) {
    throw new AppError('INVALID_PHONE', INVALID_PHONE, { phone: raw });
  }

  return phone;
}

export function validateCustomerInput(body: Record<string, unknown>): CustomerInput {
  const fullName = readText(body.full_name);
  if (!fullName) {
    throw new AppError('VALIDATION_FAILED', 'Vui lòng nhập Họ tên khách hàng', {
      full_name: 'Trường bắt buộc',
    });
  }

  const address = readText(body.address);

  return {
    phone: validateCustomerPhone(readText(body.phone)),
    fullName,
    address: address || null,
  };
}
