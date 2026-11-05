import { expect, test } from 'vitest';

import type { AppError } from '../src/errors/app-error';
import type { CategoryRepository } from '../src/repositories/category.repository';
import type { CustomerRepository } from '../src/repositories/customer.repository';
import type { DeviceRepository } from '../src/repositories/device.repository';
import type { Repositories, UnitOfWork } from '../src/repositories/index';
import type { LogRepository } from '../src/repositories/log.repository';
import type { TicketRepository } from '../src/repositories/ticket.repository';
import { createTicketService } from '../src/services/ticket.service';
import type { TicketInput } from '../src/validators/ticket.validator';

// Du lieu mau dung chung cho ca hai ca test.
const KHACH = {
  customerId: 1024,
  phone: '0901234567',
  fullName: 'Nguyễn Văn An',
  address: '12 Lê Lợi, Quận 10',
  isActive: true,
};

const THIET_BI = {
  deviceId: 3311,
  customerId: 1024,
  serialNo: 'SN-PHONE-123',
  isExternal: false,
  originNote: null,
  purchaseDate: '2025-11-20',
  warrantyMonths: 12,
  isActive: true,
};

const NHOM_SU_CO = {
  categoryId: 1,
  categoryName: 'Màn hình',
  defaultPriority: 'CAO',
};

const NHAN_VIEN = {
  employeeId: BigInt(1),
  role: 'NHAN_VIEN',
  centerCode: 'TT01',
};

const DAU_VAO: TicketInput = {
  customerId: 1024,
  deviceId: 3311,
  issueDesc: 'Màn hình chớp tắt khi cắm sạc',
  categoryId: 1,
  priority: 'CAO',
};

// Phuong thuc khong dung trong ca test thi nem loi, de neu service bat dau goi sang
// thi test do ngay chu khong im lang bo qua.
function khongDung(): never {
  throw new Error('Phuong thuc nay khong duoc dung trong ca test');
}

// Doi tuong gia thay cho repository that: giu du lieu trong mang, khong cham co so du lieu.
function taoDoiTuongGia(phieuDangMo: { ticketCode: string }[] = []) {
  const phieuDaTao: { ticketCode: string; deviceId: number }[] = [];
  const nhatKyDaGhi: { ticketId: number; fromStatus: string | null; toStatus: string }[] = [];

  const customers: CustomerRepository = {
    findByPhone: khongDung,
    findById: async (customerId) => (customerId === KHACH.customerId ? KHACH : null),
    findByIds: async () => [KHACH],
    create: khongDung,
  };

  const devices: DeviceRepository = {
    findByIdForCustomer: async (deviceId, customerId) =>
      deviceId === THIET_BI.deviceId && customerId === THIET_BI.customerId ? THIET_BI : null,
    findByIds: async () => [THIET_BI],
    findBySerial: khongDung,
    listByCustomer: async () => [THIET_BI],
    create: khongDung,
  };

  const categories: CategoryRepository = {
    findById: async (categoryId) =>
      categoryId === NHOM_SU_CO.categoryId ? NHOM_SU_CO : null,
    findByIds: async () => [NHOM_SU_CO],
    list: async () => [NHOM_SU_CO],
  };

  const tickets: TicketRepository = {
    findOpenByDeviceId: async () => phieuDangMo[0] ?? null,
    findLatestCodeForYear: async () => null,
    create: async (data) => {
      phieuDaTao.push({ ticketCode: data.ticketCode, deviceId: data.deviceId });

      return {
        ticketId: 88231,
        ticketCode: data.ticketCode,
        customerId: data.customerId,
        deviceId: data.deviceId,
        centerCode: data.centerCode,
        issueDesc: data.issueDesc,
        priority: data.priority,
        status: data.status,
        categoryId: data.categoryId,
        isWarranty: null,
        rejectReason: null,
        receivedAt: new Date('2026-09-08T14:30:00+07:00'),
        dueDate: new Date('2026-09-09T14:30:00+07:00'),
      };
    },
    findById: khongDung,
    listByCenter: khongDung,
    setWarrantyDecision: khongDung,
  };

  const logs: LogRepository = {
    insertStatusChange: async (data) => {
      nhatKyDaGhi.push({
        ticketId: data.ticketId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
      });
    },
  };

  const repositories: Repositories = { customers, devices, categories, tickets, logs };

  const uow: UnitOfWork = {
    ...repositories,
    transaction: (work) => work(repositories),
  };

  return { uow, phieuDaTao, nhatKyDaGhi };
}

// Goi mot ham va tra ve loi no nem ra, de kiem duoc ca ma loi lan thong diep.
async function layLoi(goi: () => Promise<unknown>): Promise<AppError> {
  try {
    await goi();
  } catch (error) {
    return error as AppError;
  }

  throw new Error('Mong doi co loi nhung khong co loi nao duoc nem ra');
}

test('TC-07 tao phieu sinh ma dung dang va ghi dung mot dong nhat ky (BR-07, BR-08)', async () => {
  const { uow, phieuDaTao, nhatKyDaGhi } = taoDoiTuongGia();
  const service = createTicketService(uow);

  const ketQua = await service.create(NHAN_VIEN, DAU_VAO);

  expect(phieuDaTao).toHaveLength(1);
  expect(ketQua.ticket_code).toMatch(/^BH-\d{6}\/\d{4}$/);
  expect(ketQua.status).toBe('MOI');

  expect(nhatKyDaGhi).toHaveLength(1);
  expect(nhatKyDaGhi[0].ticketId).toBe(88231);
  expect(nhatKyDaGhi[0].fromStatus).toBeNull();
  expect(nhatKyDaGhi[0].toStatus).toBe('MOI');
});

test('TC-08 thiet bi dang co phieu mo thi tu choi va khong ghi gi (BR-06)', async () => {
  const { uow, phieuDaTao, nhatKyDaGhi } = taoDoiTuongGia([{ ticketCode: 'BH-000123/2026' }]);
  const service = createTicketService(uow);

  const loi = await layLoi(() => service.create(NHAN_VIEN, DAU_VAO));

  expect(loi.code).toBe('DEVICE_HAS_OPEN_TICKET');
  expect(loi.status).toBe(409);
  expect(loi.message).toContain('BH-000123/2026');

  expect(phieuDaTao).toHaveLength(0);
  expect(nhatKyDaGhi).toHaveLength(0);
});
