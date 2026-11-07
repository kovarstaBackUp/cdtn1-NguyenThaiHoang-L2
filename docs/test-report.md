# Test Report - Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành (track SE)

Kết quả chạy thật ngày 07/11/2026, trên Node.js 26, PostgreSQL 16 trong Docker, với
lệnh `pnpm run test` trong thư mục `src`. Tổng cộng **14 ca, 14 PASS, 0 FAIL**, thời
gian 1,36 giây. Mười hai ca đầu là bảng chính, hai ca cuối là ca canh bug đã sửa.

Phân bố theo loại: luồng đúng 7, biên 2, dữ liệu sai 2 (trong đó một ca là ca bảo mật),
tái lập 1. Mã quy tắc nghiệp vụ ghi ở cột kết quả mong đợi.

| ID | Precondition | Steps | Test data | Expected result | Priority | Actual result | P/F |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 [SE] | Hàm `maskPhone` đã có, không cần cơ sở dữ liệu | Gọi `maskPhone` với số mười chữ số | `0901234567` | Trả `090****567`, giữ ba số đầu và ba số cuối, không lộ số đầy đủ (NFR2) | High | Trả đúng `090****567`, số đầy đủ không xuất hiện trong kết quả | PASS |
| TC-02 [SE] | Hàm `normalizePhone` đã có | Gọi với số có đầu `+84`, khoảng trắng và dấu chấm | `+84 90.123.4567` | Trả `0901234567`, tức bỏ `+84`, bỏ khoảng trắng và dấu (BR-02) | High | Trả `0901234567` | PASS |
| TC-03 [SE] | Hàm `normalizePhone` đã có | Gọi với số chín chữ số, tức biên dưới của độ dài hợp lệ | `090123456` | Trả `null` vì thiếu một chữ số (BR-02) | High | Trả `null` | PASS |
| TC-06 [SE] | Hàm `normalizePhone` đã có | Gọi với số mười một chữ số, tức biên trên | `09012345678` | Trả `null` vì thừa một chữ số (BR-02) | High | Trả `null` | PASS |
| TC-04 [SE] | Hàm `calculateDueDate` đã có | Tính hạn cho phiếu mức CAO nhận lúc 09:00 thứ Sáu | `2026-10-16T09:00:00+07:00` | `2026-10-17T09:00:00+07:00`, đúng 24 giờ sau, không vướng Chủ nhật (BR-09) | High | `2026-10-17T09:00:00+07:00` | PASS |
| TC-05 [SE] | Hàm `calculateDueDate` đã có | Tính hạn cho phiếu mức CAO nhận lúc 09:00 thứ Bảy, tức mốc vướng Chủ nhật | `2026-10-17T09:00:00+07:00` | `2026-10-19T09:00:00+07:00`, nhảy qua Chủ nhật sang thứ Hai (BR-10) | High | `2026-10-19T09:00:00+07:00` | PASS |
| TC-07 [SE] | Service lập phiếu chạy với đối tượng giả, không cần cơ sở dữ liệu | Gọi `ticketService.create` với dữ liệu hợp lệ, đối tượng giả ghi lại mọi lần gọi | khách 1024, thiết bị 88231, nhóm 1, mức CAO | Trả phiếu có mã dạng `BH-` cộng sáu chữ số và năm, trạng thái `MOI`; đối tượng giả nhận đúng một dòng nhật ký với `from_status` rỗng và `to_status` là `MOI` (BR-07, BR-08) | High | Mã đúng dạng `BH-nnnnnn/nnnn`, trạng thái `MOI`; đúng một dòng nhật ký, `ticketId` 88231, `fromStatus` rỗng, `toStatus` `MOI` | PASS |
| TC-08 [SE] | Thiết bị đang có một phiếu mở | Gọi `ticketService.create` cho cùng thiết bị đó | phiếu mở sẵn `BH-000123/2026` | Ném lỗi mã `DEVICE_HAS_OPEN_TICKET`, trạng thái 409, thông điệp nêu mã phiếu đang mở; không tạo phiếu và không ghi nhật ký (BR-06) | High | Lỗi `DEVICE_HAS_OPEN_TICKET` 409, thông điệp có `BH-000123/2026`; không phiếu nào được tạo, không dòng nhật ký nào được ghi | PASS |
| TC-09 [SE] | Có phiếu chưa duyệt thuộc trung tâm `TT01` | Quản lý `TT01` gọi `decisionService.decide` với quyết định duyệt, rồi đọc lại phiếu từ cơ sở dữ liệu | `{ decision: "APPROVE" }` | `is_warranty` bằng `true`, `verified_by` bằng 2, `verified_at` có giá trị; đọc lại thấy `is_warranty` `true` và `reject_reason` rỗng (BR-14) | High | `isWarranty` `true`, `verified_by` 2, `verified_at` dạng ISO; đọc lại qua repository thấy `isWarranty` `true`, `rejectReason` `null` | PASS |
| TC-10 [SE] | Khách, thiết bị và nhóm sự cố đều hợp lệ | Gọi `POST /api/tickets` với danh tính nhân viên tiếp nhận | cùng bộ dữ liệu như TC-07 | Mã 201, thân phản hồi có `ticket_code` đúng dạng và `due_date` có giá trị (AC4.1) | High | Trả 201, `ticket_code` đúng dạng `BH-nnnnnn/nnnn`, `due_date` có giá trị | PASS |
| TC-11 [SE] | Phiếu thuộc trung tâm `TT01` | Gọi `PATCH /api/tickets/{ticket_id}/warranty-decision` bằng danh tính quản lý trung tâm `TT02` | `{ decision: "APPROVE" }` | Mã 403, mã lỗi `CENTER_OUT_OF_SCOPE`, và phiếu không đổi trong cơ sở dữ liệu (BR-17) | High | Trả 403 với `error.code` là `CENTER_OUT_OF_SCOPE`; đọc lại thấy `isWarranty` vẫn `null` | PASS |
| TC-12 [SE] | Database test đã có lược đồ | Gọi `runSeed()` hai lần trong cùng ca, rồi đếm lại danh mục, khách và thiết bị | không có | Sáu danh mục, một hồ sơ khách `0900000001` và ba thiết bị của khách đó không đổi sau lần thứ hai (tính tái lập) | Medium | Sau hai lần vẫn đúng 6 danh mục với tên có dấu đúng như SRS, một hồ sơ khách `0900000001`, 3 thiết bị | PASS |
| TC-13 [SE] | Đồng hồ cố định vào 01:00 giờ Việt Nam ngày 06/11/2026 | Gọi `validateDeviceInput` với ngày mua là hôm nay theo giờ Việt Nam | `2026-11-05T18:00:00Z`, `purchase_date` là `2026-11-06` | Ngày mua được chấp nhận và trả về đúng chuỗi đó (canh BUG-02) | Medium | `purchaseDate` trả `2026-11-06`, không ném lỗi | PASS |
| TC-14 [SE] | Validator thiết bị đã có | Gọi `validateDeviceInput` với ngày mua sai định dạng, rồi với ngày không có thật | `10/02/2026` và `2026-02-30` | Cả hai đều ném `VALIDATION_FAILED` với trạng thái 400 và thông điệp "Ngày mua không hợp lệ" (canh BUG-03) | Medium | Cả hai đều ném `VALIDATION_FAILED` 400, thông điệp "Ngày mua không hợp lệ" | PASS |

