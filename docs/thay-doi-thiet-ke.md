# Nhật ký thay đổi thiết kế

Mỗi mục ghi lại một phản hồi của giảng viên và quyết định xử lý, theo mẫu của buổi 8 và
buổi 14. Mã mục đánh liên tục trong toàn tệp, không dùng lại mã cũ.

## Sau phản hồi Bài tập 1 (buổi 6, ngày 17/10/2026)

### TD-01 Bổ sung bảng lịch sử trạng thái

- Phản hồi của GV: Mục 3 mới chỉ nói chọn công nghệ (Prisma, Svelte, SvelteKit), chưa nói
  quyết định kiến trúc nào giúp đạt ngưỡng NFR; lập luận chọn Svelte cho NFR2 (che số điện
  thoại) không liên quan tới NFR đó, còn phần đánh đổi thì mơ hồ. Câu hỏi mà bài chưa trả
  lời được là "phiếu này ở trạng thái Đang xử lý bao lâu".
- Quyết định: SỬA
- Lý do: không có bảng lịch sử trạng thái thì không tính được thời gian phiếu ở từng trạng
  thái, nên ngưỡng NFR về thời gian xử lý không có gì để đo.
- Ảnh hưởng: thêm bảng `ticket_status_log` vào ERD, và viết lại phần lý do chọn kiến trúc
  trong PDF để nói tới ngưỡng NFR thay vì chỉ nói tới công nghệ.

### TD-02 Bổ sung trang bìa cho PDF

- Phản hồi của GV: bài không có trang bìa gồm tên học phần, track, lớp và ngày nộp; FR chỉ
  nằm trong bảng truy vết mà không có chỗ nào nêu thành lời.
- Quyết định: SỬA
- Lý do: yêu cầu hình thức của trường, và thiếu trang bìa thì người chấm không biết bài của
  ai, thuộc track nào.
- Ảnh hưởng: thêm trang bìa, và tách bảng yêu cầu chức năng ra khỏi bảng truy vết.

## Sau phản hồi Bài tập 2 (buổi 12, ngày 7/11/2026)

### TD-03 Bổ sung kiểm thử đủ năm loại và ba trạng thái màn hình

- Phản hồi của GV: mục kiểm chứng (bảng 4.2) chưa đạt. C4 chưa đạt vì năm test chỉ kiểm
  hàm số điện thoại và hạn xử lý, chưa thể hiện đủ ba loại kiểm thử. S4 chưa đạt vì chưa
  có ảnh trạng thái đang tải, rỗng và lỗi của màn hình.
- Quyết định: SỬA
- Lý do: một bộ test chỉ có luồng đúng thì không chứng minh được hệ thống xử lý dữ liệu sai
  và giá trị biên ra sao; còn ba trạng thái màn hình là thứ giảng viên sẽ tự mở ra xem.
- Ảnh hưởng: bộ test tăng lên mười bốn ca, đủ năm loại theo buổi 13, gồm cả hai ca dữ liệu
  sai và một ca bảo mật. Ảnh ba trạng thái đang tải, rỗng, lỗi nằm trong `docs/screenshots/`
  với tên `06-trang-thai-dang-tai.png`, `07-trang-thai-rong.png` và `08-trang-thai-loi.png`.

### TD-04 Giữ nguyên phạm vi không kiểm thử phần giao diện

- Phản hồi của GV: gợi ý bổ sung kiểm thử giao diện tự động cho ba màn hình.
- Quyết định: KHÔNG SỬA
- Lý do: buổi 13 xếp kiểm thử đầu-cuối vào tầng đắt nhất và khuyên viết ít; BT3 chấm tầng
  nghiệp vụ và tầng API. Với mười hai ca theo tỉ lệ 6 đến 8 unit, 2 đến 3 integration và 2
  đến 3 API, không còn chỗ cho kiểm thử giao diện mà vẫn giữ được một ca cho mỗi quy tắc
  nghiệp vụ. Ba màn hình vẫn được chứng minh bằng ảnh chụp ba trạng thái ở TD-03.
- Ảnh hưởng: không thay đổi mã. Quyết định này được ghi lại theo yêu cầu của buổi 14: không
  phải nhận xét nào cũng phải sửa, nhưng nhận xét nào cũng phải có quyết định ghi lại.
