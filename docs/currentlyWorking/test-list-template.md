# This file isn't required in the final report, its template is to make the plan easier to look at from a glance!

# Each test plan requrie these 7 cases, excluding test result, which makes 8, referencing page 11
| Cột | Ghi Gì | Ví dụ |
| --- | --- | --- |
| 1. Mã | Mã duy nhất để Bug Log tham chiếu lại | TC-05 |
| 2. Tiền điều kiện | Trạng thái dữ liệu và hệ thống TRƯỚC khi chạy | Thiết bị SN10293A đang có phiếu BH-000231/2026 ở trạng thái DANG_SUA |
| 3. Các bước | Đánh số, mỗi bước một hành động | 1. POST /api/tickets với serialNo của thiết bị trên |
| 4. Dữ liệu thử | Giá trị CỤ THỂ, không phải “một số hợp lệ” | `{ customerId: 1024, serialNo: "SN10293A", mucDo: "CAO", moTaLoi: "Máy sạc không vào" }` |
| 5. Kết quả mong đợi | Quan sát được: mã trạng thái, thông điệp, VÀ tác dụng phụ | 409, error = PHIEU_DANG_MO; bảng tickets KHÔNG có bản ghi mới |
| 6. Mức ưu tiên | Cao / Trung bình / Thấp | Cao (quy tắc nghiệp vụ cốt lõi) |
| 7. Kết quả thực tế | Điền khi CHẠY THẬT, bằng lời cụ thể | 409, PHIEU_DANG_MO; đếm bảng tickets trước/sau: 120 $\rightarrow$ 120 |

