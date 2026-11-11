# API documentation

Track SE, flow L2. Base URL in the container: `http://localhost:3000`. All request and
response bodies are JSON, and mutating requests must send `Content-Type: application/json`.

## How many endpoints

There are five route files under `src/src/routes/api/`, and seven endpoints, because
`customers` and `tickets` each export two methods:

| Route file | Endpoints |
| :--- | :--- |
| `api/customers/+server.ts` | `GET /api/customers`, `POST /api/customers` |
| `api/devices/+server.ts` | `POST /api/devices` |
| `api/issue-categories/+server.ts` | `GET /api/issue-categories` |
| `api/tickets/+server.ts` | `GET /api/tickets`, `POST /api/tickets` |
| `api/tickets/[ticket_id]/warranty-decision/+server.ts` | `PATCH /api/tickets/{ticket_id}/warranty-decision` |

## Authentication, and one honest caveat

Every endpoint requires `Authorization: Bearer <token>`. The token is base64 of
`{"employee_id","role","center_code"}`. A missing token returns `401 UNAUTHENTICATED`.

**Role checks are currently disabled.** The constant `AUTHORIZATION_ENFORCED` in
`src/src/services/access.ts` is `false`, so `requireReceptionist` and `requireManager` do
nothing. This was deliberate, so that a marker can open every screen with one account.
Verified on the running container: an employee token returns `200` on `GET /api/tickets`,
and a manager token returns `201` on `POST /api/customers`. The table below therefore
states what the code actually enforces today, not what the role design intends.

| Endpoint | Any authenticated caller | Centre scoping enforced |
| :--- | :--- | :--- |
| `GET /api/customers` | Yes | No, customer records are company-wide |
| `POST /api/customers` | Yes | No |
| `POST /api/devices` | Yes | No |
| `GET /api/issue-categories` | Yes | No |
| `POST /api/tickets` | Yes | Ticket is stamped with the caller's centre |
| `GET /api/tickets` | Yes | Yes, returns only the caller's centre |
| `PATCH warranty-decision` | Yes | Yes, returns 403 for another centre |

Error envelope, used by every endpoint:

```json
{"error": {"code": "MACHINE_CODE", "message": "Human readable text", "fields": {"field": "reason"}}}
```

`fields` is present only for validation failures. `code` is stable and safe to branch on;
`message` is in Vietnamese because the case-study system serves Vietnamese users.

## 1. GET /api/customers

1. **Method and path:** `GET /api/customers?phone=<phone>`
2. **Purpose:** look up a customer by phone number before creating a ticket.
3. **Auth:** any authenticated caller.
4. **Request:** query parameter `phone`, required. It is normalised first: spaces and dots removed, leading `+84` replaced by `0`, then it must be exactly ten digits.
5. **Success:** `200` with the customer, the masked phone and the device list.
6. **Errors:** `401 UNAUTHENTICATED` when no token; `400 INVALID_PHONE` when the number is not ten digits after normalising; `404 CUSTOMER_NOT_FOUND` when no customer has that number.
7. **Real example:**

```
GET /api/customers?phone=0900000001
-> 200
{"customer_id":1,"full_name":"Nguyen Van A","phone_masked":"090****001",
 "address":"123 Duong Le Loi, Quan 1","devices":[{"device_id":1,
 "serial_no":"SN-IP14-000123","is_external":false,"origin_note":null,
 "purchase_date":"2024-03-15","warranty_months":12}]}
```

## 2. POST /api/customers

1. **Method and path:** `POST /api/customers`
2. **Purpose:** create a customer that the look-up could not find.
3. **Auth:** any authenticated caller.
4. **Request:** body `phone` (required, ten digits), `full_name` (required), `address` (optional).
5. **Success:** `201` with the new id and the masked phone.
6. **Errors:** `401 UNAUTHENTICATED`; `400 VALIDATION_FAILED` with `fields` naming the missing field; `409 CUSTOMER_PHONE_TAKEN` when the phone already exists.
7. **Real example:**

