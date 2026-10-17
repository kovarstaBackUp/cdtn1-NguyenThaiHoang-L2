import { AppError } from '#errors/app-error';
import { toVietnamIso } from '#lib/due-date';
import { maskPhone } from '#lib/phone';
import type { TicketList, TicketListItem, WarrantyDecision } from '#lib/types/ticket';
import { unitOfWork, type UnitOfWork } from '#repositories/index';
import type { TicketListQuery } from '#validators/ticket-query.validator';
import type { WarrantyDecisionInput } from '#validators/warranty-decision.validator';

import { requireSameCenter, type Actor } from './access';

function unique(values: number[]): number[] {
  return [...new Set(values)];
}

export function createDecisionService(uow: UnitOfWork = unitOfWork) {
  return {
    async list(actor: Actor, query: TicketListQuery): Promise<TicketList> {
      if (query.categoryId !== null) {
        const category = await uow.categories.findById(query.categoryId);
        if (!category) {
          throw new AppError('CATEGORY_NOT_FOUND', 'Nhóm sự cố không hợp lệ');
        }
      }

      // BR-17, QT-14: hang doi chi gom phieu cua trung tam trong token.
      const tickets = await uow.tickets.listByCenter({
        centerCode: actor.centerCode,
        categoryId: query.categoryId,
        warranty: query.warranty,
      });

      const now = Date.now();
      const ordered = tickets
        .map((ticket) => ({ ticket, dueAt: ticket.dueDate.getTime() }))
        // BR-20: phieu qua han len truoc, moi nhom xep theo due_date tang dan.
        .sort((left, right) => {
          const leftOverdue = left.dueAt < now;
          const rightOverdue = right.dueAt < now;
          if (leftOverdue !== rightOverdue) return leftOverdue ? -1 : 1;

          return left.dueAt - right.dueAt;
        });

      const total = ordered.length;
      const start = (query.page - 1) * query.size;
      const slice = ordered.slice(start, start + query.size);

      const [categories, customers, devices] = await Promise.all([
        uow.categories.findByIds(unique(slice.map((entry) => entry.ticket.categoryId))),
        uow.customers.findByIds(unique(slice.map((entry) => entry.ticket.customerId))),
        uow.devices.findByIds(unique(slice.map((entry) => entry.ticket.deviceId))),
      ]);

      const categoryById = new Map(categories.map((category) => [category.categoryId, category]));
      const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
      const deviceById = new Map(devices.map((device) => [device.deviceId, device]));

      const items: TicketListItem[] = slice.map(({ ticket, dueAt }) => {
        const category = categoryById.get(ticket.categoryId);
        const customer = customerById.get(ticket.customerId);
        const device = deviceById.get(ticket.deviceId);

        return {
          ticket_id: ticket.ticketId,
          ticket_code: ticket.ticketCode,
          status: ticket.status,
          is_overdue: dueAt < now,
          due_date: toVietnamIso(ticket.dueDate),
          is_warranty: ticket.isWarranty,
          priority: ticket.priority,
          category: {
            category_id: category?.categoryId ?? 0,
            category_name: category?.categoryName ?? '',
          },
          customer: {
            full_name: customer?.fullName ?? '',
            // NFR2, QT-15
            phone_masked: maskPhone(customer?.phone ?? ''),
          },
          device: { serial_no: device?.serialNo ?? '' },
        };
      });

      return { total, page: query.page, size: query.size, items };
    },

    async decide(
      actor: Actor,
      ticketId: number,
      input: WarrantyDecisionInput,
    ): Promise<WarrantyDecision> {
      const ticket = await uow.tickets.findById(ticketId);
      if (!ticket) {
        throw new AppError('TICKET_NOT_FOUND', 'Không tìm thấy phiếu');
      }

      requireSameCenter(actor, ticket.centerCode);

      // BR-14: moi phieu chi duoc Quan ly trung tam quyet dinh mot lan.
      if (ticket.isWarranty !== null) {
        throw new AppError('ALREADY_DECIDED', 'Phiếu đã được duyệt');
      }

      const verifiedAt = new Date();

      const updated = await uow.tickets.setWarrantyDecision(ticketId, {
        isWarranty: input.decision === 'APPROVE',
        verifiedBy: actor.employeeId,
        verifiedAt: toVietnamIso(verifiedAt),
        rejectReason: input.rejectReason,
      });

      if (!updated) {
        throw new AppError('TICKET_NOT_FOUND', 'Không tìm thấy phiếu');
      }

      return {
        ticket_id: updated.ticketId,
        is_warranty: input.decision === 'APPROVE',
        verified_by: Number(actor.employeeId),
        verified_at: toVietnamIso(verifiedAt),
        reject_reason: updated.rejectReason,
      };
    },
  };
}

export const decisionService = createDecisionService();
