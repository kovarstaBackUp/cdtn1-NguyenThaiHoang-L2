# Checklist bảo mật

Bảy mục, đúng danh sách Bài tập 3 quy định. Mỗi mục ghi trạng thái và một dòng minh chứng
lấy từ lần chạy thật. Ba trạng thái hợp lệ theo đề là ĐÃ LÀM, CHƯA LÀM và KHÔNG ÁP DỤNG.

Mọi lệnh dưới đây chạy trên bộ container đang hoạt động, ngày 11/11/2026. Ảnh nằm trong
thư mục `docs/screenshots/`.

## 1. Không có secret nào trong repo - ĐÃ LÀM, kèm một hạn chế

Minh chứng: `git log --all --oneline -- .env src/.env` không in ra dòng nào, tức `.env`
chưa từng được commit. `rg -n "password|secret|api_key|apiKey" src/src` không tìm thấy
khoá API, token hay chuỗi kết nối nào.

Ảnh: `docs/screenshots/sec-1.png`

Hạn chế, ghi ra thay vì giấu: chính lệnh grep đó **không rỗng**. Nó tìm thấy
`password: 'admin'` và `password: 'employee'` trong `src/routes/login/+page.server.ts`.
Đó là hai tài khoản demo, đã công bố trong README và trong bài nộp, nên không phải secret bị
lộ, nhưng vẫn là mật khẩu ghi cứng trong mã. Cách sửa là đọc hai giá trị đó từ biến môi
trường `DEMO_USER` và `DEMO_PASSWORD` để grep sạch; chưa làm vì sẽ hỏng đường dẫn hai lệnh
với người không đặt biến.

## 2. Dữ liệu vào được kiểm ở tầng ứng dụng - ĐÃ LÀM

Minh chứng: `rg -n "\.query\(|SELECT |INSERT INTO |DELETE FROM |UPDATE .* SET" src/src`
trả về mười bốn kết quả, và cả mười bốn đều là chuỗi mẫu dùng để sinh mã phiếu, đường dẫn,
ngày và chuỗi che số điện thoại. Không có câu SQL nào viết tay, nên không có truy vấn nào
được ghép từ chuỗi; mọi thao tác đọc và ghi đều đi qua ORM có kiểu.

Phép thử injection cho kết quả đúng: `GET /api/customers?phone=' OR 1=1 --` trả
`400 {"code":"INVALID_PHONE"}` và không có bản ghi nào, không trả về danh sách khách.

Ảnh: `docs/screenshots/sec-2.png`

Ca kiểm thử: TC-14 (ngày sai định dạng bị từ chối với 400 và nêu tên trường) và TC-19 (thử
injection), cả hai đều PASS.

## 3. Kiểm soát truy cập theo chủ sở hữu - ĐÃ LÀM

Minh chứng: với phiếu `BH-000001/2026` thuộc trung tâm `TT01`, gọi
`PATCH /api/tickets/1/warranty-decision` bằng token quản lý `TT02` trả về
`403 CENTER_OUT_OF_SCOPE`, và cùng lệnh đó với token `TT01` trả về `200` kèm
`is_warranty: true` và `verified_by: 2`.

Ảnh: `docs/screenshots/TC-18.png`

Một điểm cần nói rõ: ranh giới sở hữu trong hệ thống này là **trung tâm dịch vụ**, không
phải từng người dùng, vì hồ sơ khách hàng và thiết bị được dùng chung toàn công ty (đã ghi
trong `docs/api-contract.md` mục 3). Phân quyền theo vai trò đã thiết kế nhưng chưa bật, vì
`AUTHORIZATION_ENFORCED` đang là `false`.

## 4. Mật khẩu và dữ liệu nhạy cảm được băm hoặc mã hoá - KHÔNG ÁP DỤNG

Minh chứng: `\d employee` cho thấy bảng chỉ có ba cột là `employee_id`, `full_name` và
`center_code`. Không có cột mật khẩu và không có bảng người dùng, vì đăng nhập là stub với
hai tài khoản demo ghi cứng. Không có gì để băm.

Ảnh: `docs/screenshots/sec-4.png`

Biện pháp liên quan mà hệ thống có làm là che dữ liệu: mọi phản hồi chỉ mang `phone_masked`
dạng `090****567`, không bao giờ trả số đầy đủ (NFR2, QT-15, ca TC-01).

## 5. Thông báo lỗi không lộ cấu trúc bên trong - ĐÃ LÀM

Minh chứng: `POST /api/tickets` với thân `{bad json` trả về
`400 {"code":"VALIDATION_FAILED", ...}`. Tắt cơ sở dữ liệu rồi gọi `GET /api/customers` thì
trả về `500 {"status":500,"message":"Internal Error"}`. Không phản hồi nào chứa vết ngăn
xếp, tên bảng hay chuỗi kết nối.

Ảnh: `docs/screenshots/sec-5.png`

## 6. Nhật ký không ghi secret hay dữ liệu cá nhân không cần thiết - ĐÃ LÀM

Minh chứng: `docker compose logs app | grep -iE "password|token|0[0-9]{9}"` không in ra
dòng nào trên toàn bộ log của container, tức không có token, không có mật khẩu và không có
số điện thoại Việt Nam nào lọt vào log.

Ảnh: `docs/screenshots/sec-6.png`

## 7. Phụ thuộc được ghim phiên bản và đã kiểm cảnh báo lỗ hổng cơ bản - CHƯA LÀM XONG

Minh chứng: `src/pnpm-lock.yaml` đã được commit, nên phiên bản thư viện được ghim.
`pnpm audit --prod` báo **một cảnh báo mức high**: gói `hono < 4.12.4`, đi vào qua chuỗi
`.>@prisma/composer>alchemy>@prisma/dev>@hono/node-server>hono`, tức qua công cụ của Prisma
chứ không qua mã ứng dụng.

Ảnh: `docs/screenshots/sec-7.png`

Kế hoạch: lỗ hổng được vá từ `hono >= 4.12.4`; dự án nhận gói này gián tiếp từ Prisma
composer, nên cách sửa là nâng Prisma khi có bản phát hành kéo theo phiên bản đã vá. Trước
lúc đó, phạm vi ảnh hưởng giới hạn ở công cụ tạo lược đồ chạy cục bộ, không truy cập được
từ ứng dụng đang chạy.

## Một hạn chế ngoài bảy mục

Mục 4 không áp dụng, nhưng có một điểm yếu xác thực riêng là thật, ghi ở đây thay vì bỏ qua.
Token phiên là base64 của JSON không có chữ ký, nên token tự tạo vẫn được chấp nhận:
`{"employee_id":1,"role":"QUAN_LY","center_code":"TT99"}` trả về `200` trên
`/api/customers`. Điều này vô hiệu hoá luôn giới hạn theo trung tâm mà mục 3 dựa vào.

Ca TC-17 trong `docs/test-report.md` ghi FAIL cho đúng điểm này. Cách sửa là ký HMAC-SHA256
lên payload và kiểm chữ ký trong `hooks.server.ts`; chưa làm vì mọi token đang ghi trong tài
liệu của repo đều không có chữ ký, nên đổi sẽ làm hỏng tất cả cùng lúc. Tài liệu buổi 15 nói
rõ: ghi "chưa làm" trung thực thì không bị trừ điểm, còn ghi "đã làm" mà không có minh chứng
mới bị trừ.
