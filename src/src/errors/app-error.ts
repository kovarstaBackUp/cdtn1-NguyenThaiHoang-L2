export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN_ROLE'
  | 'CENTER_OUT_OF_SCOPE'
  | 'INVALID_PHONE'
  | 'VALIDATION_FAILED'
  | 'REASON_REQUIRED'
  | 'PARAM_INVALID'
  | 'CUSTOMER_NOT_FOUND'
  | 'DEVICE_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'TICKET_NOT_FOUND'
  | 'CUSTOMER_EXISTS'
  | 'SERIAL_OWNED_BY_OTHER'
  | 'DEVICE_HAS_OPEN_TICKET'
  | 'ALREADY_DECIDED';

// Bang ma loi o muc 6 cua api.txt: moi ma gan san mot ma HTTP.
const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN_ROLE: 403,
  CENTER_OUT_OF_SCOPE: 403,
  INVALID_PHONE: 400,
  VALIDATION_FAILED: 400,
  REASON_REQUIRED: 400,
  PARAM_INVALID: 400,
  CUSTOMER_NOT_FOUND: 404,
  DEVICE_NOT_FOUND: 404,
  CATEGORY_NOT_FOUND: 404,
  TICKET_NOT_FOUND: 404,
  CUSTOMER_EXISTS: 409,
  SERIAL_OWNED_BY_OTHER: 409,
  DEVICE_HAS_OPEN_TICKET: 409,
  ALREADY_DECIDED: 409,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, fields?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = HTTP_STATUS[code];
    this.fields = fields;
  }
}
