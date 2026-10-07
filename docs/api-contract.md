# Hợp đồng API (API contract) - Track SE - Luồng L2

- Dự án: Hệ thống Smart CRM - Mekong Mobile. Luồng: **L2 - Tiếp nhận và phân loại yêu cầu bảo hành**
- Tài liệu tham chiếu: `SRS.md` (bản đang nộp) và case study Mục 8 (từ điển dữ liệu), Mục 9 (quy tắc nghiệp vụ)
- Nguyên tắc: **mọi endpoint phải truy vết được về ít nhất một User Story** trong bảng truy vết ở mục 6 của SRS. Endpoint nào không nối được thì bỏ.
- Quy ước đặt tên trường: `snake_case`, khớp đúng tên cột trong mô hình dữ liệu Mục 8, trừ hai bổ sung của SRS đã ghi ở mục 1.4 của SRS là `is_verified` và bảng nối `ticket_issue`.

---

## 1. Danh sách endpoint

| # | Phương thức | Đường dẫn | Mục đích | User Story | MoSCoW |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | GET | `/api/customers?phone={phone}` | Tra cứu khách hàng theo số điện thoại | US1 | MUST |
| 2 | POST | `/api/customers` | Tạo khách hàng mới khi chưa tồn tại | US2 | MUST |
| 3 | GET | `/api/customers/{customer_id}/devices` | Lấy danh sách thiết bị khách đã mua | US1, US3 | MUST |
| 4 | POST | `/api/devices` | Đăng ký thiết bị cho khách (kể cả thiết bị không có hồ sơ mua) | US3 | MUST |
| 5 | GET | `/api/issue-categories` | Lấy danh mục nhóm sự cố dùng chung | US5 | MUST |
| 6 | POST | `/api/issue-categories` | Thêm nhóm sự cố mới vào danh mục | US5 | MUST |
| 7 | POST | `/api/tickets` | Lập phiếu bảo hành: sinh mã, tính hạn cam kết, xác định hình thức bảo hành | US1, US3, US4, US5, US6 | MUST |
| 8 | GET | `/api/tickets` | Bảng theo dõi hạn cam kết và danh sách phiếu trong ngày | US7, US8 | MUST |
| 9 | PATCH | `/api/tickets/{ticket_id}/warranty-decision` | Quản lý trung tâm duyệt hoặc từ chối bảo hành miễn phí | US9, US10 | SHOULD |
| 10 | GET | `/api/devices/{device_id}/ticket-history` | Lịch sử phiếu của thiết bị theo nhóm sự cố, phục vụ cảnh báo lỗi lặp lại | US11 | COULD |

Không có endpoint `DELETE` nào: QT-13 cấm xóa vật lý, và L2 không có thao tác xóa hay đánh dấu ẩn (BR-16).

---

## 2. Quy ước chung

- **Định dạng trao đổi:** JSON, mã hoá UTF-8. Header bắt buộc khi có body: `Content-Type: application/json`.
- **Tên trường:** `snake_case`, khớp tên cột ở Mục 8 của case study.
- **Thời gian:** ISO 8601 kèm múi giờ Việt Nam, ví dụ `2026-09-08T14:30:00+07:00`. Mọi mốc thời gian trong L2 hiểu theo giờ Việt Nam (BR-18).
- **Tiền tệ:** số nguyên VND, không phần thập phân, không dấu phân cách.
- **Phân trang:** tham số `page` (bắt đầu từ 1) và `size` (mặc định 20, tối đa 100). Response kèm `total`.
- **Mọi lỗi trả về cùng một cấu trúc:**

```json
{ "error": { "code": "MA_LOI", "message": "Thông báo cho người dùng", "fields": { "ten_truong": "chi tiết" } } }
```

- **Chống tạo trùng khi thử lại (NFR4):** `POST /api/tickets` bắt buộc có header `Idempotency-Key` (UUID do client sinh). Gửi lại cùng khoá trả về đúng phiếu đã tạo, **không** tạo phiếu thứ hai và **không** sinh mã phiếu thứ hai.
- **Che số điện thoại (NFR2, QT-15):** mọi response trả `phone_masked` dạng `090****567`. Trường `phone` đầy đủ **chỉ** xuất hiện khi người gọi là **Quản lý trung tâm**; các vai trò khác không nhận trường này.

