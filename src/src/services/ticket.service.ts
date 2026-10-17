import { AppError } from '#errors/app-error';
import { calculateDueDate, toVietnamIso } from '#lib/due-date';
import type { IssueCategoryList } from '#lib/types/issue-category';
import type { TicketCreated } from '#lib/types/ticket';
import { unitOfWork, type UnitOfWork } from '#repositories/index';
import type { TicketInput } from '#validators/ticket.validator';

import type { Actor } from './access';

export const STATUS_MOI = 'MOI';
export const STATUS_CLOSED = 'DA_DONG';

export function createTicketService(uow: UnitOfWork = unitOfWork) {
  return {
    // BR-15: danh muc nhom su cau la du lieu cai san, sap san theo ma de client
    // dung truc tiep lam thu tu hien thi.
    async listCategories(): Promise<IssueCategoryList> {
      const categories = await uow.categories.list();

      const items = categories
        .map((category) => ({
          category_id: category.categoryId,
          category_name: category.categoryName,
          default_priority: category.defaultPriority,
        }))
        .sort((left, right) => left.category_id - right.category_id);

      return { total: items.length, items };
    },

    async create(actor: Actor, input: TicketInput): Promise<TicketCreated> {
      const customerId = input.customerId;
      if (customerId === null) {
        throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng');
      }

      const customer = await uow.customers.findById(customerId);
      if (!customer) {
        throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng');
      }

      // BR-03, QT-03: thiet bi phai thuoc dung khach hang.
      const deviceId = input.deviceId;
      if (deviceId === null) {
        throw new AppError('DEVICE_NOT_FOUND', 'Thiết bị không thuộc về khách hàng này');
      }

      const device = await uow.devices.findByIdForCustomer(deviceId, customerId);
      if (!device) {
        throw new AppError('DEVICE_NOT_FOUND', 'Thiết bị không thuộc về khách hàng này');
      }

      const category = await uow.categories.findById(input.categoryId);
      if (!category) {
        throw new AppError('CATEGORY_NOT_FOUND', 'Vui lòng chọn nhóm sự cố và mức ưu tiên');
      }

      const receivedAt = new Date();
      const dueDate = calculateDueDate(receivedAt, input.priority);
      const receivedAtIso = toVietnamIso(receivedAt);
      const year = receivedAtIso.slice(0, 4);

      let openTicketCode: string | null = null;

      const created = await uow.transaction(async (tx) => {
        // BR-06: mot thiet bi khong duoc co hai phieu chua dong cung luc.
        const openTicket = await tx.tickets.findOpenByDeviceId(deviceId, STATUS_CLOSED);
        if (openTicket) {
          openTicketCode = openTicket.ticketCode;

          return null;
        }

        // BR-08: ma phieu 6 chu so, bat dau lai tu 000001 moi nam.
        const lastCode = await tx.tickets.findLatestCodeForYear(year);
        const sequence = lastCode ? Number(lastCode.slice(3, 9)) + 1 : 1;
        const ticketCode = `BH-${String(sequence).padStart(6, '0')}/${year}`;

        return tx.tickets.create({
          ticketCode,
          customerId,
          deviceId,
          centerCode: actor.centerCode,
          createdBy: actor.employeeId,
          issueDesc: input.issueDesc,
          priority: input.priority,
          status: STATUS_MOI,
          categoryId: input.categoryId,
          receivedAt: receivedAtIso,
          dueDate: toVietnamIso(dueDate),
        });
      });

      if (!created) {
        throw new AppError(
          'DEVICE_HAS_OPEN_TICKET',
          `Thiết bị đang có phiếu ${openTicketCode} chưa đóng`,
          { open_ticket_code: openTicketCode },
        );
      }

      return {
        ticket_id: created.ticketId,
        ticket_code: created.ticketCode,
        status: created.status,
        customer_id: created.customerId,
        device_id: created.deviceId,
        center_code: created.centerCode,
        category_id: created.categoryId,
        priority: created.priority,
        is_warranty: created.isWarranty,
        verified_by: null,
        verified_at: null,
        reject_reason: null,
        received_at: receivedAtIso,
        due_date: toVietnamIso(dueDate),
      };
    },
  };
}

export const ticketService = createTicketService();
