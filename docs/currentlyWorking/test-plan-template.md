# Test Plan - Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)
## This is a template, please do not hand in this file. Edit the main file instead.

## 1. Phạm vi
Kiểm: tiếp nhận phiếu, kiểm bảo hành QT-05, sinh hạn cam kết QT-04,
chặn phiếu trùng QT-03, phân quyền theo chủ sở hữu.
KHÔNG kiểm: màn hình cấu hình (chỉ đọc, không có quy tắc nghiệp vụ);
hiệu năng và tải (thuộc Chuyên đề tốt nghiệp 2).

---
## 2. Loại test và số lượng
7 unit (service) · 2 integration (service + PostgreSQL thử) · 3 API (Supertest)
Kỹ thuật chọn dữ liệu: phân vùng tương đương; giá trị biên cho QT-04, QT-05.
Đủ 5 loại BT3: luồng đúng ×4 · biên ×2 · dữ liệu sai ×2 · bảo mật ×1 · tái lập ×1.

---
## 3. Tiêu chí thành công
- 12/12 test case có kết quả thực tế; mọi QT đã hiện thực có >= 1 test.
- Không còn bug Critical đang mở; bug Major còn lại có lý do và hướng xử lý.

---
## 4. Môi trường và dữ liệu thử
docker compose up -d --build · dữ liệu: seeds/test_fixtures.sql (12 khách,
20 thiết bị, 2 tài khoản A/B) · resetDb() chạy trước MỖI test · lệnh: npm test