---

## 3. Xác thực và phân quyền

Cơ chế: `Authorization: Bearer <JWT>`. Token mang `employee_id`, `role` và `center_id`.

| Endpoint | Nhân viên tiếp nhận | Quản lý trung tâm | Kỹ thuật viên |
| :--- | :--- | :--- | :--- |
| 1 GET /api/customers | 200 OK | 200 OK | 403 Forbidden |
| 2 POST /api/customers | 201 Created | 403 Forbidden | 403 Forbidden |
| 3 GET /api/customers/{id}/devices | 200 OK | 200 OK | 403 Forbidden |
| 4 POST /api/devices | 201 Created | 403 Forbidden | 403 Forbidden |
| 5 GET /api/issue-categories | 200 OK | 200 OK | 200 OK |
| 6 POST /api/issue-categories | 201 Created | 201 Created | 403 Forbidden |
| 7 POST /api/tickets | 201 Created | 403 Forbidden | 403 Forbidden |
| 8 GET /api/tickets | 200 OK (chỉ phiếu của mình) | 200 OK (cả trung tâm, lọc theo nhân viên) | 200 OK (chỉ đọc, cả trung tâm) |
| 9 PATCH warranty-decision | 403 Forbidden | 200 OK | 403 Forbidden |
| 10 GET ticket-history | 200 OK | 200 OK | 200 OK |

Phạm vi dữ liệu theo BR-17 và QT-14: yêu cầu `center_id` khác trung tâm trong token trả **403**. Hồ sơ khách hàng và thiết bị dùng chung toàn công ty nên endpoint 1, 2, 3, 4 không giới hạn theo trung tâm.

---

## 4. Chi tiết từng endpoint

### 4.1. GET /api/customers - tra cứu khách theo SĐT (US1)

**Query:** `phone` (bắt buộc). Server chuẩn hoá trước khi kiểm tra (BR-02, QT-02): nhận `0901234567`, `+84901234567`, `84901234567`, `090 123 4567`, `090.123.4567`.

**RESPONSE 200 OK** (người gọi là Nhân viên tiếp nhận)

```json
{
  "customer_id": 1024,
  "full_name": "Nguyễn Văn A",
  "phone_masked": "090****567",
  "address": "12 Lê Lợi, Quận 10, TP.HCM",
  "segment": "THUONG_XUYEN",
  "created_at": "2026-09-08T14:30:00+07:00"
}
```

**RESPONSE 200 OK** (người gọi là Quản lý trung tâm - có thêm `phone` đầy đủ, NFR2)

```json
{ "customer_id": 1024, "full_name": "Nguyễn Văn A", "phone": "0901234567", "phone_masked": "090****567" }
```

**RESPONSE 400 Bad Request** - sai định dạng sau chuẩn hoá (AC1.3)

```json
{ "error": { "code": "INVALID_PHONE", "message": "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)", "fields": { "phone": "090123" } } }
```

**RESPONSE 404 Not Found** - chưa có hồ sơ (AC1.2)

```json
{ "error": { "code": "CUSTOMER_NOT_FOUND", "message": "Không tìm thấy thông tin khách hàng" } }
```

**RESPONSE 401 Unauthorized** - thiếu hoặc hết hạn token.

### 4.2. POST /api/customers - tạo khách hàng mới (US2)

**REQUEST BODY**

```json
{ "phone": "0988777666", "full_name": "Nguyễn Văn A", "address": "12 Lê Lợi, Quận 10, TP.HCM" }
```

**RESPONSE 201 Created**

```json
{ "customer_id": 1025, "full_name": "Nguyễn Văn A", "phone_masked": "098****666", "segment": null, "created_at": "2026-09-08T14:31:00+07:00" }
```

`segment` luôn là `null` với khách tạo ở L2: L2 không tạo và không sửa phân khúc.

