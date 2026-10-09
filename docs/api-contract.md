# Hợp đồng API (API contract) - Track SE - Luồng L2

- Dự án: Hệ thống Smart CRM - Mekong Mobile
- Phạm vi: Luồng L2 - Tiếp nhận và phân loại yêu cầu bảo hành
- Chuẩn tham chiếu: REST trên HTTP, JSON
- Tác giả: Nguyễn Thái Hoàng


---

## 1. Danh sách endpoint

| # | Method | Path | Use case | User story | Yêu cầu chức năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | GET | `/api/customers` | UC1 | US1 | FR1 |
| 2 | POST | `/api/customers` | UC2 | US2 | FR2 |
| 3 | POST | `/api/devices` | UC3 | US3 | FR3 |
| 4 | GET | `/api/issue-categories` | UC5 | US5 | FR6 |
| 5 | POST | `/api/tickets` | UC4 | US4 | FR4, FR5, FR6 |
| 6 | GET | `/api/tickets` | UC6 | US6 | FR7 |
| 7 | PATCH | `/api/tickets/{ticket_id}/warranty-decision` | UC6 | US6 | FR7 |

Bảy endpoint cho bảy yêu cầu chức năng. Không có endpoint tạo hoặc sửa nhóm sự cố, vì mục 1.3 của SRS đặt việc đó ra ngoài phạm vi: danh mục nhóm sự cố là dữ liệu cài sẵn.

---

## 2. Quy ước chung

- **Định dạng trao đổi:** JSON, mã hoá UTF-8. Header bắt buộc khi có body: `Content-Type: application/json`.
- **Tên trường:** `snake_case`, khớp đúng tên cột trong `erd.dbml`.
- **Thời gian:** ISO 8601 kèm múi giờ Việt Nam, ví dụ `2026-09-08T14:30:00+07:00`. Mọi mốc thời gian trong L2 hiểu theo giờ Việt Nam.
- **Phân trang:** tham số `page` bắt đầu từ 1 và `size` mặc định 20, tối đa 100. Response kèm `total`.
- **Mọi lỗi trả về cùng một cấu trúc:**

```json
{ "error": { "code": "MA_LOI", "message": "Thông báo cho người dùng", "fields": { "ten_truong": "chi tiết" } } }
```

- **Che số điện thoại (NFR2, QT-15):** mọi response trả `phone_masked` dạng `090****567`. Trường `phone` đầy đủ **chỉ** xuất hiện khi người gọi là **Quản lý trung tâm**; các vai trò khác không nhận trường này.
- **Chống tạo trùng khi thử lại (NFR4):** hợp đồng không dùng khoá chống trùng. Gửi lại cùng một yêu cầu lưu sẽ tìm thấy khách theo BR-01 và thiết bị theo BR-03, rồi gặp BR-06 nên nhận `409 DEVICE_HAS_OPEN_TICKET` kèm mã phiếu đã tạo. Kết quả là **không bao giờ có phiếu thứ hai**, và hợp đồng không cần thêm header hay cột nào.
- **Hai nhóm theo hạn (BR-20):** endpoint 6 trả danh sách đã sắp xếp sẵn, phiếu đã qua hạn lên trước rồi mới tới phiếu chưa qua hạn, mỗi nhóm xếp theo `due_date` tăng dần. Thứ tự này là một phần của hợp đồng, client không phải sắp lại.
- **Không dùng mã 422.** L2 không tự xác định điều kiện bảo hành: mọi phiếu đều được lập và đều chờ Quản lý trung tâm duyệt, nên hết hạn bảo hành không phải lỗi.

---

## 3. Xác thực và phân quyền

Cơ chế: `Authorization: Bearer <token>`. Token mang `employee_id`, `role` và `center_code`.

Đăng nhập là hạ tầng, không phải nghiệp vụ của L2, đúng như case study Mục 10 xếp ví dụ "viết API đăng nhập" vào nhóm phạm vi quá hẹp. Vì vậy token do hệ thống đăng nhập cấp, không có endpoint đăng nhập trong hợp đồng này, và không có bảng người dùng nào phục vụ việc cấp token.

Hai vai trò hoạt động trong L2, phân quyền theo endpoint:

