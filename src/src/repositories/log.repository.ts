import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

import { toVietnamIso } from '#lib/due-date';
import { db } from '#prisma/db';

export type NewStatusLog = {
  ticketId: number;
  fromStatus: string | null;
  toStatus: string;
  changedBy: bigint;
  note: string | null;
};

export type LogRepository = {
  insertStatusChange(data: NewStatusLog): Promise<void>;
};

// No endpoint in the L2 contract changes a ticket's status (QT-06), so nothing
// in this API calls this yet. It exists because ticket_status_log does, and the
// status-change flow of another track will need it.
export function createLogRepository(orm = db.orm.public): LogRepository {
  return {
    async insertStatusChange(data) {
      await orm.TicketStatusLog.create({
        ticketId: BigInt(data.ticketId),
        fromStatus: data.fromStatus === null ? null : (data.fromStatus as Varchar<20>),
        toStatus: data.toStatus as Varchar<20>,
        changedBy: data.changedBy,
        changedAt: toVietnamIso(new Date()),
        note: data.note === null ? null : (data.note as Varchar<255>),
      });
    },
  };
}