**RESPONSE 400 Bad Request** - thiếu họ tên (AC2.3)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Vui lòng nhập Họ tên khách hàng", "fields": { "full_name": "Trường bắt buộc" } } }
```

**RESPONSE 409 Conflict** - trùng SĐT khi lưu đồng thời (AC2.2, BR-01, QT-01)

```json
{ "error": { "code": "CUSTOMER_EXISTS", "message": "Số điện thoại đã tồn tại trên hệ thống", "fields": { "existing_customer_id": 1025 } } }
```

Client dùng `existing_customer_id` để nạp hồ sơ đã có thay vì tạo mới.

### 4.3. GET /api/customers/{customer_id}/devices - thiết bị đã mua (US1, US3)

**RESPONSE 200 OK** - phục vụ AC1.1 (hiển thị danh sách thiết bị) và AC3.1 (chọn thiết bị thì tự điền serial, ngày mua, số tháng bảo hành)

```json
{
  "total": 2,
  "items": [
    { "device_id": 3311, "serial_no": "SN-PHONE-123", "product_name": "Samsung Galaxy A15", "purchase_date": "2025-11-20", "warranty_months": 12 },
    { "device_id": 3312, "serial_no": "SN-PHONE-124", "product_name": "Oppo Reno 11", "purchase_date": null, "warranty_months": 12 }
  ]
}
```

**RESPONSE 404 Not Found** - `customer_id` không tồn tại.
**RESPONSE 403 Forbidden** - vai trò Kỹ thuật viên gọi endpoint này.

### 4.4. POST /api/devices - đăng ký thiết bị (US3)

**REQUEST BODY**

```json
{ "customer_id": 1024, "serial_no": "SN-EXT-999", "purchase_date": null, "purchase_place": "Mua tại cửa hàng khác", "warranty_months": 12 }
```

`purchase_date` và `purchase_place` là đường nhập theo hoá đơn (BR-04): nếu khách xuất trình hoá đơn thì client gửi ngày mua và nơi mua, hệ thống xác định điều kiện bảo hành theo ngày đó thay vì gắn cờ chờ xác minh (AC3.6).

**RESPONSE 201 Created**

```json
{ "device_id": 3390, "customer_id": 1024, "serial_no": "SN-EXT-999", "purchase_date": null, "warranty_months": 12 }
```

**RESPONSE 400 Bad Request** - thiếu serial (AC3.5)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Số serial/IMEI là trường bắt buộc", "fields": { "serial_no": "Trường bắt buộc" } } }
```

**RESPONSE 409 Conflict** - serial đang thuộc khách khác (AC3.4, BR-05, QT-03)

```json
{ "error": { "code": "SERIAL_OWNED_BY_OTHER", "message": "Serial/IMEI đang thuộc khách hàng khác. Vui lòng chuyển Quản lý trung tâm xử lý." } }
```

### 4.5. GET /api/issue-categories - danh mục nhóm sự cố (US5)

**RESPONSE 200 OK**

```json
{
  "total": 6,
  "items": [
    { "category_id": 1, "category_name": "Màn hình", "default_priority": "CAO", "is_active": true },
    { "category_id": 2, "category_name": "Pin", "default_priority": "TRUNG_BINH", "is_active": true },
    { "category_id": 6, "category_name": "Khác", "default_priority": "THAP", "is_active": true }
  ]
}
```

Client dùng `default_priority` để điền sẵn mức ưu tiên khi nhân viên chọn nhóm (BR-15, AC5.1).

**RESPONSE 401 Unauthorized** - thiếu token.
**RESPONSE 403 Forbidden** - vai trò không thuộc L2.

### 4.6. POST /api/issue-categories - thêm nhóm sự cố mới (US5)

**REQUEST BODY**

```json
{ "category_name": "Vỡ kính", "default_priority": "TRUNG_BINH" }
```

**RESPONSE 201 Created**

```json
{ "category_id": 7, "category_name": "Vỡ kính", "default_priority": "TRUNG_BINH", "is_active": true }
```