| Endpoint | Nhân viên tiếp nhận | Quản lý trung tâm |
| :--- | :--- | :--- |
| 1 GET `/api/customers` | 200 OK | 200 OK |
| 2 POST `/api/customers` | 201 Created | 403 Forbidden |
| 3 POST `/api/devices` | 201 Created | 403 Forbidden |
| 4 GET `/api/issue-categories` | 200 OK | 200 OK |
| 5 POST `/api/tickets` | 201 Created | 403 Forbidden |
| 6 GET `/api/tickets` | 403 Forbidden | 200 OK |
| 7 PATCH warranty-decision | 403 Forbidden | 200 OK |

Phạm vi dữ liệu theo BR-17 và QT-14: hồ sơ khách hàng và thiết bị dùng chung toàn công ty nên endpoint 1 và 3 không giới hạn theo trung tâm. Riêng phiếu thì theo trung tâm: endpoint 6 chỉ trả phiếu có `center_code` trùng trung tâm trong token, và endpoint 7 trả **403** nếu phiếu không thuộc trung tâm của người gọi.

---

## 4. Chi tiết từng endpoint

### 4.1. GET /api/customers - tra cứu khách theo số điện thoại (UC1, US1, FR1)

**QUERY:** `phone` (bắt buộc). Nhận cả dạng chưa chuẩn hóa; hệ thống chuẩn hóa theo BR-02 trước khi tra.

**RESPONSE 200 OK** - phục vụ AC1.1

```json
{
  "customer_id": 1024,
  "full_name": "Nguyễn Văn A",
  "phone_masked": "090****567",
  "address": "12 Lê Lợi, Quận 10, TP.HCM",
  "devices": [
    { "device_id": 3311, "serial_no": "SN-PHONE-123", "is_external": false, "purchase_date": "2025-11-20", "warranty_months": 12 },
    { "device_id": 3312, "serial_no": "SN-PHONE-124", "is_external": true, "purchase_date": null, "warranty_months": 12 }
  ]
}
```

Danh sách thiết bị trả kèm trong cùng response để màn hình tra cứu hiển thị được ngay, không cần gọi thêm endpoint. Khi người gọi là Quản lý trung tâm, response có thêm trường `phone` đầy đủ theo NFR2.

**RESPONSE 400 Bad Request** - sai định dạng sau chuẩn hóa (AC1.3)

```json
{ "error": { "code": "INVALID_PHONE", "message": "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)", "fields": { "phone": "090123" } } }
```

**RESPONSE 404 Not Found** - chưa có hồ sơ (AC1.2)

```json
{ "error": { "code": "CUSTOMER_NOT_FOUND", "message": "Không tìm thấy thông tin khách hàng" } }
```

**RESPONSE 401 Unauthorized** - thiếu hoặc hết hạn token.

### 4.2. POST /api/customers - tạo khách hàng mới (UC2, US2, FR2)

**REQUEST BODY**

```json
{ "phone": "0988777666", "full_name": "Nguyễn Văn A", "address": "12 Lê Lợi, Quận 10, TP.HCM" }
```

**RESPONSE 201 Created** - phục vụ AC2.1

```json
{ "customer_id": 1025, "full_name": "Nguyễn Văn A", "phone_masked": "098****666" }
```

**RESPONSE 400 Bad Request** - thiếu họ tên (AC2.3)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Vui lòng nhập Họ tên khách hàng", "fields": { "full_name": "Trường bắt buộc" } } }
```

**RESPONSE 409 Conflict** - trùng số điện thoại khi lưu đồng thời (AC2.2, BR-01, QT-01)

```json
{ "error": { "code": "CUSTOMER_EXISTS", "message": "Số điện thoại đã tồn tại trên hệ thống", "fields": { "existing_customer_id": 1025 } } }
```

Client dùng `existing_customer_id` để nạp hồ sơ đã có thay vì tạo mới.

**RESPONSE 403 Forbidden** - vai trò Quản lý trung tâm gọi endpoint này.

### 4.3. POST /api/devices - đăng ký thiết bị (UC3, US3, FR3)

**REQUEST BODY** - thiết bị mua ngoài, khách có xuất trình hóa đơn

```json
{
  "customer_id": 1024,
  "serial_no": "SN-EXT-999",
  "is_external": true,
  "origin_note": "mua tại CellphoneS",
  "purchase_date": "2026-02-10",
  "warranty_months": 12
}
```

`purchase_date` chỉ gửi khi khách có hóa đơn, thiếu thì để `null` theo BR-04. Nơi mua ghi trong `origin_note` vì đó là văn bản tự do. `warranty_months` để trống thì hệ thống dùng 12.

**RESPONSE 201 Created** - phục vụ AC3.1 và AC3.2

```json
{ "device_id": 3313, "serial_no": "SN-EXT-999", "is_external": true, "purchase_date": "2026-02-10", "warranty_months": 12 }
```

**RESPONSE 400 Bad Request** - thiếu serial hoặc thiếu ghi chú nguồn gốc (AC3.3)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Thiết bị mua ngoài phải có ghi chú nguồn gốc", "fields": { "origin_note": "Trường bắt buộc" } } }
```

