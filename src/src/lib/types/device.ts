export type DeviceCreated = {
  device_id: number;
  serial_no: string;
  is_external: boolean;
  purchase_date: string | null;
  warranty_months: number;
};
