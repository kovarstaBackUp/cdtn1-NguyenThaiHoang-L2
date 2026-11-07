# Nhật ký thay đổi thiết kế
## Sau phản hồi Bài tập 1 (buổi 6, ngày 17/10/2026)

### TD-01 Bổ sung bảng lịch sử trạng thái
- Phản hồi của GV : Ba câu lập luận ở Mục 3 mới là chọn công nghệ (Prisma, Svelte, SvelteKit), chưa nói quyết định kiến trúc nào giúp đạt ngưỡng NFR; chọn Svelte cho NFR2 (che SĐT) không liên quan, đánh đổi còn mơ hồ.
"phiếu này ở trạng thái Đang xử lý bao lâu".
- Quyết định : SỬA
- Lý do : NFR lũng cũng
không có bảng lịch sử thì không tính được.
- Ảnh hưởng : File PDF được cập nhật lại phần tại sao chọn

### TD-02 Giữ nguyên việc không tách bảng dia_chi
- Phản hồi của GV : Bài không có trang bìa (tên học phần, track, lớp, ngày nộp); FR chỉ nằm trong bảng truy vết.
- Quyết định : Sửa
- Lý do : Không phù hợp với yêu cầu của trường
- Ảnh hưởng : Trang đầu của PDF

## Sau phản hồi Bài tập 2 (buổi 12, ngày 7/11/2026)

### TD-01 Bổ sung bảng lịch sử trạng thái
- Phản hồi của GV : Mục kiểm chứng (bảng 4.2) chưa đạt: C4 (5 test chỉ cho hàm SĐT và hạn xử lý, chưa thể hiện ba loại); S4 (chưa thấy ảnh trạng thái đang tải/rỗng/lỗi).
- Quyết định : SỬA
- Lý do : Báo cáo lũng cũng
- Ảnh hưởng : File PDF thêm chi tiết ứng dụng, màn hình ba chế độ đang tải rỗng lỗi, và test đầy đủ