Khi thiếu serial thì cùng mã lỗi này với thông báo "Số serial/IMEI là trường bắt buộc".

**RESPONSE 404 Not Found** - `customer_id` không tồn tại.
**RESPONSE 409 Conflict** - serial đang thuộc khách khác (BR-05)

```json
{ "error": { "code": "SERIAL_OWNED_BY_OTHER", "message": "Serial/IMEI này đang thuộc một khách hàng khác. Vui lòng chuyển Quản lý trung tâm xử lý" } }
```

**RESPONSE 403 Forbidden** - vai trò Quản lý trung tâm gọi endpoint này.

### 4.4. GET /api/issue-categories - danh mục nhóm sự cố (UC5, US5, FR6)

**RESPONSE 200 OK**

```json
{
  "total": 6,
  "items": [
    { "category_id": 1, "category_name": "Màn hình", "default_priority": "CAO" },
    { "category_id": 2, "category_name": "Pin", "default_priority": "TRUNG_BINH" },
    { "category_id": 3, "category_name": "Sạc", "default_priority": "TRUNG_BINH" },
    { "category_id": 4, "category_name": "Phần mềm", "default_priority": "THAP" },
    { "category_id": 5, "category_name": "Nước vào", "default_priority": "CAO" },
    { "category_id": 6, "category_name": "Khác", "default_priority": "THAP" }
  ]
}
```

Danh mục là dữ liệu cài sẵn theo BR-15. Client dùng `default_priority` để điền sẵn mức ưu tiên khi nhân viên chọn nhóm; nhân viên vẫn sửa được (BR-21, AC5.1). Nhóm "Khác" là đường thoát khi không nhóm nào phù hợp (AC5.2). Không có endpoint POST hay PATCH cho đường dẫn này.

**RESPONSE 401 Unauthorized** - thiếu hoặc hết hạn token.

### 4.5. POST /api/tickets - lập phiếu bảo hành (UC4, US4, FR4, FR5, FR6)

**HEADERS:** `Authorization: Bearer <token>` (bắt buộc). Không có header chống trùng; cơ chế chống tạo trùng khi thử lại dựa vào BR-06, xem mục 2.

**REQUEST BODY**

```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "issue_desc": "Màn hình chớp tắt khi cắm sạc",
  "category_id": 1,
  "priority": "CAO"
}
```

**RESPONSE 201 Created** - phục vụ AC4.1

```json
{
  "ticket_id": 88231,
  "ticket_code": "BH-000123/2026",
  "status": "MOI",
  "customer_id": 1024,
  "device_id": 3311,
  "center_code": "TT01",
  "category_id": 1,
  "priority": "CAO",
  "is_warranty": null,
  "verified_by": null,
  "verified_at": null,
  "reject_reason": null,
  "received_at": "2026-09-08T14:30:00+07:00",
  "due_date": "2026-09-09T14:30:00+07:00"
}
```

Diễn giải các trường do hệ thống sinh:

- `ticket_code`: 6 chữ số tăng dần, bắt đầu lại từ `000001` mỗi năm, không tái sử dụng (BR-08).
- `received_at`: thời điểm hệ thống chấp nhận lưu phiếu lần đầu. `due_date` tính từ mốc này theo mức ưu tiên: CAO 24 giờ, TRUNG_BINH 72 giờ, THAP 120 giờ, và Chủ Nhật không được tính (BR-09, BR-10, QT-04). Ví dụ trên là mức CAO, không vướng Chủ Nhật.
- `status`: luôn là `MOI` khi tạo. Trong suốt luồng L2 trạng thái không đổi; việc chuyển trạng thái thuộc luồng khác (BR-07).
- `center_code` và người tạo: lấy từ token, không nhận từ client (BR-17).
- `is_warranty` bằng `null` **chính là** dấu hiệu phiếu chưa được duyệt. Mọi phiếu đều chờ Quản lý trung tâm quyết định (BR-14), nên không có trường cờ riêng.

