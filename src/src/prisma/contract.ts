import { autoincrement, defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract(
  { naming: { tables: 'snake_case', columns: 'snake_case' } },
  ({ field, model, rel }) => {
    // Postgres types with no first-class `field.*` preset: varchar(n), smallint, date.
    const varchar = (length: number) =>
      field.column({ codecId: 'sql/varchar@1', typeParams: { length } });
    const smallint = () => field.column({ codecId: 'pg/int2@1' });
    const date = () => field.column({ codecId: 'pg/date-string@1' });

    // customer [note: 'Khách hàng']
    const Customer = model('Customer', {
      fields: {
        customerId: field.bigint().default(autoincrement()).id(),
        phone: varchar(20).unique(),
        fullName: varchar(120),
        address: varchar(255).optional(),
        isActive: field.boolean(),
      },
    });

    // device [note: 'Thiết bị của khách, gồm thiết bị mua ngoài đã đăng ký']
    const Device = model('Device', {
      fields: {
        deviceId: field.bigint().default(autoincrement()).id(),
        customerId: field.bigint(),
        serialNo: varchar(50).unique(),
        isExternal: field.boolean(),
        originNote: varchar(200).optional(),
        purchaseDate: date().optional(),
        warrantyMonths: smallint(),
        isActive: field.boolean(),
      },
    });

    // employee [note: 'Người dùng hệ thống, hai vai trò NHAN_VIEN và QUAN_LY']
    const Employee = model('Employee', {
      fields: {
        employeeId: field.bigint().default(autoincrement()).id(),
        fullName: varchar(120),
        role: varchar(20),
        centerCode: varchar(20),
      },
    });

    // issue_category [note: 'Danh mục nhóm sự cố, dữ liệu cài sẵn']
    const IssueCategory = model('IssueCategory', {
      fields: {
        categoryId: field.int().default(autoincrement()).id(),
        categoryName: varchar(60).unique(),
        defaultPriority: varchar(10),
      },
    });

    // ticket [note: 'Phiếu bảo hành']
    const Ticket = model('Ticket', {
      fields: {
        ticketId: field.bigint().default(autoincrement()).id(),
        ticketCode: varchar(20).unique(),
        customerId: field.bigint(),
        deviceId: field.bigint(),
        centerCode: varchar(20),
        createdBy: field.bigint(),
        issueDesc: varchar(2000),
        priority: varchar(10),
        status: varchar(20),
        categoryId: field.int(),
        isWarranty: field.boolean().optional(),
        verifiedBy: field.bigint().optional(),
        verifiedAt: field.temporal.timestamptzString().optional(),
        rejectReason: varchar(300).optional(),
        receivedAt: field.temporal.timestamptzString(),
        dueDate: field.temporal.timestamptzString(),
      },
    });

    // ticket_status_log [note: 'Nhật ký trạng thái của phiếu']
    const TicketStatusLog = model('TicketStatusLog', {
      fields: {
        logId: field.bigint().default(autoincrement()).id(),
        ticketId: field.bigint(),
        fromStatus: varchar(20).optional(),
        toStatus: varchar(20),
        changedBy: field.bigint(),
        changedAt: field.temporal.timestamptzString(),
        note: varchar(255).optional(),
      },
    });

    return {
      models: {
        Customer: Customer.relations({
          devices: rel.hasMany(Device, { by: 'customerId' }),
          tickets: rel.hasMany(Ticket, { by: 'customerId' }),
        }),

        Device: Device.relations({
          customer: rel
            .belongsTo(Customer, { from: 'customerId', to: 'customerId' })
            .sql({ fk: { name: 'device_customer_id_fkey' } }),
          tickets: rel.hasMany(Ticket, { by: 'deviceId' }),
        }),

        Employee: Employee.relations({
          createdTickets: rel.hasMany(Ticket, { by: 'createdBy' }),
          verifiedTickets: rel.hasMany(Ticket, { by: 'verifiedBy' }),
          statusChanges: rel.hasMany(TicketStatusLog, { by: 'changedBy' }),
        }),

        IssueCategory: IssueCategory.relations({
          tickets: rel.hasMany(Ticket, { by: 'categoryId' }),
        }),

        Ticket: Ticket
          .relations({
            customer: rel
              .belongsTo(Customer, { from: 'customerId', to: 'customerId' })
              .sql({ fk: { name: 'ticket_customer_id_fkey' } }),
            device: rel
              .belongsTo(Device, { from: 'deviceId', to: 'deviceId' })
              .sql({ fk: { name: 'ticket_device_id_fkey' } }),
            category: rel
              .belongsTo(IssueCategory, { from: 'categoryId', to: 'categoryId' })
              .sql({ fk: { name: 'ticket_category_id_fkey' } }),
            createdByEmployee: rel
              .belongsTo(Employee, { from: 'createdBy', to: 'employeeId' })
              .sql({ fk: { name: 'ticket_created_by_fkey' } }),
            verifiedByEmployee: rel
              .belongsTo(Employee, { from: 'verifiedBy', to: 'employeeId', optional: true })
              .sql({ fk: { name: 'ticket_verified_by_fkey' } }),
            statusLogs: rel.hasMany(TicketStatusLog, { by: 'ticketId' }),
          })
          .sql(({ cols, constraints }) => ({
            indexes: [
              constraints.index([cols.centerCode, cols.dueDate], {
                name: 'ticket_center_code_due_date_idx',
              }),
              constraints.index([cols.deviceId, cols.status], {
                name: 'ticket_device_id_status_idx',
              }),
            ],
          })),

        TicketStatusLog: TicketStatusLog
          .relations({
            ticket: rel
              .belongsTo(Ticket, { from: 'ticketId', to: 'ticketId' })
              .sql({ fk: { name: 'ticket_status_log_ticket_id_fkey' } }),
            changedByEmployee: rel
              .belongsTo(Employee, { from: 'changedBy', to: 'employeeId' })
              .sql({ fk: { name: 'ticket_status_log_changed_by_fkey' } }),
          })
          .sql(({ cols, constraints }) => ({
            indexes: [
              constraints.index([cols.ticketId, cols.changedAt], {
                name: 'ticket_status_log_ticket_id_changed_at_idx',
              }),
            ],
          })),
      },
    };
  },
);
