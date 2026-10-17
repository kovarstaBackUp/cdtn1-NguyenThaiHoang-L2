import { AppError } from '#errors/app-error';

import { readText, toPathId } from './common';

const MAX_REJECT_REASON_LENGTH = 300;

export type WarrantyDecisionInput = {
  decision: 'APPROVE' | 'REJECT';
  rejectReason: string | null;
};

export function validateTicketId(raw: string): number {
  const ticketId = toPathId(raw);
  if (ticketId === null) {
    throw new AppError('TICKET_NOT_FOUND', 'Không tìm thấy phiếu');
  }

  return ticketId;
}

export function validateWarrantyDecisionInput(
  body: Record<string, unknown>,
): WarrantyDecisionInput {
  const decision = body.decision;
  if (decision !== 'APPROVE' && decision !== 'REJECT') {
    throw new AppError('VALIDATION_FAILED', 'Quyết định không hợp lệ');
  }

  const rejectReason = readText(body.reject_reason);
  if (decision === 'REJECT' && (!rejectReason || rejectReason.length > MAX_REJECT_REASON_LENGTH)) {
    throw new AppError('REASON_REQUIRED', 'Vui lòng nhập lý do từ chối');
  }

  return { decision, rejectReason: decision === 'REJECT' ? rejectReason : null };
}
