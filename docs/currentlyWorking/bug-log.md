# Bug Log - Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành (track SE)

Ba bug, mỗi bug đủ bảy dòng theo đề bài BT3. Cả ba đều đã sửa và đã chạy lại test để xác nhận. Mức độ xếp theo đúng ba tiêu chí của đề: Critical là hệ thống không dùng được, dữ liệu bị sai, hoặc có lỗ hổng bảo mật; Major là một chức năng quan trọng sai nhưng còn cách làm khác.

## BUG-01 - Dòng nhật ký đầu tiên không bao giờ được ghi khi lập phiếu

1. **Mã và mức độ:** BUG-01 · MAJOR, vì dữ liệu lịch sử của phiếu bị thiếu, nhưng việc lập phiếu vẫn chạy.
2. **Phát hiện bởi:** rà soát mã nguồn luồng lập phiếu. Ca TC-07 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** lập phiếu thành công nhưng bảng `ticket_status_log` vẫn rỗng. Không dựng lại được vòng đời phiếu, nên câu hỏi "phiếu này ở trạng thái Đang xử lý bao lâu" không trả lời được, đúng lý do mà tài liệu buổi 5 dùng để bắt buộc có bảng lịch sử.
4. **Cách tái lập:** gọi `POST /api/tickets` với khách và thiết bị hợp lệ, rồi đếm dòng trong `ticket_status_log`. Trước khi sửa, lần nào cũng 0 dòng, vì đường ghi nhật ký lúc tạo phiếu không hề tồn tại trong mã.
5. **Nguyên nhân:** `log.repository.ts` có hàm `insertStatusChange` nhưng `ticket.service.create` không gọi. Chú thích trong repository giải thích rằng chưa endpoint nào đổi trạng thái nên chưa cần, nhưng đã gộp hai việc khác nhau: **đổi trạng thái** và **dòng đầu tiên lúc tạo phiếu**. SRS BR-07 yêu cầu cả hai, và dòng đầu tiên phải ghi ngay khi tạo.
6. **Cách sửa:** gọi `tx.logs.insertStatusChange` ngay sau `tx.tickets.create`, trong cùng giao dịch đã có sẵn, với `from_status` rỗng, `to_status` là `MOI` và `changed_by` là nhân viên đang đăng nhập. Nhờ vậy hoặc cả hai cùng ghi, hoặc cả hai cùng quay lui.
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/905a1e3 - chạy lại TC-07 thì PASS, và toàn bộ bộ test 10/10 PASS. Thêm TC-07 làm ca hồi quy.

## BUG-02 - Ngày mua bị so với ngày UTC thay vì ngày Việt Nam

1. **Mã và mức độ:** BUG-02 · MAJOR, vì hệ thống từ chối một dữ liệu đúng, nhưng nhân viên vẫn còn cách nhập vòng.
2. **Phát hiện bởi:** rà soát `src/src/validators/device.validator.ts`. Ca TC-13 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** trong khoảng 00:00 đến 06:59 giờ Việt Nam, nhân viên nhập ngày mua là hôm nay thì bị từ chối với thông điệp "Ngày mua không hợp lệ", dù quy tắc chỉ cấm ngày **sau** hôm nay. Buổi sáng là lúc quầy dễ gặp khách mua máy nhất.
4. **Cách tái lập:** cố định đồng hồ vào 01:00 giờ Việt Nam ngày 06/11/2026, tức 18:00 UTC ngày 05/11, rồi gọi `validateDeviceInput` với `purchase_date` là `"2026-11-06"`. Trước khi sửa, hàm ném lỗi 400. Lần nào cũng vậy vì phụ thuộc duy nhất là đồng hồ.
5. **Nguyên nhân:** biểu thức `new Date().toISOString().slice(0, 10)` lấy ngày theo **UTC**, trong khi toàn bộ nghiệp vụ tính theo giờ Việt Nam. Việt Nam là UTC+7, nên trong bảy giờ đầu của mỗi ngày, ngày UTC vẫn là hôm qua và "hôm nay" bị coi là tương lai.
6. **Cách sửa:** so với `toVietnamIso(new Date()).slice(0, 10)`, hàm đã có sẵn trong `#lib/due-date` và đang được dùng cho `received_at` và `due_date`. Kèm một chú thích ngay tại chỗ để lỗi không bị đưa trở lại.
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/40e51f1 - chạy lại TC-13 thì PASS, toàn bộ bộ test 10/10 PASS. Thêm TC-13 làm ca hồi quy.

## BUG-03 - Ngày mua không được kiểm định dạng, dữ liệu sai lọt xuống cơ sở dữ liệu

1. **Mã và mức độ:** BUG-03 · MAJOR, vì API trả 500 cho dữ liệu sai thay vì 400, tức vi phạm hợp đồng, nhưng luồng đúng vẫn chạy.
2. **Phát hiện bởi:** rà soát `src/src/validators/device.validator.ts`. Ca TC-14 được viết sau đó để canh lỗi này quay lại.
3. **Triệu chứng:** gửi `purchase_date` sai định dạng, ví dụ `"10/02/2026"`, thì validator chấp nhận, chuỗi chạy xuống cột `DATE` của PostgreSQL và câu lệnh ghi thất bại, nên người gọi nhận 500 thay vì 400 `VALIDATION_FAILED` như hợp đồng API hứa.
4. **Cách tái lập:** gọi `validateDeviceInput` với `purchase_date` là `"10/02/2026"`. Trước khi sửa, hàm không ném lỗi mà trả về nguyên chuỗi. Với `"2026-02-30"`, một ngày không có thật, cũng vậy. Lần nào cũng lọt vì không có bước kiểm định dạng nào.
5. **Nguyên nhân:** chỉ có phép so sánh chuỗi với ngày hôm nay, không kiểm định dạng và không kiểm ngày có thật. Phép so chuỗi vô tình chặn được vài giá trị như `"abc"` vì `'a'` lớn hơn `'2'`, nên lỗi bị che một phần và chỉ lộ ra với những chuỗi bắt đầu bằng chữ số nhỏ hơn `'2'`.
6. **Cách sửa:** thêm hàm `laNgayHopLe`, kiểm định dạng bằng `/^\d{4}-\d{2}-\d{2}$/` rồi so vòng tròn với `toISOString` để loại ngày không có thật như `2026-02-30`. Nhân tiện, chuỗi rỗng được coi là `null`, đúng như hợp đồng nói "thiếu thì để null".
7. **Commit và xác nhận:** https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2/commit/2937d58 - chạy lại TC-14 thì PASS, toàn bộ bộ test 10/10 PASS. Thêm TC-14 làm ca hồi quy.

## Ghi chú về commit của BUG-01

Commit `905a1e3` mang thông điệp bị đặt sai, "fix(db): realigning the docs with the db, adding logs into db", trong khi nội dung của nó chỉ là phần sửa dòng nhật ký trong `ticket.service.ts`. Nội dung commit là đúng, chỉ thông điệp sai. Ghi ra đây để người đọc không nhầm khi bấm vào link.
