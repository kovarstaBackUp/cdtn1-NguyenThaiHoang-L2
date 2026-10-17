import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { connectDatabase, db } from './db.ts';

const person = {
  phone: '0900000001' as Varchar<20>,
  fullName: 'Nguyen Van A' as Varchar<120>,
  address: '123 Duong Le Loi, Quan 1' as Varchar<255>,
  isActive: true,
};

const devices = [
  {
    serialNo: 'SN-IP14-000123' as Varchar<50>,
    isExternal: false,
    originNote: null,
    purchaseDate: '2024-03-15',
    warrantyMonths: 12,
    isActive: true,
  },
  {
    serialNo: 'SN-SS-S24-000456' as Varchar<50>,
    isExternal: true,
    originNote: 'Khach mua tai cua hang khac' as Varchar<200>,
    purchaseDate: null,
    warrantyMonths: 6,
    isActive: true,
  },
  {
    serialNo: 'SN-XM-13-000789' as Varchar<50>,
    isExternal: true,
    originNote: 'Mua lai tu nguoi quen, khong co hoa don' as Varchar<200>,
    purchaseDate: null,
    warrantyMonths: 3,
    isActive: false,
  },
];

const employees = [
  { fullName: 'Tran Van Nhan', role: 'NHAN_VIEN', centerCode: 'TT01' },
  { fullName: 'Le Thi Quan', role: 'QUAN_LY', centerCode: 'TT01' },
];

const categories = [
  { categoryName: 'Man hinh', defaultPriority: 'CAO' },
  { categoryName: 'Pin', defaultPriority: 'TRUNG_BINH' },
  { categoryName: 'Sac', defaultPriority: 'TRUNG_BINH' },
  { categoryName: 'Phan mem', defaultPriority: 'THAP' },
  { categoryName: 'Nuoc vao', defaultPriority: 'CAO' },
  { categoryName: 'Khac', defaultPriority: 'THAP' },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  const customer = await db.orm.public.Customer.upsert({
    create: person,
    update: {},
    conflictOn: { phone: person.phone },
  });

  for (const device of devices) {
    await db.orm.public.Device.upsert({
      create: { ...device, customerId: customer.customerId },
      update: {},
      conflictOn: { serialNo: device.serialNo },
    });
  }

  const existingEmployee = await db.orm.public.Employee.first();
  if (!existingEmployee) {
    for (const employee of employees) {
      await db.orm.public.Employee.create({
        fullName: employee.fullName as Varchar<120>,
        role: employee.role as Varchar<20>,
        centerCode: employee.centerCode as Varchar<20>,
      });
    }
  }

  for (const category of categories) {
    await db.orm.public.IssueCategory.upsert({
      create: {
        categoryName: category.categoryName as Varchar<60>,
        defaultPriority: category.defaultPriority as Varchar<10>,
      },
      update: {},
      conflictOn: { categoryName: category.categoryName as Varchar<60> },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
