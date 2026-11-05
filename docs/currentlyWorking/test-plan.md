# Test Plan - Luồng L2: Tiếp nhận và phân loại yêu cầu bảo hành (track SE)

## 1. Phạm vi

Kiểm những phần có quy tắc nghiệp vụ thật:

- Chuẩn hoá số điện thoại khách trước khi tra cứu và trước khi lưu (BR-02).
- Che số điện thoại trên mọi phản hồi (NFR2, QT-15).
- Tính hạn cam kết theo mức ưu tiên, bỏ trống ngày Chủ Nhật (BR-09, BR-10, QT-04).
- Lập phiếu: sinh mã, ghi dòng nhật ký đầu tiên, chặn phiếu thứ hai trên cùng thiết bị (BR-06, BR-07, BR-08).
- Duyệt hình thức bảo hành và giới hạn dữ liệu theo trung tâm (BR-14, BR-17, QT-14).

KHÔNG kiểm, và lý do:

- Ba màn hình giao diện: BT3 chấm tầng nghiệp vụ và tầng API, không chấm trình bày.
- BR-01, BR-03, BR-04, BR-05, BR-15, BR-21: mỗi quy tắc là một điều kiện một dòng trong service hoặc do ràng buộc lược đồ bảo đảm, không có nhánh xử lý riêng để kiểm.
- BR-16: L2 không có đường xoá nào nên không có gì để kiểm.
- Phân quyền theo vai trò: hằng `AUTHORIZATION_ENFORCED` đang tắt có chủ đích để người chấm mở được mọi màn hình. Chỉ giới hạn theo trung tâm được kiểm, vì nó luôn bật.
- Tranh chấp đồng thời của BR-06 và BR-08, và mọi phép đo hiệu năng: thuộc Chuyên đề tốt nghiệp 2.

## 2. Loại test và số lượng

Danh sách mười hai test case nằm ở `test-list.md`; mục này chỉ tóm tắt số lượng và cách chọn dữ liệu.

8 unit (6 ca trên hàm thuần, 2 ca trên service với đối tượng giả) · 1 integration (service cộng PostgreSQL thật) · 2 API (gọi route thật) · 1 tái lập (nạp dữ liệu hai lần).

Kỹ thuật chọn dữ liệu:

- Phân vùng tương đương cho độ dài số điện thoại: 9, 10 và 11 chữ số là ba nhóm được xử lý khác nhau.
- Giá trị biên cho đúng ranh giới 10 chữ số, thử cả hai phía là 9 và 11.
- Giá trị biên theo thời gian cho mốc Chủ Nhật của hạn cam kết: một ca không vướng Chủ Nhật và một ca vướng.

Đủ năm loại BT3: luồng đúng 7 · biên 2 · dữ liệu sai 2, trong đó một ca là ca bảo mật · tái lập 1. Tổng 12.

Ngoài mười hai ca trên, mỗi bug đã sửa có một ca hồi quy riêng, liệt kê ở cuối `test-list.md` và không tính vào con số 12. Hiện có TC-13 cho BUG-02 và TC-14 cho BUG-03.

## 3. Tiêu chí thành công

Đặt trước khi chạy, không sửa sau khi có kết quả.

- 12/12 test case có kết quả thực tế ghi bằng lời cụ thể. Ca nào FAIL thì ghi FAIL và mở bug, không sửa lại kết quả.
- Tám quy tắc nêu ở mục 1, mỗi quy tắc có ít nhất một ca.
- Đủ năm loại nêu ở mục 2.
- Không còn bug Critical đang mở. Bug Major còn lại phải có lý do và hướng xử lý trong Bug Log.

## 4. Môi trường và dữ liệu thử

- Node.js 26, pnpm 11, PostgreSQL 16 chạy bằng `docker compose up -d db`, `DATABASE_URL` đặt trong `.env`.
- Tạo lược đồ và nạp dữ liệu: `pnpm run db:init` rồi `pnpm run db:seed`. Seed tạo 6 nhóm sự cố, 2 tài khoản gồm một `NHAN_VIEN` và một `QUAN_LY` cùng trung tâm `TT01`, 1 khách và 3 thiết bị.
- Chạy bộ test: `pnpm run test`. Tám ca đầu không cần cơ sở dữ liệu.
- Bốn ca cuối cần PostgreSQL. Khi máy chưa có `DATABASE_URL`, chúng tự bỏ qua để bộ test vẫn chạy được trên máy chưa dựng cơ sở dữ liệu; muốn có kết quả thật cho bốn ca đó thì phải dựng cơ sở dữ liệu trước.
- Dọn dẹp: mỗi ca cần cơ sở dữ liệu xoá `ticket_status_log`, `ticket`, `device` và `customer` trước khi chạy, để không phụ thuộc dữ liệu còn lại từ ca trước.
