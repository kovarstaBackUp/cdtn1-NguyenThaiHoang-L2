export type TicketCreated = {
  ticket_id: number;
  ticket_code: string;
  status: string;
  customer_id: number;
  device_id: number;
  center_code: string;
  category_id: number;
  priority: string;
  is_warranty: boolean | null;
  verified_by: number | null;
  verified_at: string | null;
  reject_reason: string | null;
  received_at: string;
  due_date: string;
};

export type TicketListItem = {
  ticket_id: number;
  ticket_code: string;
  status: string;
  is_overdue: boolean;
  due_date: string;
  is_warranty: boolean | null;
  priority: string;
  category: { category_id: number; category_name: string };
  customer: { full_name: string; phone_masked: string };
  device: { serial_no: string };
};

export type TicketList = {
  total: number;
  page: number;
  size: number;
  items: TicketListItem[];
};

export type WarrantyDecision = {
  ticket_id: number;
  is_warranty: boolean;
  verified_by: number;
  verified_at: string;
  reject_reason: string | null;
};
