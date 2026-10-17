import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { db } from '#prisma/db';

export type DeviceRecord = {
  deviceId: number;
  customerId: number;
  serialNo: string;
  isExternal: boolean;
  originNote: string | null;
  purchaseDate: string | null;
  warrantyMonths: number;
  isActive: boolean;
};

export type NewDevice = {
  customerId: number;
  serialNo: string;
  isExternal: boolean;
  originNote: string | null;
  purchaseDate: string | null;
  warrantyMonths: number;
};

export type DeviceRepository = {
  findByIdForCustomer(deviceId: number, customerId: number): Promise<DeviceRecord | null>;
  findByIds(deviceIds: number[]): Promise<DeviceRecord[]>;
  findBySerial(serialNo: string): Promise<DeviceRecord | null>;
  listByCustomer(customerId: number): Promise<DeviceRecord[]>;
  create(data: NewDevice): Promise<DeviceRecord>;
};

type DeviceRow = {
  deviceId: bigint;
  customerId: bigint;
  serialNo: string;
  isExternal: boolean;
  originNote: string | null;
  purchaseDate: string | null;
  warrantyMonths: number;
  isActive: boolean;
};

const FIELDS = [
  'deviceId',
  'customerId',
  'serialNo',
  'isExternal',
  'originNote',
  'purchaseDate',
  'warrantyMonths',
  'isActive',
] as const;

function toRecord(row: DeviceRow): DeviceRecord {
  return {
    deviceId: Number(row.deviceId),
    customerId: Number(row.customerId),
    serialNo: String(row.serialNo),
    isExternal: row.isExternal,
    originNote: row.originNote === null ? null : String(row.originNote),
    purchaseDate: row.purchaseDate === null ? null : String(row.purchaseDate),
    warrantyMonths: row.warrantyMonths,
    isActive: row.isActive,
  };
}

export function createDeviceRepository(orm = db.orm.public): DeviceRepository {
  return {
    async findByIdForCustomer(deviceId, customerId) {
      const row = await orm.Device.where({
        deviceId: BigInt(deviceId),
        customerId: BigInt(customerId),
      })
        .select(...FIELDS)
        .first();

      return row === null ? null : toRecord(row);
    },

    async findByIds(deviceIds) {
      if (deviceIds.length === 0) return [];

      const rows = await orm.Device.select(...FIELDS)
        .where((device) => device.deviceId.in(deviceIds.map(BigInt)))
        .all();

      return rows.map(toRecord);
    },

    async findBySerial(serialNo) {
      const row = await orm.Device.where({ serialNo: serialNo as Varchar<50> })
        .select(...FIELDS)
        .first();

      return row === null ? null : toRecord(row);
    },

    async listByCustomer(customerId) {
      const rows = await orm.Device.where({ customerId: BigInt(customerId) })
        .select(...FIELDS)
        .all();

      return rows.map(toRecord);
    },

    async create(data) {
      const row = await orm.Device.create({
        customerId: BigInt(data.customerId),
        serialNo: data.serialNo as Varchar<50>,
        isExternal: data.isExternal,
        originNote: data.originNote === null ? null : (data.originNote as Varchar<200>),
        purchaseDate: data.purchaseDate,
        warrantyMonths: data.warrantyMonths,
        isActive: true,
      });

      return toRecord(row);
    },
  };
}