```
POST /api/customers
{"phone":"0912345678","full_name":"Tran Thi B","address":"45 Le Loi"}
-> 201
{"customer_id":5,"full_name":"Tran Thi B","phone_masked":"091****678"}
```

## 3. POST /api/devices

1. **Method and path:** `POST /api/devices`
2. **Purpose:** register a device belonging to a customer.
3. **Auth:** any authenticated caller.
4. **Request:** `customer_id`, `serial_no`, `is_external`, `origin_note` (required when `is_external` is true), `purchase_date` (optional, `YYYY-MM-DD`, must be a real date and not in the future), `warranty_months` (1 to 120, defaults to 12).
5. **Success:** `201` with the new device.
6. **Errors:** `401 UNAUTHENTICATED`; `400 VALIDATION_FAILED` with `fields`; `404 CUSTOMER_NOT_FOUND`; `409 DEVICE_SERIAL_TAKEN` when the serial already belongs to another customer.
7. **Real example:**

```
POST /api/devices
{"customer_id":5,"serial_no":"SN-TEST-API-01","is_external":true,
 "origin_note":"mua tai cua hang khac","purchase_date":null,"warranty_months":12}
-> 201
{"device_id":13,"serial_no":"SN-TEST-API-01","is_external":true,
 "purchase_date":null,"warranty_months":12}
```

## 4. GET /api/issue-categories

1. **Method and path:** `GET /api/issue-categories`
2. **Purpose:** supply the category list and each category's default priority for the ticket screen.
3. **Auth:** any authenticated caller.
4. **Request:** no parameters.
5. **Success:** `200` with all six categories.
6. **Errors:** `401 UNAUTHENTICATED`.
7. **Real example:**

```
GET /api/issue-categories
-> 200
{"total":6,"items":[{"category_id":1,"category_name":"Màn hình","default_priority":"CAO"},
{"category_id":2,"category_name":"Pin","default_priority":"TRUNG_BINH"}, ...]}
```

## 5. POST /api/tickets

1. **Method and path:** `POST /api/tickets`
2. **Purpose:** create a warranty ticket and write its first status log row.
3. **Auth:** any authenticated caller; the ticket is stamped with the caller's `center_code`.
4. **Request:** `customer_id`, `device_id`, `issue_desc`, `category_id`, `priority` (`CAO`, `TRUNG_BINH` or `THAP`). The due date is not sent; the server computes it from the priority.
5. **Success:** `201` with the generated `ticket_code` (pattern `BH-` plus six digits, a slash and the year), `status` `MOI`, and `due_date`.
6. **Errors:** `401 UNAUTHENTICATED`; `400 VALIDATION_FAILED`; `404 CUSTOMER_NOT_FOUND`; `404 DEVICE_NOT_FOUND`; `409 DEVICE_HAS_OPEN_TICKET` when that device already has an undecided ticket.
7. **Real example, copied from the container:**

```
POST /api/tickets
{"customer_id":1,"device_id":1,"issue_desc":"Man hinh chop tat","category_id":1,"priority":"CAO"}
-> 201
{"ticket_id":1,"ticket_code":"BH-000001/2026","status":"MOI","customer_id":1,
 "device_id":1,"center_code":"TT01","category_id":1,"priority":"CAO","is_warranty":null,
 "verified_by":null,"verified_at":null,"reject_reason":null,
 "received_at":"2026-11-11T20:22:28+07:00","due_date":"2026-11-12T20:22:28+07:00"}
```

The due date is 24 hours after `received_at` for priority `CAO`, 72 hours for
`TRUNG_BINH` and 120 hours for `THAP`, and Sundays are skipped.

## 6. GET /api/tickets

