# Bug Log - Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành (track SE)

Ba bug, mỗi bug đủ bảy dòng theo đề bài BT3. Cả ba đã sửa và đã chạy lại test để xác nhận. Mức độ xếp theo đúng ba tiêu chí của đề: Critical là hệ thống không dùng được, dữ liệu bị sai, hoặc có lỗ hổng bảo mật; Major là một chức năng quan trọng sai nhưng còn cách làm khác.

## Chuẩn bị chung

Ba bug dưới đây tái lập trên một cơ sở dữ liệu trống, để mã phiếu và mã bản ghi có giá trị xác định.

1. `docker compose up -d db`
2. `pnpm run db:init` rồi `pnpm run db:seed`
3. `pnpm run dev`, mở đúng cổng Vite in ra, mặc định là `http://localhost:5173`
4. Đăng nhập bằng `employee` / `employee` cho Nhân viên tiếp nhận, hoặc `admin` / `admin` cho Quản lý trung tâm

Dữ liệu có sẵn sau khi seed, dùng trực tiếp trong các bước bên dưới:

| Dữ liệu | Giá trị |
| :--- | :--- |
| Khách hàng | `customer_id` 1, số điện thoại `0900000001`, tên Nguyen Van A |
| Thiết bị 1 | `device_id` 1, `SN-IP14-000123`, mua 2024-03-15, bảo hành 12 tháng, không mua ngoài |
| Thiết bị 2 | `device_id` 2, `SN-SS-S24-000456`, mua ngoài, không có ngày mua, bảo hành 6 tháng |
| Thiết bị 3 | `device_id` 3, `SN-XM-13-000789`, mua ngoài, đã đánh dấu ẩn |
| Nhóm sự cố | 1 Màn hình, 2 Pin, 3 Sạc, 4 Phần mềm, 5 Nước vào, 6 Khác |
| Tài khoản | nhân viên `employee_id` 1, quản lý `employee_id` 2, cùng trung tâm `TT01` |

Hai token dưới đây dán thẳng vào header `Authorization` khi gọi API bằng Postman hoặc curl. Token chính là base64 của `{"employee_id","role","center_code"}`, đúng như `src/lib/server/session.ts` mô tả.

- Nhân viên tiếp nhận: `Bearer eyJlbXBsb3llZV9pZCI6MSwicm9sZSI6Ik5IQU5fVklFTiIsImNlbnRlcl9jb2RlIjoiVFQwMSJ9`
- Quản lý trung tâm: `Bearer eyJlbXBsb3llZV9pZCI6Miwicm9sZSI6IlFVQU5fTFkiLCJjZW50ZXJfY29kZSI6IlRUMDEifQ==`

## BUG-01 - Dòng nhật ký đầu tiên không bao giờ được ghi khi lập phiếu

1. **Mã và mức độ:** BUG-01, MAJOR, vì dữ liệu lịch sử của phiếu bị thiếu, nhưng việc lập phiếu vẫn chạy.
2. **Phát hiện bởi:** rà soát mã nguồn luồng lập phiếu. Ca TC-07 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** lập phiếu thành công nhưng bảng `ticket_status_log` vẫn rỗng. Không dựng lại được vòng đời phiếu, nên câu hỏi "phiếu này ở trạng thái Đang xử lý bao lâu" không trả lời được, đúng lý do mà tài liệu buổi 5 dùng để bắt buộc có bảng lịch sử.
4. **Cách tái lập:** hai đường, cả hai quan sát bằng cùng một câu SQL.
   - **Theo giao diện:** đăng nhập `employee` / `employee`. Vào `/traCuuKhachHang`, nhập `0900000001` rồi bấm nút tra cứu, thấy khách Nguyen Van A cùng ba thiết bị. Bấm nút sang màn hình lập phiếu, chọn dòng thiết bị `SN-IP14-000123`, gõ mô tả lỗi bất kỳ, chọn nhóm `Màn hình` và mức `Cao`, bấm nút `Tao Phieu`. Màn hình hiện "Da tao phieu BH-000001/2026".
   - **Theo Postman:** `POST http://localhost:5173/api/tickets`, header `Authorization` dán token nhân viên, header `Content-Type: application/json`, body:
     ```json
     { "customer_id": 1, "device_id": 1, "issue_desc": "Man hinh chop tat khi cam sac", "category_id": 1, "priority": "CAO" }
     ```
     Kỳ vọng `201` kèm `ticket_code`. Nếu chưa cấu hình `.env` thì dùng token ở phần chuẩn bị chung, không dựa vào biến `DEV_*`.
   - **Quan sát:** chạy `SELECT count(*) FROM ticket_status_log WHERE ticket_id = 1;` trên cùng cơ sở dữ liệu. Trước khi sửa, lần nào cũng **0**, vì đường ghi nhật ký lúc tạo phiếu không hề tồn tại trong mã. Sau khi sửa ra **1**, với `from_status` rỗng và `to_status` là `MOI`.
