import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { db } from '#prisma/db';

import type { WarrantyFilter } from '#validators/ticket-query.validator';

export type TicketRecord = {
  ticketId: number;
  ticketCode: string;
  customerId: number;
  deviceId: number;
  centerCode: string;
  issueDesc: string;
  priority: string;
  status: string;
  categoryId: number;
  isWarranty: boolean | null;
  rejectReason: string | null;
  receivedAt: Date;
  dueDate: Date;
};

export type TicketListFilter = {
  centerCode: string;
  categoryId: number | null;
  warranty: WarrantyFilter | null;
};

export type NewTicket = {
  ticketCode: string;
  customerId: number;
  deviceId: number;
  centerCode: string;
  createdBy: bigint;
  issueDesc: string;
  priority: string;
  status: string;
  categoryId: number;
  receivedAt: string;
  dueDate: string;
};

export type WarrantyDecisionPatch = {
  isWarranty: boolean;
  verifiedBy: bigint;
  verifiedAt: string;
  rejectReason: string | null;
};

export type OpenTicket = {
  ticketCode: string;
};

export type TicketRepository = {
  findOpenByDeviceId(deviceId: number, closedStatus: string): Promise<OpenTicket | null>;
  findLatestCodeForYear(year: string): Promise<string | null>;
  create(data: NewTicket): Promise<TicketRecord>;
  findById(ticketId: number): Promise<TicketRecord | null>;
  listByCenter(filter: TicketListFilter): Promise<TicketRecord[]>;
  setWarrantyDecision(ticketId: number, patch: WarrantyDecisionPatch): Promise<TicketRecord | null>;
};

type TicketRow = {
  ticketId: bigint;
  ticketCode: string;
  customerId: bigint;
  deviceId: bigint;
  centerCode: string;
  issueDesc: string;
  priority: string;
  status: string;
  categoryId: number;
  isWarranty: boolean | null;
  rejectReason: string | null;
  receivedAt: string;
  dueDate: string;
};

const FIELDS = [
  'ticketId',
  'ticketCode',
  'customerId',
  'deviceId',
  'centerCode',
  'issueDesc',
  'priority',
  'status',
  'categoryId',
  'isWarranty',
  'rejectReason',
  'receivedAt',
  'dueDate',
] as const;

// The driver hands back timestamptz as "2026-10-19 09:14:36+00".
function parseDbTimestamp(value: string): Date {
  const iso = value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');

  return new Date(iso);
}

function toRecord(row: TicketRow): TicketRecord {
  return {
    ticketId: Number(row.ticketId),
    ticketCode: String(row.ticketCode),
    customerId: Number(row.customerId),
    deviceId: Number(row.deviceId),
    centerCode: String(row.centerCode),
    issueDesc: String(row.issueDesc),
    priority: String(row.priority),
    status: String(row.status),
    categoryId: row.categoryId,
    isWarranty: row.isWarranty ?? null,
    rejectReason: row.rejectReason === null ? null : String(row.rejectReason),
    receivedAt: parseDbTimestamp(String(row.receivedAt)),
    dueDate: parseDbTimestamp(String(row.dueDate)),
  };
}

export function createTicketRepository(orm = db.orm.public): TicketRepository {
  return {
    async findOpenByDeviceId(deviceId, closedStatus) {
      const row = await orm.Ticket.select('ticketCode')
        .where({ deviceId: BigInt(deviceId) })
        .where((ticket) => ticket.status.neq(closedStatus as Varchar<20>))
        .first();

      return row === null ? null : { ticketCode: String(row.ticketCode) };
    },

    async findLatestCodeForYear(year) {
      const row = await orm.Ticket.select('ticketCode')
        .where((ticket) => ticket.ticketCode.like(`BH-%/${year}`))
        .orderBy((ticket) => ticket.ticketCode.desc())
        .first();

      return row === null ? null : String(row.ticketCode);
    },

    async create(data) {
      const row = await orm.Ticket.create({
        ticketCode: data.ticketCode as Varchar<20>,
        customerId: BigInt(data.customerId),
        deviceId: BigInt(data.deviceId),
        centerCode: data.centerCode as Varchar<20>,
        createdBy: data.createdBy,
        issueDesc: data.issueDesc as Varchar<2000>,
        priority: data.priority as Varchar<10>,
        status: data.status as Varchar<20>,
        categoryId: data.categoryId,
        receivedAt: data.receivedAt,
        dueDate: data.dueDate,
      });

      return toRecord(row);
    },

    async findById(ticketId) {
      const row = await orm.Ticket.where({ ticketId: BigInt(ticketId) })
        .select(...FIELDS)
        .first();

      return row === null ? null : toRecord(row);
    },

    async listByCenter(filter) {
      let query = orm.Ticket.select(...FIELDS).where({
        centerCode: filter.centerCode as Varchar<20>,
      });

      if (filter.categoryId !== null) {
        query = query.where({ categoryId: filter.categoryId });
      }
      if (filter.warranty === 'CHUA_DUYET') {
        query = query.where((ticket) => ticket.isWarranty.isNull());
      }
      if (filter.warranty === 'MIEN_PHI') {
        query = query.where({ isWarranty: true });
      }
      if (filter.warranty === 'TINH_PHI') {
        query = query.where({ isWarranty: false });
      }

      const rows = await query.all();

      return rows.map(toRecord);
    },

    async setWarrantyDecision(ticketId, patch) {
      const row = await orm.Ticket.where({ ticketId: BigInt(ticketId) }).update({
        isWarranty: patch.isWarranty,
        verifiedBy: patch.verifiedBy,
        verifiedAt: patch.verifiedAt,
        rejectReason: patch.rejectReason === null ? null : (patch.rejectReason as Varchar<300>),
      });

      return row === null ? null : toRecord(row);
    },
  };
}