## Ghi chú

- TC-01 đến TC-08 không cần cơ sở dữ liệu. TC-09 đến TC-12 cần database test
  `capstoneone_test`, do `docker/init/01-capstoneone-test.sql` tạo khi volume còn trống.
- TC-13 và TC-14 là ca canh bug đã sửa, không tính vào con số mười hai. Cả hai nằm ở
  `tests/device-validator.test.ts`.
- TC-12 đếm danh mục, khách và thiết bị chứ không đếm nhân viên, vì dự án không có
  repository cho bảng `employee`. Phần nhân viên trong `seed.ts` chỉ chạy khi bảng rỗng
  nên không thể nhân đôi, nhưng không quan sát được từ test.
- TC-12 nằm ở tệp riêng `tests/seed.test.ts`, vì `seed.ts` gọi `connectDatabase()` và hàm
  đó ném lỗi nếu client đã kết nối. Đặt ở tệp riêng thì nó là nơi chạm cơ sở dữ liệu đầu
  tiên, nên kết nối còn sạch. Tệp đó gọi `runSeed()` chứ không gọi `seed()`, vì `seed()`
  chỉ chạy một lần mỗi tiến trình.
- Mọi ca chạy trên `capstoneone_test`, không chạm `capstoneone`, nhờ
  `tests/helpers/setup-env.ts` trỏ `DATABASE_URL` sang database test.
