import { AppError } from '#errors/app-error';
import { isPriority, type Priority } from '#lib/due-date';

import { readText, toPositiveInt } from './common';

const MAX_ISSUE_DESC_LENGTH = 2000;

export type TicketInput = {
  customerId: number | null;
  deviceId: number | null;
  issueDesc: string;
  categoryId: number;
  priority: Priority;
};

export function validateTicketInput(body: Record<string, unknown>): TicketInput {
  const issueDesc = readText(body.issue_desc);
  if (!issueDesc || issueDesc.length > MAX_ISSUE_DESC_LENGTH) {
    throw new AppError('VALIDATION_FAILED', 'Mô tả lỗi do khách kể là trường bắt buộc', {
      issue_desc: 'Trường bắt buộc',
    });
  }

  const customerId = toPositiveInt(body.customer_id);
  const deviceId = toPositiveInt(body.device_id);
  const categoryId = toPositiveInt(body.category_id);
  const priority = body.priority;

  if (!categoryId || !isPriority(priority)) {
    throw new AppError('VALIDATION_FAILED', 'Vui lòng chọn nhóm sự cố và mức ưu tiên', {
      ...(categoryId ? {} : { category_id: 'Trường bắt buộc' }),
      ...(isPriority(priority) ? {} : { priority: 'Trường bắt buộc' }),
    });
  }

  return { customerId, deviceId, issueDesc, categoryId, priority };
}
