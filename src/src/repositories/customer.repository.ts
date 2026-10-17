import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { db } from '#prisma/db';

export type CustomerRecord = {
  customerId: number;
  phone: string;
  fullName: string;
  address: string | null;
  isActive: boolean;
};

export type NewCustomer = {
  phone: string;
  fullName: string;
  address: string | null;
};

export type CustomerRepository = {
  findByPhone(phone: string): Promise<CustomerRecord | null>;
  findById(customerId: number): Promise<CustomerRecord | null>;
  findByIds(customerIds: number[]): Promise<CustomerRecord[]>;
  create(data: NewCustomer): Promise<CustomerRecord>;
};

type CustomerRow = {
  customerId: bigint;
  phone: string;
  fullName: string;
  address: string | null;
  isActive: boolean;
};

const FIELDS = ['customerId', 'phone', 'fullName', 'address', 'isActive'] as const;

function toRecord(row: CustomerRow): CustomerRecord {
  return {
    customerId: Number(row.customerId),
    phone: String(row.phone),
    fullName: String(row.fullName),
    address: row.address === null ? null : String(row.address),
    isActive: row.isActive,
  };
}

export function createCustomerRepository(orm = db.orm.public): CustomerRepository {
  return {
    async findByPhone(phone) {
      const row = await orm.Customer.where({ phone: phone as Varchar<20> })
        .select(...FIELDS)
        .first();

      return row === null ? null : toRecord(row);
    },

    async findById(customerId) {
      const row = await orm.Customer.where({ customerId: BigInt(customerId) })
        .select(...FIELDS)
        .first();

      return row === null ? null : toRecord(row);
    },

    async findByIds(customerIds) {
      if (customerIds.length === 0) return [];

      const rows = await orm.Customer.select(...FIELDS)
        .where((customer) => customer.customerId.in(customerIds.map(BigInt)))
        .all();

      return rows.map(toRecord);
    },

    async create(data) {
      const row = await orm.Customer.create({
        phone: data.phone as Varchar<20>,
        fullName: data.fullName as Varchar<120>,
        address: data.address === null ? null : (data.address as Varchar<255>),
        isActive: true,
      });

      return toRecord(row);
    },
  };
}