Tên nhóm được cắt khoảng trắng đầu cuối trước khi lưu (BR-15).

**RESPONSE 400 Bad Request** - tên rỗng sau khi cắt khoảng trắng.
**RESPONSE 409 Conflict** - trùng tên không phân biệt hoa thường (BR-15)

```json
{ "error": { "code": "CATEGORY_EXISTS", "message": "Nhóm sự cố đã tồn tại trong danh mục", "fields": { "existing_category_id": 2 } } }
```

### 4.7. POST /api/tickets - lập phiếu bảo hành (US1, US3, US4, US5, US6)

**HEADERS:** `Idempotency-Key: 7f3c…` (bắt buộc, NFR4)

**REQUEST BODY**

```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "center_id": 2,
  "issue_desc": "Màn hình chớp tắt khi cắm sạc",
  "category_ids": [1],
  "priority": "CAO",
  "accessories": ["SAC", "HOP"],
  "cosmetic_condition": "Trầy nhẹ ở góc phải"
}
```

**RESPONSE 201 Created**

```json
{
  "ticket_id": 88231,
  "ticket_code": "BH-000231/2026",
  "status": "MOI",
  "customer_id": 1024,
  "device_id": 3311,
  "center_id": 2,
  "category_ids": [1],
  "priority": "CAO",
  "received_at": "2026-09-08T14:30:00+07:00",
  "due_date": "2026-09-09T14:30:00+07:00",
  "is_verified": true,
  "is_warranty": true,
  "sla_percent_remaining": 100,
  "sla_color": "XANH",
  "repeat_fault_warning": null
}
```

Diễn giải các trường do hệ thống sinh:

- `ticket_code`: 6 chữ số tăng dần, bắt đầu lại từ `000001` mỗi năm, không tái sử dụng (BR-08).
- `received_at`: thời điểm hệ thống chấp nhận lưu phiếu lần đầu. `due_date` tính từ mốc này theo mức ưu tiên: CAO 24 giờ, TRUNG_BINH 72 giờ, THAP 120 giờ, chỉ tính ngày làm việc Thứ Hai-Thứ Bảy (BR-09, BR-10, QT-04). Ví dụ trên là mức CAO, không vướng Chủ Nhật.
- `is_verified`: `false` khi thiết bị không có ngày mua - phiếu vào danh sách chờ Quản lý trung tâm quyết định (BR-13, QT-05).
- `is_warranty`: `true` miễn phí; `false` tính phí; **`null` khi phiếu đang chờ xác minh** (BR-12, BR-13).
- `sla_color`: `XANH` còn từ 25% trở lên; `VANG` còn dưới 25% và lớn hơn 0; `DO` còn 0% trở xuống (BR-11).
- `repeat_fault_warning`: khác `null` khi phiếu này là **lần thứ 3 trở đi** cùng nhóm sự cố trên thiết bị (BR-15); phiếu vẫn được tạo bình thường.

```json
"repeat_fault_warning": {
  "category_id": 1,
  "previous_count": 2,
  "message": "Thiết bị đã bảo hành lỗi Màn hình 2 lần. Đây là lần thứ 3 - cần báo Quản lý trung tâm xem xét."
}
```