**RESPONSE 400 Bad Request** - thiếu mô tả lỗi (AC4.2)

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Mô tả lỗi do khách kể là trường bắt buộc", "fields": { "issue_desc": "Trường bắt buộc" } } }
```

Thiếu `category_id` hoặc `priority` thì cùng mã lỗi này với thông báo "Vui lòng chọn nhóm sự cố và mức ưu tiên".

**RESPONSE 404 Not Found** - `customer_id`, `device_id` hoặc `category_id` không tồn tại.
**RESPONSE 409 Conflict** - thiết bị đang có phiếu chưa đạt trạng thái Đã đóng (AC4.3, BR-06)

```json
{ "error": { "code": "DEVICE_HAS_OPEN_TICKET", "message": "Thiết bị đang có phiếu BH-000123/2026 chưa đóng", "fields": { "open_ticket_code": "BH-000123/2026" } } }
```

**RESPONSE 403 Forbidden** - người gọi không phải Nhân viên tiếp nhận.

### 4.6. GET /api/tickets - danh sách phiếu của trung tâm (UC6, US6, FR7)

**QUERY**

| Tham số | Bắt buộc | Ý nghĩa |
| :--- | :--- | :--- |
| `category_id` | Không | Lọc theo nhóm sự cố |
| `warranty` | Không | Lọc theo hình thức: `CHUA_DUYET`, `MIEN_PHI` hoặc `TINH_PHI`. `CHUA_DUYET` tương ứng `is_warranty` rỗng |
| `page`, `size` | Không | Phân trang |

**RESPONSE 200 OK**

```json
{
  "total": 3,
  "page": 1,
  "size": 20,
  "items": [
    {
      "ticket_id": 88231,
      "ticket_code": "BH-000012/2026",
      "status": "MOI",
      "is_overdue": true,
      "due_date": "2026-09-06T09:15:00+07:00",
      "is_warranty": null,
      "priority": "CAO",
      "category": { "category_id": 1, "category_name": "Màn hình" },
      "customer": { "full_name": "Nguyễn Văn An", "phone_masked": "090****567" },
      "device": { "serial_no": "SN-PHONE-456" }
    },
    {
      "ticket_id": 88232,
      "ticket_code": "BH-000013/2026",
      "status": "MOI",
      "is_overdue": true,
      "due_date": "2026-09-07T10:20:00+07:00",
      "is_warranty": true,
      "priority": "TRUNG_BINH",
      "category": { "category_id": 2, "category_name": "Pin" },
      "customer": { "full_name": "Trần Thị B", "phone_masked": "091****234" },
      "device": { "serial_no": "SN-EXT-999" }
    },
    {
      "ticket_id": 88233,
      "ticket_code": "BH-000014/2026",
      "status": "MOI",
      "is_overdue": false,
      "due_date": "2026-09-10T11:05:00+07:00",
      "is_warranty": null,
      "priority": "THAP",
      "category": { "category_id": 6, "category_name": "Khác" },
      "customer": { "full_name": "Lê Văn C", "phone_masked": "098****567" },
      "device": { "serial_no": "SN-PHONE-123" }
    }
  ]
}
```

Danh sách chia hai nhóm theo BR-20, và thứ tự đã được sắp sẵn: mọi phần tử có `is_overdue` bằng `true` đứng trước, rồi mới tới phần tử `false`, mỗi nhóm xếp theo `due_date` tăng dần. Nhờ vậy đầu nhóm hai đương nhiên là phiếu gần tới hạn nhất, và client chỉ việc vẽ ranh giới nhóm tại chỗ `is_overdue` đổi từ `true` sang `false`. `is_overdue` là trường dẫn xuất, tính bằng phép so `due_date` với thời điểm hiện tại, không lưu trong cơ sở dữ liệu.

Danh sách rỗng trả `total: 0` và `items: []`.

**RESPONSE 400 Bad Request** - `warranty` không thuộc ba giá trị hợp lệ, hoặc `category_id` không phải số nguyên dương.
**RESPONSE 403 Forbidden** - người gọi không phải Quản lý trung tâm. Endpoint này chỉ phục vụ hàng đợi duyệt của Quản lý.

### 4.7. PATCH /api/tickets/{ticket_id}/warranty-decision - duyệt hình thức bảo hành (UC6, US6, FR7)

**REQUEST BODY** - duyệt

```json
{ "decision": "APPROVE" }
```

**REQUEST BODY** - từ chối, bắt buộc có lý do (AC6.2, BR-14)

```json
{ "decision": "REJECT", "reject_reason": "Thiết bị đã quá hạn bảo hành theo hoá đơn khách cung cấp" }
```

**RESPONSE 200 OK**

```json
{
  "ticket_id": 88231,
  "is_warranty": false,
  "verified_by": 57,
  "verified_at": "2026-09-08T16:05:00+07:00",
  "reject_reason": "Thiết bị đã quá hạn bảo hành theo hoá đơn khách cung cấp"
}
```

Quyết định được lưu **trên phiếu** ở ba cột `is_warranty`, `verified_by`, `verified_at` cùng `reject_reason`, và **không** ghi thêm dòng vào `ticket_status_log`, vì bảng đó chỉ ghi chuyển trạng thái (BR-14).

**RESPONSE 400 Bad Request** - từ chối mà thiếu lý do (AC6.3)

```json
{ "error": { "code": "REASON_REQUIRED", "message": "Vui lòng nhập lý do từ chối" } }
```

**RESPONSE 403 Forbidden** - người gọi không phải Quản lý trung tâm, hoặc phiếu không thuộc trung tâm trong token (BR-14, BR-17, QT-14).
**RESPONSE 404 Not Found** - `ticket_id` không tồn tại.
**RESPONSE 409 Conflict** - phiếu đã được duyệt trước đó (BR-14)

```json
{ "error": { "code": "ALREADY_DECIDED", "message": "Phiếu đã được duyệt" } }
```

---

## 5. Bảng validation

| Trường | Endpoint | Bắt buộc | Kiểu và ràng buộc | Thông báo lỗi khi vi phạm |
| :--- | :--- | :--- | :--- | :--- |
| `phone` | 1, 2 | Có | Chuẩn hoá về 10 chữ số bắt đầu bằng `0`; nhận dạng có tiền tố +84 hoặc 84, có dấu cách hoặc dấu chấm (BR-02, QT-02) | Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx) |
| `full_name` | 2 | Có | Chuỗi, 1 đến 120 ký tự | Vui lòng nhập Họ tên khách hàng |
| `address` | 2 | Không | Chuỗi, tối đa 255 ký tự | không có |
| `customer_id` | 3, 5 | Có | Số nguyên dương, phải tồn tại | Không tìm thấy khách hàng |
| `serial_no` | 3 | Có | Chuỗi, 1 đến 50 ký tự, duy nhất toàn hệ thống (BR-03, QT-03) | Số serial/IMEI là trường bắt buộc |
| `is_external` | 3 | Có | `true` khi thiết bị không có trong lịch sử mua hàng (BR-04) | Thiết bị mua ngoài phải có ghi chú nguồn gốc |
| `origin_note` | 3 | Có khi `is_external` bằng `true` | Chuỗi, tối đa 200 ký tự | Thiết bị mua ngoài phải có ghi chú nguồn gốc |
| `purchase_date` | 3 | Không | Ngày `YYYY-MM-DD`, không được sau ngày hiện tại | Ngày mua không hợp lệ |
| `warranty_months` | 3 | Không | Số nguyên 1 đến 120; mặc định 12 | Số tháng bảo hành không hợp lệ |
| `device_id` | 5 | Có | Số nguyên dương, phải thuộc `customer_id` (BR-03, QT-03) | Thiết bị không thuộc về khách hàng này |
| `issue_desc` | 5 | Có | Chuỗi, 1 đến 2000 ký tự | Mô tả lỗi do khách kể là trường bắt buộc |
| `category_id` | 5 | Có | Số nguyên dương, phải có trong danh mục (BR-15) | Vui lòng chọn nhóm sự cố và mức ưu tiên |
| `priority` | 5 | Có | Một trong `CAO`, `TRUNG_BINH`, `THAP`; client điền sẵn theo `default_priority` của nhóm, nhân viên sửa được (BR-21) | Vui lòng chọn nhóm sự cố và mức ưu tiên |
| `category_id` | 6 | Không | Số nguyên dương, phải có trong danh mục | Nhóm sự cố không hợp lệ |
| `warranty` | 6 | Không | Một trong `CHUA_DUYET`, `MIEN_PHI`, `TINH_PHI` | Hình thức phiếu không hợp lệ |
| `page`, `size` | 6 | Không | `page` từ 1; `size` từ 1 đến 100 | Tham số phân trang không hợp lệ |
| `decision` | 7 | Có | `APPROVE` hoặc `REJECT` | Quyết định không hợp lệ |
| `reject_reason` | 7 | Có khi `REJECT` | Chuỗi, 1 đến 300 ký tự | Vui lòng nhập lý do từ chối |

---

## 6. Danh mục mã lỗi

| Mã lỗi | HTTP | Khi nào | Quy tắc |
| :--- | :--- | :--- | :--- |
| `UNAUTHENTICATED` | 401 | Thiếu hoặc hết hạn token | không có |
| `FORBIDDEN_ROLE` | 403 | Vai trò không được gọi endpoint | BR-14, BR-17 |
| `CENTER_OUT_OF_SCOPE` | 403 | Phiếu không thuộc trung tâm trong token | BR-17, QT-14 |
| `INVALID_PHONE` | 400 | Số điện thoại sai định dạng sau chuẩn hóa | BR-02, QT-02 |
| `VALIDATION_FAILED` | 400 | Thiếu trường bắt buộc hoặc sai kiểu | BR-01, BR-04 |
| `REASON_REQUIRED` | 400 | Từ chối bảo hành miễn phí mà thiếu lý do | BR-14 |
| `PARAM_INVALID` | 400 | Tham số truy vấn sai | không có |
| `CUSTOMER_NOT_FOUND` | 404 | Số điện thoại hoặc `customer_id` không có hồ sơ | không có |
| `DEVICE_NOT_FOUND` | 404 | `device_id` không tồn tại | không có |
| `CATEGORY_NOT_FOUND` | 404 | `category_id` không có trong danh mục | BR-15 |
| `TICKET_NOT_FOUND` | 404 | `ticket_id` không tồn tại | không có |
| `CUSTOMER_EXISTS` | 409 | Trùng số điện thoại khi lưu đồng thời | BR-01, QT-01 |
| `SERIAL_OWNED_BY_OTHER` | 409 | Serial đang thuộc khách khác | BR-03, BR-05, QT-03 |
| `DEVICE_HAS_OPEN_TICKET` | 409 | Thiết bị đang có phiếu chưa đạt trạng thái Đã đóng | BR-06 |
| `ALREADY_DECIDED` | 409 | Phiếu đã được duyệt | BR-14 |

---

## 7. Truy vết quy tắc nghiệp vụ trong hợp đồng

| Quy tắc case study | Thể hiện ở hợp đồng này |
| :--- | :--- |
| QT-01 SĐT duy nhất | `409 CUSTOMER_EXISTS` kèm `existing_customer_id` ở endpoint 2 |
| QT-02 Chuẩn hóa SĐT | Chuẩn hóa trước khi tra ở endpoint 1 và trước khi lưu ở endpoint 2; `400 INVALID_PHONE` |
| QT-03 Thiết bị xác định bằng serial | `serial_no` duy nhất ở endpoint 3; `409 SERIAL_OWNED_BY_OTHER` |
| QT-04 Hạn cam kết theo mức ưu tiên | `due_date` do hệ thống sinh ở endpoint 5, kèm BR-09 và BR-10 |
| QT-05 Điều kiện bảo hành và phê duyệt | Hợp đồng **không** tự xác định điều kiện bảo hành: mọi phiếu tạo ra đều có `is_warranty` rỗng, và endpoint 7 là nơi duy nhất chốt hình thức |
| QT-06 Vòng đời trạng thái | `status` luôn là `MOI` ở endpoint 5; chuyển trạng thái thuộc luồng khác nên không endpoint nào trong hợp đồng này đổi `status` |
| QT-13 Không xóa vật lý | Không có endpoint DELETE |
| QT-14 Phạm vi dữ liệu | Bảng phân quyền ở mục 3; `403 CENTER_OUT_OF_SCOPE` ở endpoint 6 và 7 |
| QT-15 Che SĐT | `phone_masked` ở mọi response; trường `phone` đầy đủ chỉ trả cho Quản lý trung tâm |