5. **Nguyên nhân:** `log.repository.ts` có hàm `insertStatusChange` nhưng `ticket.service.create` không gọi. Chú thích trong repository giải thích rằng chưa endpoint nào đổi trạng thái nên chưa cần, nhưng đã gộp hai việc khác nhau: **đổi trạng thái** và **dòng đầu tiên lúc tạo phiếu**. SRS BR-07 yêu cầu cả hai, và dòng đầu tiên phải ghi ngay khi tạo.
6. **Cách sửa:** gọi `tx.logs.insertStatusChange` ngay sau `tx.tickets.create`, trong cùng giao dịch đã có sẵn, với `from_status` rỗng, `to_status` là `MOI` và `changed_by` là nhân viên đang đăng nhập. Nhờ vậy hoặc cả hai cùng ghi, hoặc cả hai cùng quay lui.
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/905a1e3 - chạy lại TC-07 thì PASS, và toàn bộ bộ test 10/10 PASS. Thêm TC-07 làm ca hồi quy.

## BUG-02 - Ngày mua bị so với ngày UTC thay vì ngày Việt Nam

1. **Mã và mức độ:** BUG-02, MAJOR, vì hệ thống từ chối một dữ liệu đúng, nhưng nhân viên vẫn còn cách nhập vòng.
2. **Phát hiện bởi:** rà soát `src/src/validators/device.validator.ts`. Ca TC-13 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** trong khoảng 00:00 đến 06:59 giờ Việt Nam, nhân viên nhập ngày mua là hôm nay thì bị từ chối với thông điệp "Ngày mua không hợp lệ", dù quy tắc chỉ cấm ngày **sau** hôm nay. Buổi sáng là lúc quầy dễ gặp khách mua máy nhất.
4. **Cách tái lập:** lỗi phụ thuộc đồng hồ nên có hai đường, một đường đúng như thực tế và một đường cố định được.
   - **Điều kiện:** phải chạy trong khoảng 00:00 đến 06:59 giờ Việt Nam, vì đó là lúc ngày UTC vẫn còn là hôm qua.
   - **Theo Postman:** `POST http://localhost:5173/api/devices`, header `Authorization` dán token nhân viên, header `Content-Type: application/json`, body:
     ```json
     { "customer_id": 1, "serial_no": "SN-TEST-0001", "is_external": true, "origin_note": "khach mua tai cua hang khac", "purchase_date": "NGAY_HOM_NAY" }
     ```
     thay `NGAY_HOM_NAY` bằng ngày hôm nay theo giờ Việt Nam, dạng `YYYY-MM-DD`. Trước khi sửa, trong khung giờ trên, trả `400` với thông điệp "Ngày mua không hợp lệ". Sau khi sửa trả `201`.
   - **Không muốn chờ khung giờ đó:** chạy `pnpm run test` và xem ca TC-13. Ca này cố định đồng hồ vào 01:00 giờ Việt Nam ngày 06/11/2026, tức 18:00 UTC ngày 05/11, rồi khẳng định ngày hôm nay được chấp nhận.
   - **Theo giao diện thì hiện không tái lập được**, và đây là điều đáng ghi riêng: màn hình `/taoPhieuBaoHanh` chỉ cho chọn thiết bị đã có trong danh sách, ba ô `IMEI / Serial`, `Ghi Chu Nguon Goc` và `Ngay Mua` đều để `readonly`, nên không có đường đăng ký thiết bị mới bằng giao diện. Đường duy nhất hiện nay là gọi thẳng `POST /api/devices`.
