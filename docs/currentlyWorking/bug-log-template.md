## This is a template, please do not hand in this file. Edit the main file instead.

## BUG-03 — Tạo phiếu thất bại khi khách thiếu họ tên
1. Mã và mức độ : BUG-03 · MAJOR — một nhóm khách không tạo được phiếu
2. Phát hiện bởi : TC-07 (Test Report)
3. Triệu chứng : POST /api/tickets trả 500 với khách id=1024;
giao diện hiện "Có lỗi xảy ra", không tạo được phiếu.
4. Cách tái lập : POST /api/tickets với customerId=1024 (full_name rỗng
trong dữ liệu mẫu) — lỗi xuất hiện 5/5 lần.
5. Nguyên nhân : toTicketView() gọi full_name.trim() khi full_name = null;
gốc rễ: customers_raw.csv có bản ghi thiếu tên, lúc nạp không kiểm.
6. Cách sửa : hàm chuyển đổi dùng '(không rõ)' khi nguồn rỗng (đúng hợp đồng);
thêm quy tắc kiểm chất lượng "thiếu họ tên" khi nạp.
7. Commit và : https://github.com/<tài-khoản>/<repo>/commit/a3f9c21
xác nhận chạy lại TC-07 -> PASS; 12/12 test PASS; thêm TC-13 hồi quy.
