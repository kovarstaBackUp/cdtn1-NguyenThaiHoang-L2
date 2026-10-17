import { AppError } from '#errors/app-error';
import { maskPhone } from '#lib/phone';
import type { Customer, CustomerCreated, CustomerDevice } from '#lib/types/customer';
import type { DeviceCreated } from '#lib/types/device';
import { unitOfWork, type UnitOfWork } from '#repositories/index';
import type { DeviceRecord } from '#repositories/device.repository';
import type { CustomerInput } from '#validators/customer.validator';
import type { DeviceInput } from '#validators/device.validator';

import { ROLE_QUAN_LY, type Actor } from './access';

function toCustomerDevice(device: DeviceRecord): CustomerDevice {
  return {
    device_id: device.deviceId,
    serial_no: device.serialNo,
    is_external: device.isExternal,
    origin_note: device.originNote,
    purchase_date: device.purchaseDate,
    warranty_months: device.warrantyMonths,
  };
}

function toDeviceCreated(device: DeviceRecord): DeviceCreated {
  return {
    device_id: device.deviceId,
    serial_no: device.serialNo,
    is_external: device.isExternal,
    purchase_date: device.purchaseDate,
    warranty_months: device.warrantyMonths,
  };
}

export function createCustomerService(uow: UnitOfWork = unitOfWork) {
  return {
    async search(actor: Actor, phone: string): Promise<Customer> {
      const customer = await uow.customers.findByPhone(phone);
      if (!customer) {
        throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy thông tin khách hàng');
      }

      const devices = await uow.devices.listByCustomer(customer.customerId);

      const body: Customer = {
        customer_id: customer.customerId,
        full_name: customer.fullName,
        phone_masked: maskPhone(customer.phone),
        address: customer.address,
        devices: devices.map(toCustomerDevice),
      };

      // NFR2, QT-15: chi Quan ly trung tam nhan so dien thoai day du.
      if (actor.role === ROLE_QUAN_LY) {
        body.phone = customer.phone;
      }

      return body;
    },

    async create(input: CustomerInput): Promise<CustomerCreated> {
      const existing = await uow.customers.findByPhone(input.phone);
      if (existing) {
        throw new AppError('CUSTOMER_EXISTS', 'Số điện thoại đã tồn tại trên hệ thống', {
          existing_customer_id: existing.customerId,
        });
      }

      const created = await uow.customers.create({
        phone: input.phone,
        fullName: input.fullName,
        address: input.address,
      });

      return {
        customer_id: created.customerId,
        full_name: created.fullName,
        phone_masked: maskPhone(created.phone),
      };
    },

    async registerDevice(input: DeviceInput): Promise<DeviceCreated> {
      const customer = await uow.customers.findById(input.customerId);
      if (!customer) {
        throw new AppError('CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng');
      }

      // BR-03, BR-05, QT-03: serial duy nhat toan he thong.
      const existing = await uow.devices.findBySerial(input.serialNo);
      if (existing) {
        if (existing.customerId !== customer.customerId) {
          throw new AppError(
            'SERIAL_OWNED_BY_OTHER',
            'Serial/IMEI này đang thuộc một khách hàng khác. Vui lòng chuyển Quản lý trung tâm xử lý',
          );
        }

        return toDeviceCreated(existing);
      }

      const created = await uow.devices.create({
        customerId: customer.customerId,
        serialNo: input.serialNo,
        isExternal: input.isExternal,
        originNote: input.originNote,
        purchaseDate: input.purchaseDate,
        warrantyMonths: input.warrantyMonths,
      });

      return toDeviceCreated(created);
    },
  };
}

export const customerService = createCustomerService();
