# Smart CRM - Mekong Mobile - luồng L2

## Yêu cầu

- Node.js v26.12.0 trở lên (phát triển trên 26)
- pnpm 11 (`packageManager` trong `package.json`)
- PostgreSQL 15 trở lên - dùng Docker image kèm sẵn hoặc server bạn đã có

## Chạy nhanh

### 1. Clone về máy
git clone https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2.git
cd cdtn1-NguyenThaiHoang-L2/src

### 2. Chuẩn bị cơ sở dữ liệu PostgreSQL

**Cách A - dùng Docker image kèm sẵn (chọn cách này nếu bạn chưa có PostgreSQL).**

Tải docker nếu như chưa có: https://www.docker.com/products/docker-desktop/

`docker-compose.yaml` chạy `postgres:16-alpine` tại `localhost:5432` với
user/password là `postgres`/`postgres`:

```bash
docker compose up -d db
```

Chỉ cần vậy là đủ cho phần cơ sở dữ liệu. Bạn chỉ dùng Docker cho đúng một
container này.

**Cách B - dùng PostgreSQL sẵn có (bỏ qua Docker hoàn toàn).**

Bất kỳ PostgreSQL 15+ nào truy cập được đều dùng được: bản cài trên máy,
container bạn đang chạy, hoặc server quản lý. Tạo cơ sở dữ liệu một lần, rồi trỏ
`DATABASE_URL` vào đó ở bước 2:

```bash
createdb capstoneone     # hoặc: CREATE DATABASE capstoneone;
```

**Cách C - Prisma Postgres qua Composer.**

```bash
pnpm run dev:composer
```

Lệnh này build ứng dụng, cấp phát một cơ sở dữ liệu Prisma Postgres cục bộ và áp
schema, nên bạn bỏ qua bước 2 đến 5. Nếu chỉ muốn Vite dev server thuần, dùng
`pnpm run dev`.

> **Nếu bạn dùng chung container Docker với dự án khác**, đừng chạy
> `docker compose down -v`. Lệnh đó xóa named volume và toàn bộ cơ sở dữ liệu bên
> trong, kể cả dữ liệu của dự án khác. Cách tắt an toàn là `docker compose stop db`.

### 3. Cấu hình môi trường

```bash
cp .env.example .env
```

`.env.example` ghi rõ từng biến. Biến bắt buộc duy nhất là `DATABASE_URL`; nhóm
`DEV_*` là tiện ích lúc phát triển, mô tả bên dưới.

### 4. Cài đặt phụ thuộc

```bash
pnpm install
```

### 5. Tạo schema và nạp dữ liệu mẫu

```bash
pnpm run db:init     # tạo sáu bảng, ràng buộc và chỉ mục
pnpm run db:seed     # nạp danh mục, khách hàng và thiết bị demo
```

`db:init` áp `src/prisma/contract.ts` lên cơ sở dữ liệu trống rồi đánh dấu (sign).
`db:seed` chạy lại nhiều lần vẫn an toàn. Lệnh seed thêm sáu danh mục lỗi (BR-15),
hai nhân viên, và một khách hàng demo với ba thiết bị.

### 6. Chạy ứng dụng

```bash
pnpm run dev
```

Vite phục vụ ứng dụng tại `http://localhost:5173`, hoặc cổng trống kế tiếp nếu cổng
đó đang bận - hãy đọc cổng mà nó in ra. Sau đó mở `/` và đăng nhập.

### 7. Đăng nhập

Hai tài khoản demo, dùng chung một trang `/login`:

| Tài khoản | Mật khẩu | Vai trò | Trang bắt đầu |
|---|---|---|---|
| `admin` | `admin` | Quản lý trung tâm | `/duyetPhieuBaoHanh` |
| `employee` | `employee` | Nhân viên tiếp nhận | `/traCuuKhachHang` |

Đăng nhập chỉ đổi danh tính trong phiên (cookie `session`, 8 giờ). Vào `/logout` để
xoá phiên. Khi chưa đăng nhập, mọi màn hình trong nhóm `(app)` đều chuyển về
`/login`.

