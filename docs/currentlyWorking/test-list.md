# Danh sách test case - Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành (track SE)

Tệp này giữ danh sách test case. Tệp `test-plan.md` chỉ tóm tắt, không chép lại danh sách.

Tám cột theo page 11 của tài liệu buổi 13. Mẫu `test-list-template.md` liệt kê bảy cột và ghi chú "thêm kết quả là tám", nhưng danh sách của mẫu đã có sẵn cột kết quả thực tế và thiếu cột PASS/FAIL, nên tôi thêm cột 8 cho đúng đề.

Cột 7 và cột 8 để trống cho tới khi chạy thật. Không điền trước.

| # | Mã | Tiền điều kiện | Các bước | Dữ liệu thử | Kết quả mong đợi | Mức ưu tiên | Kết quả thực tế | PASS/FAIL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | TC-01 | Không cần, hàm thuần | Gọi `maskPhone` | `0901234567` | `090****567` | Cao, NFR2 | | |
| 2 | TC-02 | Không cần, hàm thuần | Gọi `normalizePhone` | `+84 90.123.4567` | `0901234567` | Cao, BR-02 | | |
| 3 | TC-03 | Không cần, hàm thuần | Gọi `normalizePhone` | `090123`, tức 9 chữ số | `null` | Trung bình, BR-02 | | |
| 4 | TC-04 | Không cần, hàm thuần | Gọi `calculateDueDate` với mức `CAO` | nhận lúc `2026-10-16T09:00:00+07:00`, thứ Sáu | `2026-10-17T09:00:00+07:00`, thứ Bảy | Cao, BR-09 | | |
| 5 | TC-05 | Không cần, hàm thuần | Gọi `calculateDueDate` với mức `CAO` | nhận lúc `2026-10-17T09:00:00+07:00`, thứ Bảy | `2026-10-19T09:00:00+07:00`, thứ Hai, vì Chủ Nhật không tính | Cao, BR-10 | | |
| 6 | TC-06 | Không cần, hàm thuần | Gọi `normalizePhone` | `09012345678`, tức 11 chữ số | `null` | Trung bình, BR-02 | | |
| 7 | TC-07 | Khách và thiết bị hợp lệ, thiết bị chưa có phiếu mở | Gọi `ticketService.create` với đối tượng giả thay cho repository | `{ customer_id: 1024, device_id: 3311, issue_desc: "Màn hình chớp tắt", category_id: 1, priority: "CAO" }` | mã phiếu khớp `BH-\d{6}/2026`, `status` là `MOI`, và **đúng một dòng nhật ký** với `from_status` rỗng, `to_status` là `MOI` | Cao, BR-07 và BR-08 | | |
| 8 | TC-08 | Thiết bị `SN-PHONE-123` đã có phiếu `BH-000123/2026` ở trạng thái `MOI` | Gọi `ticketService.create` cho chính thiết bị đó | cùng bộ dữ liệu như TC-07 | lỗi `409` mã `DEVICE_HAS_OPEN_TICKET`, thông điệp chứa `BH-000123/2026`, và **không tạo phiếu, không ghi nhật ký** | Cao, BR-06 | | |
| 9 | TC-09 | Có phiếu chưa được duyệt, thuộc trung tâm `TT01` | Quản lý `TT01` gọi `decisionService.decide` với quyết định duyệt | `{ decision: "APPROVE" }` | đọc lại từ PostgreSQL thấy `is_warranty` bằng `true`, `verified_by` bằng mã quản lý, `verified_at` có giá trị | Cao, BR-14 | | |
| 10 | TC-10 | Khách, thiết bị và nhóm sự cố đều hợp lệ | Gọi `POST /api/tickets` | cùng bộ dữ liệu như TC-07 | mã `201`, thân phản hồi có `ticket_code` và `due_date` | Cao, AC4.1 | | |
| 11 | TC-11 | Phiếu thuộc trung tâm `TT01` | Gọi `PATCH /api/tickets/{ticket_id}/warranty-decision` bằng danh tính trung tâm `TT02` | `{ decision: "APPROVE" }` | mã `403`, mã lỗi `CENTER_OUT_OF_SCOPE`, và phiếu **không đổi** trong cơ sở dữ liệu | Cao, BR-17 | | |
| 12 | TC-12 | Cơ sở dữ liệu đã có lược đồ và đã nạp dữ liệu một lần | Chạy `pnpm run db:init` rồi `pnpm run db:seed` lần thứ hai | không có | không lỗi, `issue_category` vẫn đúng 6 dòng và `employee` vẫn đúng 2 dòng | Trung bình, tính tái lập | | |

## Ghi chú

- TC-01 đến TC-07 không cần cơ sở dữ liệu. TC-08 đến TC-12 cần PostgreSQL, tự bỏ qua khi máy chưa có `DATABASE_URL`.
- Năm loại BT3: luồng đúng gồm TC-01, TC-02, TC-04, TC-05, TC-07, TC-09, TC-10. Biên gồm TC-03 và TC-06 ở hai phía mốc 10 chữ số. Dữ liệu sai gồm TC-08 và TC-11. Bảo mật là TC-11. Tái lập là TC-12.
- Cặp TC-03 và TC-06 là hai phía của cùng một ranh giới, đúng yêu cầu "hai test biên ở hai bên của cùng một ranh giới".
