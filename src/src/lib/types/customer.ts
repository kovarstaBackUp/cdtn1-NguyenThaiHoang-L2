export type CustomerDevice = {
  device_id: number;
  serial_no: string;
  is_external: boolean;
  origin_note: string | null;
  purchase_date: string | null;
  warranty_months: number;
};

export type Customer = {
  customer_id: number;
  full_name: string;
  phone_masked: string;
  phone?: string;
  address: string | null;
  devices: CustomerDevice[];
};

export type CustomerCreated = Pick<Customer, 'customer_id' | 'full_name' | 'phone_masked'>;