## Các lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `pnpm run dev` | Chạy Vite dev server |
| `pnpm run check` | Chạy `svelte-check` cho cả Svelte và TypeScript |
| `pnpm run build` | Build bản production |
| `pnpm run db:init` | Tạo các bảng từ contract |
| `pnpm run db:update` | Đẩy thay đổi contract lên cơ sở dữ liệu đang có |
| `pnpm run db:verify` | Đối chiếu cơ sở dữ liệu với contract |
| `pnpm run db:seed` | Nạp dữ liệu mẫu (chạy lại vẫn an toàn) |
| `pnpm run contract:emit` | Sinh lại `contract.json` / `contract.d.ts` sau khi sửa contract |
| `pnpm run migration:status` | So sánh đồ thị migration với marker trong cơ sở dữ liệu |
| `pnpm run test` | Chạy bộ kiểm thử Vitest một lần |
| `pnpm run test:watch` | Chạy Vitest ở chế độ theo dõi |

## Kiểm thử

```bash
pnpm run test          # chạy một lần
pnpm run test:watch    # chế độ theo dõi
```

`tests/` chứa các unit test chạy trên hàm thuần, không cần cơ sở dữ liệu: che số điện
thoại (NFR2), chuẩn hoá số điện thoại (BR-03), và cách tính hạn cam kết (BR-10, kể cả
việc bỏ qua Chủ nhật).

## Màn hình

| Màn hình | Đường dẫn | Vai trò | Chức năng |
|---|---|---|---|
| Tra cứu khách hàng | `/traCuuKhachHang` | cả hai vai trò | Tra cứu khách hàng theo số điện thoại, xem thiết bị của họ, tạo khách hàng mới |
| Lập phiếu bảo hành | `/taoPhieuBaoHanh` | Nhân viên tiếp nhận | Đăng ký thiết bị, lập phiếu, xem mã phiếu và hạn cam kết được sinh ra |
| Duyệt hình thức bảo hành | `/duyetPhieuBaoHanh` | Quản lý trung tâm | Hàng đợi duyệt, xếp phiếu quá hạn lên trước, duyệt hoặc từ chối kèm lý do |

## API

`Content-Type: application/json`. Tên trường viết `snake_case` và trùng với tên cột
trong cơ sở dữ liệu. Mốc thời gian theo ISO 8601 giờ Việt Nam
(`2026-09-08T14:30:00+07:00`).

| # | Phương thức | Đường dẫn | Nhân viên tiếp nhận | Quản lý trung tâm |
|---|---|---|---|---|
| 1 | GET | `/api/customers?phone=` | 200 | 200 |
| 2 | POST | `/api/customers` | 201 | 403 |
| 3 | POST | `/api/devices` | 201 | 403 |
| 4 | GET | `/api/issue-categories` | 200 | 200 |
| 5 | POST | `/api/tickets` | 201 | 403 |
| 6 | GET | `/api/tickets` | 403 | 200 |
| 7 | PATCH | `/api/tickets/{ticket_id}/warranty-decision` | 403 | 200 |

`GET /api/tickets` nhận các tham số tùy chọn `category_id`, `warranty`
(`CHUA_DUYET` | `MIEN_PHI` | `TINH_PHI`), `page` và `size` (mặc định 20, tối đa 100).
Kết quả trả về đã được sắp xếp sẵn: phiếu quá hạn trước, rồi phiếu còn hạn, trong
mỗi nhóm tăng dần theo `due_date` (BR-20). Phía client không sắp xếp lại.

Mọi phản hồi đều có `phone_masked` dạng `090****567`. Trường `phone` đầy đủ chỉ
xuất hiện khi người gọi là Quản lý trung tâm (NFR2, QT-15).

### Cấu trúc lỗi

Mọi lỗi dùng chung một dạng:

```json
{ "error": { "code": "MA_LOI", "message": "Thông báo cho người dùng", "fields": { "ten_truong": "chi tiết" } } }
```

| Mã lỗi | HTTP | Khi nào |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Thiếu token hoặc token hết hạn |
| `FORBIDDEN_ROLE` | 403 | Vai trò không được phép gọi endpoint này |
| `CENTER_OUT_OF_SCOPE` | 403 | Phiếu thuộc trung tâm khác |
| `INVALID_PHONE` | 400 | Số điện thoại sai định dạng sau khi chuẩn hóa |
| `VALIDATION_FAILED` | 400 | Thiếu trường hoặc sai kiểu dữ liệu |
| `REASON_REQUIRED` | 400 | Từ chối phiếu nhưng không nêu lý do |
| `PARAM_INVALID` | 400 | Tham số truy vấn không hợp lệ |
| `CUSTOMER_NOT_FOUND` | 404 | Không có bản ghi ứng với số điện thoại hoặc `customer_id` |
| `DEVICE_NOT_FOUND` | 404 | `device_id` không tồn tại hoặc không thuộc khách hàng |
| `CATEGORY_NOT_FOUND` | 404 | `category_id` không có trong danh mục |
| `TICKET_NOT_FOUND` | 404 | `ticket_id` không tồn tại |
| `CUSTOMER_EXISTS` | 409 | Trùng số điện thoại khi lưu |
| `SERIAL_OWNED_BY_OTHER` | 409 | Số serial đã thuộc khách hàng khác |
| `DEVICE_HAS_OPEN_TICKET` | 409 | Thiết bị đã có phiếu chưa đóng |
| `ALREADY_DECIDED` | 409 | Phiếu đã được duyệt hoặc từ chối |

