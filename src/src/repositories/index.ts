import { db } from '#prisma/db';

import { createCategoryRepository, type CategoryRepository } from './category.repository';
import { createCustomerRepository, type CustomerRepository } from './customer.repository';
import { createDeviceRepository, type DeviceRepository } from './device.repository';
import { createLogRepository, type LogRepository } from './log.repository';
import { createTicketRepository, type TicketRepository } from './ticket.repository';

export type Repositories = {
  customers: CustomerRepository;
  devices: DeviceRepository;
  categories: CategoryRepository;
  tickets: TicketRepository;
  logs: LogRepository;
};

export type UnitOfWork = Repositories & {
  transaction<T>(work: (tx: Repositories) => Promise<T>): Promise<T>;
};

export function createRepositories(orm = db.orm.public): Repositories {
  return {
    customers: createCustomerRepository(orm),
    devices: createDeviceRepository(orm),
    categories: createCategoryRepository(orm),
    tickets: createTicketRepository(orm),
    logs: createLogRepository(orm),
  };
}

export function createUnitOfWork(orm = db.orm.public): UnitOfWork {
  return {
    ...createRepositories(orm),
    transaction(work) {
      return db.transaction((transaction) => work(createRepositories(transaction.orm.public)));
    },
  };
}

export const unitOfWork = createUnitOfWork();
