import { expect, test } from 'vitest';

import { unitOfWork } from '../src/repositories/index';
import { POST as postTicket } from '../src/routes/api/tickets/+server';
import { PATCH as patchDecision } from '../src/routes/api/tickets/[ticket_id]/warranty-decision/+server';
import { decisionService } from '../src/services/decision.service';
import { ticketService } from '../src/services/ticket.service';

import { NHAN_VIEN, QUAN_LY, QUAN_LY_TRUNG_TAM_KHAC, taoKhachVaThietBi } from './helpers/db';

// Cac ca trong tep nay can database test, tro sang bang tests/helpers/setup-env.ts.
// TC-12 nam o tests/seed.test.ts vi no phai la noi ket noi co so du lieu dau tien.

function duLieuPhieu(customerId: number, deviceId: number) {
  return {
    customerId,
    deviceId,
    issueDesc: 'Man hinh chop tat khi cam sac',
    categoryId: 1,
    priority: 'CAO' as const,
  };
}

test('TC-09 duyet phieu ghi is_warranty vao PostgreSQL (BR-14)', async () => {
  const { customerId, deviceId } = await taoKhachVaThietBi();
  const phieu = await ticketService.create(NHAN_VIEN, duLieuPhieu(customerId, deviceId));

  const ketQua = await decisionService.decide(QUAN_LY, phieu.ticket_id, {
    decision: 'APPROVE',
    rejectReason: null,
  });

  expect(ketQua.is_warranty).toBe(true);
  expect(ketQua.verified_by).toBe(2);
  expect(ketQua.verified_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

  // Doc lai tu co so du lieu de chac rang da ghi that, khong chi tra ve trong bo nho.
  const docLai = await unitOfWork.tickets.findById(phieu.ticket_id);
  expect(docLai?.isWarranty).toBe(true);
  expect(docLai?.rejectReason).toBeNull();
});

test('TC-10 POST /api/tickets hop le tra 201 kem ma phieu (AC4.1)', async () => {
  const { customerId, deviceId } = await taoKhachVaThietBi();

  const suKien = {
    locals: { employee: NHAN_VIEN },
    request: new Request('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        device_id: deviceId,
        issue_desc: 'May sac khong vao dien',
        category_id: 1,
        priority: 'CAO',
      }),
    }),
  } as unknown as Parameters<typeof postTicket>[0];

  const phanHoi = await postTicket(suKien);
  const than = await phanHoi.json();

  expect(phanHoi.status).toBe(201);
  expect(than.ticket_code).toMatch(/^BH-\d{6}\/\d{4}$/);
  expect(than.due_date).toBeTruthy();
});

test('TC-11 quyet dinh phieu cua trung tam khac tra 403 va khong doi phieu (BR-17)', async () => {
  const { customerId, deviceId } = await taoKhachVaThietBi();
  const phieu = await ticketService.create(NHAN_VIEN, duLieuPhieu(customerId, deviceId));

  const suKien = {
    locals: { employee: QUAN_LY_TRUNG_TAM_KHAC },
    params: { ticket_id: String(phieu.ticket_id) },
    request: new Request(`http://localhost/api/tickets/${phieu.ticket_id}/warranty-decision`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ decision: 'APPROVE' }),
    }),
  } as unknown as Parameters<typeof patchDecision>[0];

  const phanHoi = await patchDecision(suKien);
  const than = await phanHoi.json();

  expect(phanHoi.status).toBe(403);
  expect(than.error.code).toBe('CENTER_OUT_OF_SCOPE');

  const docLai = await unitOfWork.tickets.findById(phieu.ticket_id);
  expect(docLai?.isWarranty).toBeNull();
});