**RESPONSE 400 Bad Request** - thiếu mô tả lỗi (AC4.3) hoặc thiếu nhóm sự cố / mức ưu tiên (AC4.4)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Mô tả lỗi do khách kể là trường bắt buộc", "fields": { "issue_desc": "Trường bắt buộc" } } }
```

**RESPONSE 404 Not Found** - `customer_id`, `device_id` hoặc `center_id` không tồn tại.
**RESPONSE 409 Conflict** - thiết bị đang có phiếu chưa đạt trạng thái Đã đóng (BR-06)

```json
{ "error": { "code": "DEVICE_HAS_OPEN_TICKET", "message": "Thiết bị đang có phiếu chưa đóng", "fields": { "open_ticket_code": "BH-000198/2026" } } }
```

**RESPONSE 403 Forbidden** - người gọi không phải Nhân viên tiếp nhận, hoặc `center_id` khác trung tâm trong token (BR-17, QT-14).

> **Khác biệt so với ví dụ mẫu của tài liệu:** ví dụ mẫu trả **422** khi thiết bị hết bảo hành. Với SRS này, hết bảo hành **không phải lỗi**: phiếu vẫn được lập và `is_warranty = false` (tính phí, AC9.2), còn thiếu ngày mua thì `is_verified = false` và `is_warranty = null` (AC9.3). Vì vậy hợp đồng này **không** dùng mã 422.

### 4.8. GET /api/tickets - bảng theo dõi hạn cam kết và danh sách trong ngày (US7, US8)

**Query:**

| Tham số | Ý nghĩa | Ghi chú |
| :--- | :--- | :--- |
| `center_id` | Trung tâm cần xem | Bắt buộc; khác trung tâm trong token thì 403 (BR-17) |
| `date` | Chỉ lấy phiếu tạo trong ngày | Định dạng `YYYY-MM-DD`, hiểu theo giờ Việt Nam (BR-18) |
| `status` | Lọc theo trạng thái | `MOI`, `DA_PHAN_CONG`, … |
| `created_by` | Lọc theo nhân viên tiếp nhận | Chỉ Quản lý trung tâm dùng được (BR-17) |
| `verified` | `false` để lấy danh sách chờ xác minh | Dùng cho màn hình của Quản lý trung tâm |
| `exclude_completed` | `true` để loại phiếu đã Hoàn tất | Bảng theo dõi mặc định `true` (BR-11) |
| `sort` | `sla` để xếp Đỏ, rồi Vàng, rồi Xanh | Mặc định `sla` trên bảng theo dõi (BR-19) |
| `page`, `size` | Phân trang | `page` từ 1, `size` mặc định 20, tối đa 100 |

**RESPONSE 200 OK**

```json
{
  "total": 1,
  "page": 1,
  "size": 20,
  "items": [
    {
      "ticket_id": 88231,
      "ticket_code": "BH-000231/2026",
      "status": "MOI",
      "customer_name": "Nguyễn Văn A",
      "phone_masked": "090****567",
      "device_serial": "SN-PHONE-123",
      "priority": "CAO",
      "received_at": "2026-09-08T14:30:00+07:00",
      "due_date": "2026-09-09T14:30:00+07:00",
      "sla_percent_remaining": 10,
      "sla_color": "VANG"
    }
  ]
}
```

Danh sách rỗng trả `total: 0` và `items: []`; giao diện hiển thị "Trung tâm hiện không có phiếu nào đang xử lý" (AC7.2) hoặc "Chưa có phiếu bảo hành nào được ghi nhận trong ngày hôm nay" (AC8.2).

**RESPONSE 400 Bad Request** - `date` sai định dạng hoặc `status` không thuộc danh sách hợp lệ.
**RESPONSE 403 Forbidden** - `center_id` khác trung tâm trong token (BR-17).

### 4.9. PATCH /api/tickets/{ticket_id}/warranty-decision - quyết định của Quản lý (US9, US10)

**REQUEST BODY** - duyệt

```json
{ "decision": "APPROVE" }
```

**REQUEST BODY** - từ chối (bắt buộc có lý do, BR-14)

```json
{ "decision": "REJECT", "reason": "Thiết bị đã quá hạn bảo hành theo hoá đơn khách cung cấp" }
```

**RESPONSE 200 OK**

```json
{
  "ticket_id": 88231,
  "is_verified": true,
  "is_warranty": false,
  "decided_by": 57,
  "decided_at": "2026-09-08T16:05:00+07:00",
  "decision_reason": "Thiết bị đã quá hạn bảo hành theo hoá đơn khách cung cấp"
}
```

Quyết định được lưu **trên phiếu** (`decided_by`, `decided_at`, `decision_reason`, `is_warranty`), **không** ghi thêm dòng vào `ticket_status_log` - bảng đó chỉ ghi chuyển trạng thái (BR-14).

**RESPONSE 400 Bad Request** - từ chối mà thiếu lý do (AC10.3)

```json
{ "error": { "code": "REASON_REQUIRED", "message": "Vui lòng nhập lý do từ chối" } }
```

**RESPONSE 403 Forbidden** - người gọi không phải Quản lý trung tâm (BR-14, QT-05).
**RESPONSE 404 Not Found** - `ticket_id` không tồn tại.
**RESPONSE 409 Conflict** - phiếu không ở trạng thái chờ xác minh.

### 4.10. GET /api/devices/{device_id}/ticket-history - lịch sử lỗi lặp lại (US11, mức COULD)

**Query:** `category_id` (bắt buộc) - chỉ đếm các phiếu trước đó cùng nhóm sự cố.

**RESPONSE 200 OK**

```json
{ "device_id": 3311, "category_id": 1, "previous_count": 2, "tickets": ["BH-000042/2026", "BH-000117/2026"] }
```

`previous_count` ≥ 2 nghĩa là phiếu đang lập sẽ là lần thứ 3 trở đi thì hiển thị cảnh báo (BR-15).

**RESPONSE 404 Not Found** - `device_id` không tồn tại.
**RESPONSE 503 Service Unavailable** - không tải được lịch sử; giao diện bỏ qua cảnh báo và cho tiếp tục lập phiếu (AC11.3).

---

## 5. Bảng validation

| Trường | Endpoint | Bắt buộc | Kiểu / ràng buộc | Thông báo lỗi khi vi phạm |
| :--- | :--- | :--- | :--- | :--- |
| `phone` | 1, 2 | Có | Chuẩn hoá về 10 chữ số bắt đầu bằng `0`; nhận `+84…`, `84…`, có dấu cách hoặc dấu chấm (QT-02) | Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx) |
| `full_name` | 2 | Có | Chuỗi, 1-120 ký tự | Vui lòng nhập Họ tên khách hàng |
| `address` | 2 | Không | Chuỗi, tối đa 255 ký tự | không có |
| `customer_id` | 3, 4, 7 | Có | Số nguyên dương, phải tồn tại | Không tìm thấy khách hàng |
| `serial_no` | 4 | Có | Chuỗi, 1-50 ký tự, duy nhất toàn hệ thống; nếu đã thuộc khách khác thì từ chối (QT-03) | Số serial/IMEI là trường bắt buộc |
| `purchase_date` | 4 | Không | Ngày `YYYY-MM-DD`; để trống nghĩa là thiết bị không có hồ sơ mua (BR-04) | Ngày mua không hợp lệ |
| `purchase_place` | 4 | Không | Chuỗi, tối đa 255 ký tự; chỉ nhập khi có hoá đơn | không có |
| `warranty_months` | 4 | Không | Số nguyên 1-120; mặc định 12 theo Mục 8 | Số tháng bảo hành không hợp lệ |
| `device_id` | 7, 10 | Có | Số nguyên dương, phải thuộc `customer_id` (QT-03) | Thiết bị không thuộc về khách hàng này |
| `center_id` | 7, 8 | Có | Số nguyên dương, phải tồn tại; phải trùng trung tâm trong token (QT-14) | Trung tâm không hợp lệ |
| `issue_desc` | 7 | Có | Chuỗi, 1-2000 ký tự | Mô tả lỗi do khách kể là trường bắt buộc |
| `category_ids` | 7 | Có | Mảng số nguyên, **1 đến 5 phần tử**, không trùng nhau; mỗi phần tử phải có trong danh mục (BR-15) | Phiếu phải có từ 1 đến 5 nhóm sự cố |
| `priority` | 7 | Có | Một trong `CAO`, `TRUNG_BINH`, `THAP`; client điền sẵn theo `default_priority` của nhóm (BR-15) | Mức ưu tiên không hợp lệ |
| `accessories` | 7 | Không | Mảng, mỗi phần tử thuộc `SAC` / `TAI_NGHE` / `HOP` / `KHAC` (Mục 5.1) | Phụ kiện không hợp lệ |
| `cosmetic_condition` | 7 | Không | Chuỗi, tối đa 255 ký tự | không có |
| `Idempotency-Key` | 7 | Có | UUID; gửi lại cùng khoá không tạo phiếu thứ hai (NFR4) | Thiếu khoá chống trùng khi lưu phiếu |
| `status` | 8 | Không | Một trong các trạng thái của vòng đời (BR-07) | Trạng thái không hợp lệ |
| `date` | 8 | Không | `YYYY-MM-DD` theo giờ Việt Nam (BR-18) | Ngày không hợp lệ |
| `decision` | 9 | Có | `APPROVE` hoặc `REJECT` | Quyết định không hợp lệ |
| `reason` | 9 | Có khi `REJECT` | Chuỗi, 1-255 ký tự | Vui lòng nhập lý do từ chối |

---

## 6. Danh mục mã lỗi

| Mã lỗi | HTTP | Khi nào | Quy tắc |
| :--- | :--- | :--- | :--- |
| `VALIDATION_FAILED` | 400 | Dữ liệu vào sai kiểu, thiếu trường bắt buộc | không có |
| `INVALID_PHONE` | 400 | SĐT không thành 10 chữ số sau chuẩn hoá | QT-02 |
| `REASON_REQUIRED` | 400 | Từ chối bảo hành mà thiếu lý do | BR-14 |
| `UNAUTHENTICATED` | 401 | Thiếu hoặc hết hạn token | không có |
| `FORBIDDEN_ROLE` | 403 | Vai trò không được gọi endpoint | BR-14, BR-17 |
| `CENTER_OUT_OF_SCOPE` | 403 | `center_id` khác trung tâm trong token | BR-17, QT-14 |
| `CUSTOMER_NOT_FOUND` | 404 | Tra cứu không thấy hồ sơ khách | AC1.2 |
| `TICKET_NOT_FOUND` | 404 | `ticket_id` không tồn tại | không có |
| `CUSTOMER_EXISTS` | 409 | Trùng SĐT khi tạo khách | BR-01, QT-01 |
| `SERIAL_OWNED_BY_OTHER` | 409 | Serial đã thuộc khách khác | BR-05, QT-03 |
| `CATEGORY_EXISTS` | 409 | Trùng tên nhóm không phân biệt hoa thường | BR-15 |
| `DEVICE_HAS_OPEN_TICKET` | 409 | Thiết bị đang có phiếu chưa đạt trạng thái Đã đóng | BR-06 |
| `NOT_AWAITING_VERIFICATION` | 409 | Phiếu không ở trạng thái chờ xác minh | BR-13 |
| `HISTORY_UNAVAILABLE` | 503 | Không tải được lịch sử thiết bị | AC11.3 |

---

## 7. Truy vết quy tắc nghiệp vụ ↔ hợp đồng

| Quy tắc | Thể hiện ở đâu trong hợp đồng |
| :--- | :--- |
| QT-01 SĐT duy nhất | 409 `CUSTOMER_EXISTS` (endpoint 2) |
| QT-02 Chuẩn hoá SĐT | Validation `phone`; 400 `INVALID_PHONE` (endpoint 1, 2) |
| QT-03 Thiết bị duy nhất, một chủ | Validation `serial_no`, `device_id`; 409 `SERIAL_OWNED_BY_OTHER` |
| QT-04 Hạn cam kết theo mức ưu tiên | `due_date` trong response 201 của endpoint 7 |
| QT-05 Điều kiện bảo hành và phê duyệt | `is_verified`, `is_warranty` (endpoint 7); endpoint 9 và 400 `REASON_REQUIRED` |
| QT-06 Vòng đời và nhật ký trạng thái | `status: "MOI"` khi tạo; hệ thống ghi dòng nhật ký đầu tiên; không có endpoint đổi trạng thái trong L2 |
| QT-13 Không xóa vật lý | Hợp đồng không có endpoint `DELETE` nào |
| QT-14 Phạm vi dữ liệu | 403 `CENTER_OUT_OF_SCOPE`; bảng phân quyền ở mục 3 |
| QT-15 Che SĐT | `phone_masked` ở mọi response; `phone` chỉ trả cho Quản lý trung tâm |