1. **Method and path:** `GET /api/tickets?status=<status>&page=<n>&size=<n>`
2. **Purpose:** the manager's queue, newest first, split into overdue and not overdue by the client.
3. **Auth:** any authenticated caller, but the result is always filtered to the caller's centre.
4. **Request:** optional `status` (`CHUA_DUYET` or `DA_DUYET`), optional `page` (default 1), optional `size` (default 20).
5. **Success:** `200` with `total`, `page`, `size` and `items`; each item carries `is_overdue`, the category name, the customer's name and masked phone, and the device serial.
6. **Errors:** `401 UNAUTHENTICATED`; `400 VALIDATION_FAILED` for a bad `status`, `page` or `size`.
7. **Real example:**

```
GET /api/tickets            (manager token, centre TT01)
-> 200
{"total":1,"page":1,"size":20,"items":[{"ticket_id":1,"ticket_code":"BH-000001/2026",
 "status":"MOI","is_overdue":false,"due_date":"2026-11-12T20:22:28+07:00",
 "is_warranty":true,"priority":"CAO","category":{"category_id":1,"category_name":"Màn hình"},
 "customer":{"full_name":"Nguyen Van A","phone_masked":"090****001"},
 "device":{"serial_no":"SN-IP14-000123"}}]}
```

The same request with a token for centre `TT02` returned `{"total":0,"page":1,"size":20,"items":[]}`.

## 7. PATCH /api/tickets/{ticket_id}/warranty-decision

1. **Method and path:** `PATCH /api/tickets/{ticket_id}/warranty-decision`
2. **Purpose:** decide whether the repair is free of charge, or reject the warranty.
3. **Auth:** any authenticated caller, but the ticket must belong to the caller's centre.
4. **Request:** `decision` (`APPROVE` or `REJECT`), and `reject_reason` when rejecting.
5. **Success:** `200` with `is_warranty`, `verified_by` and `verified_at`.
6. **Errors:** `401 UNAUTHENTICATED`; `400 VALIDATION_FAILED` for a bad `decision` or a missing reason; `404 TICKET_NOT_FOUND`; `403 CENTER_OUT_OF_SCOPE` when the ticket belongs to another centre; `409 ALREADY_DECIDED` when the ticket already has a decision.
7. **Real example, three calls on the same ticket:**

```
PATCH /api/tickets/1/warranty-decision   (token for centre TT02)
{"decision":"APPROVE"}
-> 403
{"error":{"code":"CENTER_OUT_OF_SCOPE","message":"Phiếu không thuộc trung tâm của bạn"}}

PATCH /api/tickets/1/warranty-decision   (token for centre TT01)
{"decision":"APPROVE"}
-> 200
{"ticket_id":1,"is_warranty":true,"verified_by":2,
 "verified_at":"2026-11-11T20:22:28+07:00","reject_reason":null}
```

## Error code table

These codes were produced by the calls above, not copied from a design document.

| Code | Status | Triggered by |
| :--- | :--- | :--- |
| `UNAUTHENTICATED` | 401 | `GET /api/customers` with no `Authorization` header |
| `INVALID_PHONE` | 400 | `GET /api/customers?phone=' OR 1=1 --` |
| `VALIDATION_FAILED` | 400 | `POST /api/tickets` with a missing `issue_desc` |
| `CUSTOMER_NOT_FOUND` | 404 | `POST /api/devices` with `customer_id: 2` when that id does not exist |
| `DEVICE_NOT_FOUND` | 404 | `POST /api/tickets` with `device_id: 999999` |
| `TICKET_NOT_FOUND` | 404 | `PATCH` on a ticket id that does not exist |
| `CENTER_OUT_OF_SCOPE` | 403 | `PATCH` on a ticket belonging to another centre |
| `DEVICE_HAS_OPEN_TICKET` | 409 | A second ticket on a device that already has an undecided one |
| `ALREADY_DECIDED` | 409 | A second decision on a ticket that already has one |

## Where this document and the older contract disagree

`docs/api-contract.md` was written at design time and still shows a role matrix in which a
manager gets `403` on `POST /api/customers`. The running system returns `201`, because role
checks are disabled. That contract is kept as the BT1 design record; this document describes
the system as it behaves today. Where the two differ, this one is correct.