5. **Nguyên nhân:** biểu thức `new Date().toISOString().slice(0, 10)` lấy ngày theo **UTC**, trong khi toàn bộ nghiệp vụ tính theo giờ Việt Nam. Việt Nam là UTC+7, nên trong bảy giờ đầu của mỗi ngày, ngày UTC vẫn là hôm qua và "hôm nay" bị coi là tương lai.
6. **Cách sửa:** so với `toVietnamIso(new Date()).slice(0, 10)`, hàm đã có sẵn trong `#lib/due-date` và đang được dùng cho `received_at` và `due_date`. Kèm một chú thích ngay tại chỗ để lỗi không bị đưa trở lại.
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/40e51f1 - chạy lại TC-13 thì PASS, toàn bộ bộ test 10/10 PASS. Thêm TC-13 làm ca hồi quy.

## BUG-03 - Ngày mua không được kiểm định dạng nên dữ liệu sai lọt qua tầng kiểm tra

1. **Mã và mức độ:** BUG-03, MAJOR, vì API không từ chối dữ liệu sai ở ranh giới như hợp đồng đã hứa; nếu tầng lưu trữ còn nhận giá trị đó thì ngày mua bị lưu sai, và trường hợp đó đáng xếp Critical.
2. **Phát hiện bởi:** rà soát `src/src/validators/device.validator.ts`. Ca TC-14 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** gửi `purchase_date` sai định dạng, ví dụ `"10/02/2026"`, thì validator chấp nhận và trả về nguyên chuỗi, nên giá trị thô đi xuống tầng lưu trữ. Hợp đồng API hứa `400 VALIDATION_FAILED` cho dữ liệu sai, nhưng ở đây không có `400`. Hậu quả ở tầng lưu trữ phụ thuộc `datestyle` của PostgreSQL: nếu từ chối thì người gọi nhận `500`, nếu chấp nhận thì `"10/02/2026"` có thể được hiểu thành ngày 2 tháng 10, tức lưu sai ngày mua.
4. **Cách tái lập:** chạy được ở bất kỳ giờ nào, không phụ thuộc đồng hồ.
   - **Theo Postman:** `POST http://localhost:5173/api/devices`, header `Authorization` dán token nhân viên, header `Content-Type: application/json`, body:
     ```json
     { "customer_id": 1, "serial_no": "SN-TEST-0002", "is_external": true, "origin_note": "khach mua tai cua hang khac", "purchase_date": "10/02/2026" }
     ```
     Trước khi sửa, không nhận được `400`; giá trị lọt xuống cột `DATE` và câu lệnh ghi hoặc thất bại, hoặc lưu một ngày khác với ý người gửi. Sau khi sửa trả `400` kèm `fields.purchase_date`.
   - **Ca thứ hai cùng bản chất:** đổi `purchase_date` thành `"2026-02-30"`, một ngày không có thật. Trước khi sửa cũng lọt, sau khi sửa trả `400`.
   - **Không cần Postman:** chạy `pnpm run test` và xem ca TC-14. Ca này gọi thẳng `validateDeviceInput` với cả hai giá trị trên và khẳng định đều ném `VALIDATION_FAILED` với `status` 400.
   - **Theo giao diện thì không tái lập được**, cùng lý do như BUG-02: màn hình lập phiếu không có ô nhập thiết bị mới.
5. **Nguyên nhân:** chỉ có phép so sánh chuỗi với ngày hôm nay, không kiểm định dạng và không kiểm ngày có thật. Phép so chuỗi vô tình chặn được vài giá trị như `"abc"`, vì `'a'` lớn hơn `'2'`, nên lỗi bị che một phần và chỉ lộ ra với những chuỗi bắt đầu bằng chữ số nhỏ hơn `'2'`, đúng như `"10/02/2026"` và `"2026-02-30"`.
6. **Cách sửa:** thêm hàm `laNgayHopLe`, kiểm định dạng bằng `/^\d{4}-\d{2}-\d{2}$/` rồi so vòng tròn với `toISOString` để loại ngày không có thật. Nhân tiện, chuỗi rỗng được coi là `null`, đúng như hợp đồng nói "thiếu thì để null".
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/2937d58 - chạy lại TC-14 thì PASS, toàn bộ bộ test 10/10 PASS. Thêm TC-14 làm ca hồi quy.

## Ghi chú về commit của BUG-01

Commit `905a1e3` mang thông điệp bị đặt sai, "fix(db): realigning the docs with the db, adding logs into db", trong khi nội dung chỉ là phần sửa dòng nhật ký trong `ticket.service.ts`. Nội dung commit là đúng, chỉ thông điệp sai. Ghi ra đây để người đọc không nhầm khi bấm vào link.