Không có mã `422`. Hết bảo hành không phải là lỗi: mọi phiếu đều được tạo ở trạng
thái chờ duyệt.

## Phân quyền

Phần xác thực mới chỉ là stub. `src/hooks.server.ts` giải mã
`Authorization: Bearer <base64 of {"employee_id","role","center_code"}>` thành
`locals.employee`. Khi không có header và Vite đang ở chế độ dev, hệ thống dùng các
biến `DEV_*`, nên có thể mở app trên trình duyệt mà không cần tạo token.

**Kiểm tra vai trò đang được tắt có chủ đích để ai cũng dùng được mọi màn hình.**
Hằng `AUTHORIZATION_ENFORCED` trong `src/services/access.ts` đang là `false`, khiến
`requireReceptionist` và `requireManager` không làm gì. Đổi hằng đó thành `true` để
khôi phục bảng phân quyền ở mục 3: nhân viên tiếp nhận có `POST /api/customers`,
`POST /api/devices` và `POST /api/tickets`; chỉ Quản lý trung tâm được đọc hàng đợi
hoặc quyết định phiếu.

Giới hạn theo trung tâm (BR-17, QT-14) vẫn được áp dụng: người gọi chỉ thấy các
phiếu có `center_code` trùng với token của mình. Mặc định khi dev là `TT01` và dữ
liệu mẫu cũng nằm ở đó, nên bình thường bạn sẽ không thấy khác biệt.

## Phân quyền

Phần xác thực mới chỉ là stub. `src/hooks.server.ts` đọc danh tính từ hai nguồn:
cookie phiên `session` do trang `/login` đặt, hoặc header
`Authorization: Bearer <base64 of {"employee_id","role","center_code"}>` cho script
gọi API. Cả hai mang cùng một payload.

Riêng request tới `/api/` khi chạy dev mà không có danh tính sẽ dùng biến `DEV_*`,
nên `curl` và script vẫn gọi được API mà không cần token. Các màn hình thì bắt buộc
đăng nhập.

**Kiểm tra vai trò đang được tắt có chủ đích để ai cũng dùng được mọi màn hình.**
Hằng `AUTHORIZATION_ENFORCED` trong `src/services/access.ts` đang là `false`, khiến
`requireReceptionist` và `requireManager` không làm gì. Đổi hằng đó thành `true` để
khôi phục bảng phân quyền ở mục 3: nhân viên tiếp nhận có `POST /api/customers`,
`POST /api/devices` và `POST /api/tickets`; chỉ Quản lý trung tâm được đọc hàng đợi
hoặc quyết định phiếu.

Giới hạn theo trung tâm (BR-17, QT-14) vẫn được áp dụng: người gọi chỉ thấy các
phiếu có `center_code` trùng với token của mình. Mặc định khi dev là `TT01` và dữ
liệu mẫu cũng nằm ở đó, nên bình thường bạn sẽ không thấy khác biệt.

## Cơ sở dữ liệu và contract

`src/prisma/contract.ts` là nguồn duy nhất (single source of truth) cho schema. DDL
được sinh ra từ đó, nên không có file `.sql` viết tay để lệch khỏi schema. Sau khi
sửa contract:

```bash
pnpm run contract:emit    # sinh lại contract.json / contract.d.ts
pnpm run db:update        # áp lên cơ sở dữ liệu
```

`migrations/` chứa các artefact migration và snapshot của Prisma. Lưu ý
`pnpm run migration:status` có thể báo marker trong cơ sở dữ liệu không khớp với đồ
thị migration trên đĩa - điều đó chỉ có nghĩa là cơ sở dữ liệu được cập nhật lần
cuối bằng `db:update` chứ không qua luồng migration. Đây không phải lỗi và schema
vẫn đúng.
