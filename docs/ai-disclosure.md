# BẢNG KHAI BÁO SỬ DỤNG CÔNG CỤ AI HỖ TRỢ
**Học phần:** Chuyên đề Tốt nghiệp 1 (Specialized Graduation Topic I)
**Học kỳ:** HK1, Năm học 2026 – 2027
**Bài nộp:** [ ] Bài tập 1 (BT1)   [ ] Bài tập 2 (BT2)   [ x ] Bài tập 3 (BT3)

---

### I. THÔNG TIN SINH VIÊN
* **Họ và tên:** Nguyễn Thái Hoàng
* **Mã số sinh viên:** 2374802010153
* **Chuyên ngành (Track):** [x] SE   [ ] DA   [ ] AI
* **Luồng nghiệp vụ đã chọn:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành

---

### II. BẢNG KHAI BÁO CHI TIẾT

| Công cụ AI | Dùng vào việc gì | Áp dụng ở phần nào (File / Mục) | Đã kiểm chứng & Chỉnh sửa thế nào |
| :--- | :--- | :--- | :--- |
| **Gemini** | Thực hiện việc format lại thành file markdown, chỉnh sửa bố cục | file SRS | Đối chiếu với các thông tin đã được ghi trước đó |
| **Gemini** | Tạo nên phần thân của các User Stories | Mục 3 file SRS, US3 tới US6  | Đối chiếu với các hướng dẫn đã được ghi trong slide Buổi 3 và Buổi 4, sửa đổi lại các phần không chính xác với nghiệp vụ|
| **DeepSeek** | Sử dụng để audit và sửa lại file SRS để mục tiêu chắc chắn hơn, cải thiện chính tả | Mục 3 quy tắc nghiệp vụ, sửa lại cho đúng với yêu cầu và cấu trúc của slide Buổi 4, Mục 5 yêu cầu phi chức năng được viết với số liệu, mục tiêu cần đạt được SRS.md | Đọc và đối chiếu lại với các yêu cầu từ file case study, và file Buổi 4, user story|
| **DeepSeek** | Gợi ý cổng API | api-contract.md | Giữ lại tất cả, đọc và đối chiếu lại với các yêu cầu của Tài liệu tự học buổi 3, đồng thời đối chiếu lại với file SRS|
| **DeepSeek** | Format lại file cho dễ đọc | api-contract.md | Đọc và đối chiếu lại với các yêu cầu của Tài liệu tự học buổi 3, đồng thời đối chiếu lại với file SRS|
| **DeepSeek** | Kiểm tra chính tả, sửa lại cách format và trình bày | SRS.md | Đọc lại tài liệu một lần cuối, git diff SRS.md để kiểm tra |
| **DeepSeek** | Sửa lại format và chính tả | mô tả của wireframe.png | Đọc lại so với tài liệu gốc |
| **DeepSeek** | Tạo SQL SDD Skeleton  | PDF bài | Sử dụng erd dbml chuyển đổi sang skeleton, kiểm tra lại với tài liệu gốc |
| **DeepSeek** | Viết Schema Database | /src/src/prisma/contract.ts| Kiểm tra lại so với ERD trước đó |
| **DeepSeek** | Viết API template cho các cổng API | PDF bài | Kiểm tra hoạt động và tiếp tục viết API|
| **DeepSeek** | Chỉnh đốn lại CSS Styling  | /src/src/lib/app.css | Kiểm tra trang hoạt động chính xác và hiển thị đúng |
| **DeepSeek** | Tạo nên README.md | README.md | Kiểm chứng lại README và lập lại môi trường từ chính nó |
| **DeepSeek** | Áp dụng base64 session check vào ứng dụng |  src/src/lib/server/session.ts, src/src/routes/(app)/+layout.server.ts, src/src/routes/+page.server.ts, src/src/routes/login, src/src/routes/logout/ | Đọc và kiểm chứng lại các dòng code, đồng thời kiểm tra ứng dụng hoạt động ổn định |
| **DeepSeek** | Thiết kế CI đơn giản | .github/ci.yaml | Kiểm tra CI hoạt động chính xác, syntax đúng và dễ hiểu |
| **DeepSeek** | Package ứng dụng vào docker build | Dockerfile | Đọc và kiểm tra ứng dụng hoạt động chính xác |
| **DeepSeek** | Reformat lại các file md của bài tập 3 | bug-log.md ; test-plan.md | Đọc và kiểm chứng lại so với bản thảo chưa format |
| **DeepSeek** | Kiểm tra và cải thiện các test | seed.test.ts ; database.test.ts | Kiểm tra rằng các test thực hiện đúng với mục tiêu, đồng thời kiểm tra không có side effect |
| **DeepSeek** | Soạn thảo phần kết quả của file pdf cho bài tập 2 | pdfCapstoneTwo.pdf | Kiểm tra thông tin chính xác |
| **DeepSeek** | Viết Deployment Guide tiếng Anh, gồm mục Verify it works | docs/deployment-guide.md | Chạy phép thử máy trắng từ thư mục trống theo đúng các lệnh ghi trong Guide, phát hiện bước kiểm tra ghi sai và sửa lại cho khớp hành vi thật của bản dựng |
| **DeepSeek** | Viết checklist bảo mật bảy mục và đề xuất cách kiểm từng mục | docs/checklist-bao-mat.md | Chạy từng phép kiểm bằng curl vào container đang chạy, ghi lại mã trạng thái và thân phản hồi thật, kể cả mục bị đánh giá là chưa làm |
| **DeepSeek** | Viết tài liệu API tiếng Anh cho bảy endpoint | docs/api-docs.md | Đếm lại số route trong mã, đối chiếu từng mã lỗi với app-error.ts và từng tham số với validator, sửa ba chỗ ghi sai |
| **DeepSeek** | Viết Test Report và các ca kiểm bảo mật theo OWASP | docs/test-report.md | Chạy lại bộ test, chạy từng ca riêng để lấy output thật, ghi kết quả đúng như quan sát, gồm một ca ghi FAIL |
| **DeepSeek** | Tạo Postman collection cho bảy endpoint | docs/postman-collection.json | Kiểm cú pháp JSON và đối chiếu từng request với lần gọi thật trước đó |
| **DeepSeek** | Điều khiển Chrome chụp ảnh minh chứng | docs/screenshots/ | Ảnh 01 đến 08 chụp từ ứng dụng thật đang chạy. Ảnh TC-01 đến TC-20, sec-1 đến sec-7, result.png và bốn ảnh white-machine chụp hai phần đều là ảnh chụp terminal thật của các lần chạy lệnh |
| **DeepSeek** | Thêm dịch vụ test vào compose và kịch bản tạo database test | src/docker-compose.yaml, src/docker/init/ | Chạy docker compose run --rm test, kiểm 14/14 PASS bên trong container |
| **DeepSeek** | Viết lại README sang tiếng Anh | README.md | Đối chiếu từng mục với mã nguồn, sửa ba chỗ README nói sai so với hệ thống thật |
| **DeepSeek** | Proof read và chỉnh sửa chính tả file pdf BT3 | BT3_NguyenThaiHoang_2374802010153 | Đối chiếu từng mục với nội dung đã có sẵn trong /docs|
| **Không dùng** | usecase.drawio, architecture.drawio, wireframe.png, schema.dbml | - | Tự vẽ bằng drawio và ERD tự phân bổ và đối chiếu với các tài liệu đã được cấp và SRS |



---

### III. CAM KẾT VỀ LIÊM CHÍNH HỌC THUẬT

> **"Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp."**

* **Chữ ký / Họ tên sinh viên:** Nguyễn Thái Hoàng
* **Ngày khai báo:** 14/11/2026
