# Bản đặc tả yêu cầu phần mềm (SRS rút gọn)

- Dự án: Hệ thống Smart CRM - Mekong Mobile
- Phạm vi: Luồng L2 - Tiếp nhận và phân loại yêu cầu bảo hành
- Chuẩn tham chiếu: ISO/IEC/IEEE 29148 (bản rút gọn cho học phần Capstone One)
- Tác giả: Nguyễn Thái Hoàng

---

## 1. Giới thiệu và phạm vi

### 1.1. Bối cảnh

Công ty Cổ phần Bán lẻ & Dịch vụ Mekong Mobile có 24 cửa hàng bán lẻ, 6 trung tâm bảo hành và hơn 65.000 khách hàng. Việc tiếp nhận bảo hành hiện làm thủ công bằng phiếu giấy và Excel rải rác, khiến khoảng 15% phiếu bị quá hạn mà không có cảnh báo. Vấn đề thứ hai là mô tả lỗi do khách kể được ghi tự do bằng chữ, không phân nhóm, nên không thống kê được nguyên nhân bảo hành phổ biến nhất để làm việc với nhà cung cấp (V8) - đây là lý do L2 bắt buộc gắn nhóm sự cố cho mọi phiếu. Dự án Smart CRM giải quyết vấn đề này bằng cách chia nghiệp vụ thành các luồng độc lập; tài liệu này chỉ đặc tả luồng L2.

### 1.2. Phạm vi của L2

Nhân viên tiếp nhận tra cứu khách bằng số điện thoại, tạo hồ sơ khách và đăng ký thiết bị nếu chưa có, lập phiếu với mô tả lỗi, gắn một nhóm sự cố và chọn mức ưu tiên. Hệ thống tự tính hạn cam kết (SLA) và lưu phiếu ở trạng thái MỚI. Quản lý trung tâm duyệt hình thức bảo hành cho **mọi** phiếu trên một danh sách xếp phiếu quá hạn lên trước.

### 1.3. Ngoài phạm vi (WON'T)

- Phân công kỹ thuật viên, quản lý lịch hẹn (luồng L4).
- Xuất/nhập và tồn kho linh kiện (luồng L5), kể cả việc tạm dừng đồng hồ SLA khi phiếu chờ linh kiện.
- Gửi tin nhắn tự động qua SMS, Zalo hoặc email.
- Khảo sát hài lòng CSAT/NPS (luồng L8).
- Tự động phân loại sự cố bằng học máy (luồng L10). Ở L2, nhân viên tự chọn nhóm sự cố và mức ưu tiên.
- Sửa hoặc hủy phiếu, sửa hồ sơ khách sau khi đã lưu.
- Lịch sử trao đổi với khách theo từng phiếu (ai, khi nào): không thuộc L2.
- Chuyển quyền sở hữu thiết bị từ khách này sang khách khác.
- Tạo, sửa hoặc ngừng sử dụng nhóm sự cố. Danh mục nhóm sự cố là dữ liệu cài sẵn, không phải chức năng của L2.
- Đăng nhập và cấp quyền: là hạ tầng, không phải nghiệp vụ của L2 (case study Mục 10).

### 1.4. Thuật ngữ

Tên kỹ thuật chỉ xuất hiện trong bảng này; các phần còn lại dùng thuật ngữ nghiệp vụ.

| Thuật ngữ | Định nghĩa | Tên kỹ thuật gợi ý |
| :--- | :--- | :--- |
| Trung tâm bảo hành | Đơn vị tiếp nhận và xử lý phiếu. Phiếu thuộc trung tâm của tài khoản lập phiếu (BR-17). L2 không quản lý trung tâm, nên trung tâm chỉ là một mã tổ chức đến từ phiên đăng nhập, không phải một bảng. | `center_code` |
| Người dùng hệ thống | Tài khoản đăng nhập của Nhân viên tiếp nhận và Quản lý trung tâm. Hai vai trò nằm trong cùng một bảng và phân biệt bằng cột vai trò. Hồ sơ nhân sự do bộ phận tổ chức quản lý; L2 chỉ đọc để biết ai đang thao tác. | `employee` (`employee_id`, `full_name`, `role`, `center_code`); `role` nhận `NHAN_VIEN`, `QUAN_LY` |
| Khách hàng | Cá nhân từng mua hàng hoặc dùng dịch vụ tại Mekong Mobile, kể cả khách mang thiết bị mua ngoài đến bảo hành (hồ sơ tạo ở UC3). | `customer` |
| Thiết bị | Một máy cụ thể do khách sở hữu, định danh duy nhất bằng số serial hoặc IMEI. | `device`, `serial_no` |
| Thiết bị mua ngoài | Thiết bị khách mua ở nơi khác, không có trong lịch sử mua hàng nên không có ngày mua. Vẫn được đăng ký và tiếp nhận. | `device.is_external` |
| Phiếu bảo hành | Yêu cầu bảo hành được ghi nhận, có mã duy nhất dạng `BH-xxxxxx/yyyy` (yyyy là năm tiếp nhận) và có vòng đời trạng thái. | `ticket` |
| Trạng thái phiếu | Vị trí của phiếu trong vòng đời xử lý (BR-07, case study Hình 6.2). L2 chỉ tạo phiếu ở trạng thái MỚI. Bảy trạng thái của vòng đời dùng chung: MỚI, ĐÃ PHÂN CÔNG, ĐANG XỬ LÝ, CHỜ LINH KIỆN, HOÀN TẤT, ĐÃ ĐÓNG, ĐÃ HỦY. | `status` (`MOI`, `DA_PHAN_CONG`, `DANG_XU_LY`, `CHO_LINH_KIEN`, `HOAN_TAT`, `DA_DONG`, `DA_HUY`) |
| Chưa duyệt | Mọi phiếu đều nằm ở trạng thái chưa duyệt cho tới khi Quản lý trung tâm quyết định hình thức bảo hành. Không phải trạng thái vòng đời, và không có cột riêng: trong dữ liệu, phiếu chưa duyệt là phiếu có hình thức còn rỗng. Quyết định lưu trên phiếu ở cột người quyết định, thời điểm quyết định và lý do từ chối. | `is_warranty` (rỗng = chưa duyệt), `verified_by`, `verified_at`, `reject_reason` |
| Hình thức phiếu | Bảo hành miễn phí hoặc Sửa chữa có tính phí. Để rỗng khi phiếu chưa được duyệt; chỉ chốt sau quyết định của Quản lý trung tâm (BR-14). | `is_warranty` (được phép rỗng) |
| Hạn cam kết (SLA) | Thời điểm chậm nhất phải hoàn thành phiếu, tính từ lúc tiếp nhận theo mức ưu tiên (BR-09, BR-10). | `due_date` |
| Nhóm sự cố | Nhãn phân loại nguyên nhân bảo hành, lấy từ một danh mục dùng chung cài sẵn gồm Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác. Mỗi phiếu gắn đúng một nhóm; L2 không tạo và không sửa danh mục (BR-15). | `issue_category` (`category_id`, `category_name`) |
| Mức ưu tiên | Mức khẩn cấp của phiếu: Cao, Trung bình, Thấp. Quyết định hạn cam kết. | `priority` (`CAO`, `TRUNG_BINH`, `THAP`) |
| Nhật ký trạng thái | Bản ghi mỗi lần phiếu **đổi trạng thái**, kèm người thực hiện, thời điểm và ghi chú (nếu có). Dòng đầu tiên được ghi ngay khi tạo phiếu (BR-07). Quyết định về hình thức bảo hành được lưu trên phiếu, không ghi vào nhật ký này (BR-14). Trong L2, mỗi phiếu chỉ sinh đúng một dòng lúc tạo; các dòng sau thuộc luồng khác. | `ticket_status_log` |

---

## 2. Vai trò người dùng

| Vai trò | Được làm | Không được làm |
| :--- | :--- | :--- |
| Nhân viên tiếp nhận | Tra cứu khách theo SĐT. Tạo hồ sơ khách và đăng ký thiết bị nếu chưa có. Lập phiếu, gắn một nhóm sự cố, chọn mức ưu tiên. | Đổi trạng thái phiếu sang Hoàn tất hoặc Đã đóng. Sửa mã phiếu. Quyết định hình thức bảo hành. Tạo hoặc sửa nhóm sự cố. Xem SĐT đầy đủ (NFR2). |
| Quản lý trung tâm | Duyệt hình thức bảo hành cho mọi phiếu của trung tâm mình, xem và lọc danh sách phiếu theo nhóm sự cố và theo hình thức phiếu. Xem SĐT đầy đủ. | Xóa vĩnh viễn phiếu hoặc hồ sơ khách (BR-16). Trực tiếp sửa chữa thiết bị. Tạo phiếu. |

Ban giám đốc không có màn hình riêng trong L2 và không được thêm thành vai trò của luồng này. Quyền của Ban giám đốc theo QT-14 và QT-15 vẫn giữ nguyên trong BR-17 và NFR2, không thu hẹp.

---

## 3. Quy tắc nghiệp vụ

Các quy tắc nghiệp vụ của L2 nằm ở đây; user story và use case chỉ dẫn chiếu tới, không nhắc lại nội dung. Quy tắc của các luồng khác không thuộc phạm vi L2. Bảng đối chiếu nguồn ở mục 6.3.

| Mã | Quy tắc | Nội dung |
| :--- | :--- | :--- |
| BR-01 | Duy nhất số điện thoại | SĐT khách là duy nhất trong hệ thống. Nhập số đã có thì hiển thị hồ sơ sẵn có, không tạo hồ sơ mới. |
| BR-02 | Chuẩn hóa số điện thoại | Trước khi kiểm tra và lưu, SĐT được chuẩn hóa về 10 chữ số bắt đầu bằng `0`. Các dạng `+84901234567`, `84901234567`, `090 123 4567`, `090.123.4567` đều thành `0901234567`. Chuỗi không thành 10 chữ số sau chuẩn hóa là sai định dạng. |
| BR-03 | Duy nhất thiết bị | Thiết bị được xác định bằng số serial/IMEI. Một thiết bị chỉ thuộc một khách tại một thời điểm. |
| BR-04 | Thiết bị mua ngoài | Thiết bị không có trong lịch sử mua hàng vẫn được đăng ký cho khách; bắt buộc nhập serial/IMEI và ghi chú nguồn gốc. Ngày mua để rỗng, trừ khi khách xuất trình hóa đơn thì nhân viên nhập ngày mua theo hóa đơn (Mục 6.1 bước 3). Thiết bị được đánh dấu là mua ngoài, không có hồ sơ mua. |
| BR-05 | Xung đột serial/IMEI | Serial/IMEI đang thuộc khách khác thì không được gắn cho khách hiện tại. Nhân viên báo Quản lý trung tâm xử lý ngoài hệ thống, vì L2 không hỗ trợ chuyển quyền sở hữu. |
| BR-06 | Một phiếu mở cho mỗi thiết bị | Một thiết bị chỉ có tối đa một phiếu chưa đạt trạng thái Đã đóng tại một thời điểm. |
| BR-07 | Vòng đời trạng thái | Trạng thái chỉ tiến, không quay lại. L2 chỉ tạo phiếu ở trạng thái MỚI, và khi tạo phải ghi ngay một dòng nhật ký trạng thái (`from_status` rỗng chuyển thành MỚI, kèm người tạo và thời điểm). Các trạng thái sau MỚI do luồng khác điều khiển nhưng dùng chung một vòng đời (case study Hình 6.2); hủy phiếu (ĐÃ HỦY) và mở lại phiếu đã đóng đều thuộc luồng khác. Mọi lần chuyển trạng thái đều ghi vào nhật ký trạng thái. Hình thức bảo hành chưa duyệt không phải trạng thái vòng đời. |
| BR-08 | Mã phiếu | Dạng `BH-xxxxxx/yyyy`: xxxxxx là số thứ tự 6 chữ số tăng dần trên toàn hệ thống, bắt đầu lại từ `000001` mỗi năm; yyyy là năm tiếp nhận. Mã không tái sử dụng, không sửa được và vẫn duy nhất khi nhiều người lưu cùng lúc. |
| BR-09 | Tính hạn cam kết | Hạn cam kết tính từ **thời điểm tiếp nhận** (thời điểm hệ thống chấp nhận lưu phiếu lần đầu, tức `received_at`): mức Cao 24 giờ, Trung bình 72 giờ, Thấp 120 giờ (QT-04). |
| BR-10 | Loại trừ Chủ Nhật | Giờ cam kết tính liên tục, nhưng ngày Chủ Nhật không được tính: đồng hồ dừng suốt Chủ Nhật và chạy lại từ 00:00 Thứ Hai. Đồng hồ **không** dừng vì bất kỳ lý do nào khác, kể cả khi phiếu đang chờ linh kiện. Ngày lễ chưa được loại trừ trong L2. Ví dụ ở bảng dưới. |
| BR-14 | Duyệt hình thức bảo hành | **Mọi** phiếu đều chờ Quản lý trung tâm duyệt hình thức: Bảo hành miễn phí hoặc Sửa chữa có tính phí. Khi từ chối bảo hành miễn phí bắt buộc nhập lý do. Hệ thống lưu **trên phiếu** người quyết định, thời điểm và lý do, không ghi vào nhật ký trạng thái. |
| BR-15 | Nhóm sự cố | Mỗi phiếu gắn đúng **một** nhóm sự cố, chọn từ danh mục dùng chung. Danh mục là dữ liệu cài sẵn gồm Màn hình, Pin, Sạc, Phần mềm, Nước vào và Khác; L2 không tạo, không sửa và không ngừng sử dụng nhóm. Sự cố chưa có nhóm phù hợp thì chọn Khác. |
| BR-16 | Xóa mềm | Không xóa vĩnh viễn khách hàng, thiết bị hay phiếu; chỉ đánh dấu ẩn để giữ dữ liệu lịch sử. |
| BR-17 | Phạm vi theo trung tâm | Hồ sơ khách hàng và thiết bị dùng chung toàn công ty: nhân viên tiếp nhận tra cứu được khách đã mua ở bất kỳ cửa hàng nào. Riêng **phiếu** thì theo trung tâm: phiếu thuộc trung tâm của tài khoản lập phiếu, ghi bằng mã trung tâm lấy từ phiên đăng nhập; Quản lý trung tâm chỉ xem phiếu của trung tâm mình. Theo QT-14, Quản lý xem được toàn bộ đơn vị mình phụ trách và Ban giám đốc xem được toàn công ty; L2 không xây màn hình riêng cho Ban giám đốc. |
| BR-20 | Tập phiếu và thứ tự danh sách | Danh sách phiếu của Quản lý trung tâm chia **hai nhóm**: đã qua hạn và chưa qua hạn, bằng cách so `due_date` với thời điểm hiện tại. Nhóm đã qua hạn lên trước; mỗi nhóm xếp theo hạn cam kết tăng dần, nên phiếu gần tới hạn nhất nằm ngay đầu nhóm hai. Danh sách lọc được theo nhóm sự cố và theo hình thức phiếu. |
| BR-21 | Mức ưu tiên mặc định của nhóm | Mỗi nhóm sự cố có một mức ưu tiên mặc định. Khi nhân viên chọn nhóm sự cố cho phiếu, hệ thống điền sẵn mức ưu tiên đó; nhân viên vẫn sửa được và vẫn phải có mức ưu tiên trước khi lưu (AC4.2). |

Ví dụ cho BR-09 và BR-10:

| Mức ưu tiên | Tạo lúc | Hạn cam kết |
| :--- | :--- | :--- |
| Cao | 09:00 Thứ Hai | 09:00 Thứ Ba |
| Cao | 15:00 Thứ Bảy | 15:00 Thứ Hai |
| Trung bình | 10:00 Thứ Sáu | 10:00 Thứ Ba tuần sau |
| Thấp | 09:00 Thứ Tư | 09:00 Thứ Ba tuần sau |

---

## 4. Yêu cầu chức năng

### 4.1. Danh sách user story

| Mã | Vai trò | Nội dung | MoSCoW |
| :--- | :--- | :--- | :--- |
| US1 | Nhân viên tiếp nhận | Tra cứu khách hàng qua số điện thoại | MUST |
| US2 | Nhân viên tiếp nhận | Tạo hồ sơ khách hàng mới | SHOULD |
| US3 | Nhân viên tiếp nhận | Đăng ký thiết bị cho khách | SHOULD |
| US4 | Nhân viên tiếp nhận | Lập phiếu bảo hành mới, hệ thống tự tính hạn cam kết | MUST |
| US5 | Nhân viên tiếp nhận | Gắn nhóm sự cố cho phiếu | MUST |
| US6 | Quản lý trung tâm | Duyệt hình thức bảo hành, phiếu quá hạn hiện trước | SHOULD |

Có 3 story MUST làm bộ lõi của luồng, đúng ba động từ của tên luồng: tra cứu, lập phiếu, phân loại. Ba story SHOULD là phần hoàn thiện xung quanh.

### 4.2. Chi tiết user story và tiêu chí chấp nhận

Mỗi tiêu chí chấp nhận (AC) viết theo dạng Given-When-Then và chuyển được trực tiếp thành một test case ở BT3. Mỗi story MUST có từ 2 đến 3 tiêu chí, trong đó ít nhất một tiêu chí cho trường hợp ngoại lệ. Thông báo hiển thị cho người dùng được ghi trong dấu ngoặc kép; chuỗi nào lấy nguyên văn từ SRS thì wireframe dùng lại đúng chuỗi đó.

#### US1 [MUST] Tra cứu khách hàng qua số điện thoại

Là nhân viên tiếp nhận, tôi muốn tra cứu hồ sơ khách bằng số điện thoại để không phải hỏi lại và nhập lại thông tin khách đã có.

- AC1.1 Tìm thấy khách
  - Given: số điện thoại `0901234567` đã có trong hệ thống.
  - When: nhân viên nhập `0901234567`, hoặc nhập `+84 901 234 567`, rồi tra cứu.
  - Then: hệ thống chuẩn hóa theo BR-02 và hiển thị họ tên, SĐT che dạng `090****567`, địa chỉ và danh sách thiết bị của khách, gồm cả thiết bị mua ngoài đã đăng ký trước đó.
- AC1.2 Chưa có hồ sơ
  - Given: số điện thoại `0908777666` không có trong hệ thống.
  - When: nhân viên tra cứu.
  - Then: hệ thống báo "Không tìm thấy thông tin khách hàng" và mở sẵn form tạo khách mới với số điện thoại đã điền.
- AC1.3 Sai định dạng
  - Given: nhân viên nhập `090123`, không thành đúng 10 chữ số sau chuẩn hóa.
  - When: nhân viên tra cứu.
  - Then: hệ thống từ chối tìm kiếm, báo "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)" và giữ nguyên nội dung đã nhập.

#### US2 [SHOULD] Tạo hồ sơ khách hàng mới

Là nhân viên tiếp nhận, tôi muốn tạo hồ sơ khách ngay trên màn hình tiếp nhận khi số điện thoại chưa có, để lập tiếp phiếu mà không bị ngắt quãng.

Họ tên là trường bắt buộc; địa chỉ không bắt buộc.

- AC2.1 Tạo thành công
  - Given: số điện thoại `0988777666` chưa có trong hệ thống.
  - When: nhân viên nhập họ tên "Nguyễn Văn A" và lưu khách hàng.
  - Then: hệ thống lưu hồ sơ khách mới và tự điền khách vừa tạo vào form lập phiếu.
- AC2.2 Trùng số điện thoại khi lưu đồng thời
  - Given: số `0988777666` vừa được nhân viên khác tạo.
  - When: nhân viên lưu khách hàng.
  - Then: hệ thống chặn tạo trùng theo BR-01, báo "Số điện thoại đã tồn tại trên hệ thống" và nạp hồ sơ đã có.
- AC2.3 Thiếu họ tên
  - Given: nhân viên để trống họ tên.
  - When: nhân viên lưu khách hàng.
  - Then: hệ thống từ chối lưu, đánh dấu trường thiếu và báo "Vui lòng nhập Họ tên khách hàng".

#### US3 [SHOULD] Đăng ký thiết bị cho khách

Là nhân viên tiếp nhận, tôi muốn chọn thiết bị từ lịch sử mua hàng của khách hoặc đăng ký thiết bị mua ngoài, để ghi nhận đúng máy khách mang đến.

- AC3.1 Chọn thiết bị đã mua
  - Given: khách đã được chọn và thiết bị `SN-PHONE-123` nằm trong lịch sử mua hàng của khách.
  - When: nhân viên chọn thiết bị đó.
  - Then: hệ thống tự điền serial/IMEI, ngày mua và số tháng bảo hành.
- AC3.2 Thiết bị mua ngoài
  - Given: thiết bị khách mang đến không nằm trong lịch sử mua hàng.
  - When: nhân viên nhập serial/IMEI `SN-EXT-999` kèm ghi chú nguồn gốc, hoặc nhập thêm ngày mua theo hóa đơn nếu khách xuất trình.
  - Then: hệ thống tạo hồ sơ thiết bị mới cho khách và đánh dấu là mua ngoài theo BR-04.
- AC3.3 Thiếu serial hoặc ghi chú nguồn gốc
  - Given: nhân viên đăng ký thiết bị mua ngoài nhưng để trống serial/IMEI hoặc để trống ghi chú nguồn gốc.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống từ chối và báo "Số serial/IMEI là trường bắt buộc" nếu thiếu serial, hoặc báo "Thiết bị mua ngoài phải có ghi chú nguồn gốc" nếu thiếu ghi chú.

#### US4 [MUST] Lập phiếu bảo hành mới, hệ thống tự tính hạn cam kết

Là nhân viên tiếp nhận, tôi muốn lập phiếu bảo hành cho thiết bị của khách và biết ngay hạn cam kết, để hẹn đúng thời gian trả máy mà không phải tính tay.

- AC4.1 Lập phiếu thành công
  - Given: khách và thiết bị đã được chọn, mô tả lỗi và mức ưu tiên đã có.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống sinh mã duy nhất dạng `BH-000123/2026` theo BR-08, tính hạn cam kết theo BR-09 và BR-10, lưu phiếu ở trạng thái MỚI và báo "Đã tạo phiếu BH-000123/2026".
- AC4.2 Thiếu mô tả lỗi hoặc mức ưu tiên
  - Given: nhân viên để trống mô tả lỗi hoặc chưa chọn mức ưu tiên.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống không cho lưu và báo "Mô tả lỗi do khách kể là trường bắt buộc" nếu thiếu mô tả, hoặc báo "Vui lòng chọn nhóm sự cố và mức ưu tiên" nếu thiếu mức ưu tiên.
- AC4.3 Thiết bị đang có phiếu mở
  - Given: thiết bị `SN-PHONE-123` đang có một phiếu chưa đạt trạng thái Đã đóng.
  - When: nhân viên lưu phiếu cho thiết bị đó.
  - Then: hệ thống không tạo phiếu thứ hai và báo "Thiết bị đang có phiếu BH-000123/2026 chưa đóng" theo BR-06.

#### US5 [MUST] Gắn nhóm sự cố cho phiếu

Là nhân viên tiếp nhận, tôi muốn gắn một nhóm sự cố cho phiếu ngay lúc tiếp nhận, để về sau thống kê được nguyên nhân bảo hành phổ biến nhất.

- AC5.1 Gắn nhóm có sẵn
  - Given: phiếu đang được lập và danh mục cài sẵn có nhóm Pin.
  - When: nhân viên chọn nhóm Pin.
  - Then: hệ thống gắn nhãn Pin cho phiếu, hiển thị trên phiếu, và điền sẵn mức ưu tiên mặc định của nhóm Pin theo BR-21.
- AC5.2 Chưa có nhóm phù hợp
  - Given: sự cố khách kể không khớp với nhóm nào trong danh mục.
  - When: nhân viên chọn nhóm Khác.
  - Then: hệ thống gắn nhãn Khác cho phiếu và phiếu vẫn được lưu bình thường theo BR-15.

#### US6 [SHOULD] Duyệt hình thức bảo hành, phiếu quá hạn hiện trước

Là Quản lý trung tâm, tôi muốn duyệt hình thức bảo hành cho từng phiếu của trung tâm mình, với phiếu đã quá hạn hiện lên trước, để không phiếu nào bị bỏ sót.

- AC6.1 Duyệt bảo hành miễn phí
  - Given: một phiếu đang chưa duyệt.
  - When: Quản lý trung tâm mở phiếu và chọn duyệt bảo hành miễn phí.
  - Then: hệ thống ghi hình thức Bảo hành miễn phí, lưu người duyệt và thời điểm duyệt trên phiếu, và phiếu không còn ở trạng thái chưa duyệt.
- AC6.2 Từ chối kèm lý do
  - Given: một phiếu đang chưa duyệt.
  - When: Quản lý trung tâm từ chối bảo hành miễn phí và nhập lý do.
  - Then: hệ thống ghi hình thức Sửa chữa có tính phí, lưu lý do cùng người quyết định và thời điểm trên phiếu theo BR-14.
- AC6.3 Từ chối thiếu lý do
  - Given: Quản lý trung tâm chọn từ chối nhưng để trống lý do.
  - When: Quản lý trung tâm xác nhận.
  - Then: hệ thống không lưu quyết định và báo "Vui lòng nhập lý do từ chối".

### 4.3. Đặc tả use case

Có sáu use case UC1 đến UC6. UC1, UC3 và UC5 được UC4 gọi vào bằng include, không phải mục tiêu độc lập của người dùng. UC2 mở rộng UC1 tại điểm mở rộng là nhánh không tìm thấy khách. Thông báo và dữ liệu mẫu nằm ở tiêu chí chấp nhận nên use case chỉ dẫn chiếu tới.

#### UC1. Tra cứu khách hàng theo số điện thoại

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: tra cứu hồ sơ khách và lịch sử mua thiết bị theo số điện thoại đã chuẩn hóa.
- Điều kiện trước: đã đăng nhập.
- Điều kiện sau: thông tin khách và danh sách thiết bị của khách được hiển thị.
- Liên quan: US1 | MUST

Luồng chính
1. Nhân viên nhập số điện thoại.
2. Hệ thống chuẩn hóa và kiểm tra số theo BR-02.
3. Hệ thống hiển thị họ tên, SĐT che, địa chỉ và danh sách thiết bị của khách, gồm cả thiết bị mua ngoài đã đăng ký trước đó.

Luồng ngoại lệ
- 2a. Số sai định dạng: hệ thống từ chối tìm kiếm và giữ nguyên nội dung đã nhập (AC1.3).
- 3a. Số chưa có trong hệ thống: hệ thống báo không tìm thấy và mở form tạo khách mới (AC1.2). `[UC2 mở rộng UC1]`

#### UC2. Tạo khách hàng mới

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: tạo hồ sơ khách mới để tiếp tục lập phiếu mà không bị ngắt quãng.
- Điều kiện trước: tra cứu ở UC1 không tìm thấy số điện thoại.
- Điều kiện sau: hồ sơ khách mới được lưu và gắn vào form lập phiếu.
- Liên quan: US2 | SHOULD

Luồng chính
1. Hệ thống mở form tạo khách với số điện thoại điền sẵn.
2. Nhân viên nhập họ tên, địa chỉ nếu có, và lưu.
3. Hệ thống kiểm tra tính duy nhất của số điện thoại theo BR-01, lưu hồ sơ và đưa khách vào form lập phiếu.

Luồng ngoại lệ
- 2a. Thiếu họ tên: hệ thống từ chối lưu (AC2.3).
- 3a. Trùng số điện thoại khi lưu đồng thời: hệ thống không tạo trùng và nạp hồ sơ đã có (AC2.2).

#### UC3. Đăng ký thiết bị cho khách

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: ghi nhận đúng máy khách mang đến, kể cả máy mua ở nơi khác.
- Điều kiện trước: khách đã được chọn ở UC1 hoặc UC2.
- Điều kiện sau: thiết bị thuộc khách và có đủ serial, ngày mua nếu biết, và số tháng bảo hành.
- Liên quan: US3 | SHOULD

Luồng chính
1. Hệ thống hiển thị danh sách thiết bị của khách, gồm cả thiết bị mua ngoài đã đăng ký trước đó.
2. Nhân viên chọn một thiết bị trong danh sách.
3. Hệ thống tự điền serial/IMEI, ngày mua và số tháng bảo hành (AC3.1).

Luồng ngoại lệ
- 2a. Thiết bị không nằm trong lịch sử mua hàng: nhân viên đăng ký thiết bị mua ngoài với serial và ghi chú nguồn gốc theo BR-04, nhập thêm ngày mua nếu khách có hóa đơn (AC3.2).
- 2b. Thiếu serial hoặc ghi chú nguồn gốc: hệ thống từ chối lưu (AC3.3).
- 2c. Serial đang thuộc khách khác: hệ thống từ chối gắn theo BR-05.

#### UC4. Lập phiếu bảo hành mới

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: ghi nhận một yêu cầu bảo hành để theo dõi đến khi đóng.
- Điều kiện trước: đã đăng nhập và có quyền tiếp nhận.
- Điều kiện sau: một phiếu ở trạng thái MỚI được lưu, có mã duy nhất, hạn cam kết, và hình thức bảo hành còn rỗng để chờ Quản lý trung tâm duyệt.
- Liên quan: US4 | MUST

Luồng chính
1. Nhân viên chọn lập phiếu bảo hành mới.
2. Nhân viên nhập số điện thoại khách. `[include UC1]`
3. Nhân viên chọn thiết bị của khách. `[include UC3]`
4. Nhân viên nhập mô tả lỗi, gắn một nhóm sự cố và chọn mức ưu tiên. `[include UC5]`
5. Hệ thống sinh mã phiếu theo BR-08, tính hạn cam kết theo BR-09 và BR-10, lưu phiếu ở trạng thái MỚI, ghi dòng nhật ký trạng thái đầu tiên theo BR-07 và để hình thức bảo hành rỗng.

Luồng ngoại lệ
- 2a. Khách chưa có trong hệ thống: mở form tạo khách mới (UC2), sau khi lưu khách thì quay lại bước 3.
- 3a. Thiết bị đang có phiếu mở: hệ thống hiển thị phiếu đó và không cho tạo phiếu thứ hai theo BR-06 (AC4.3).
- 4a. Thiếu mô tả lỗi hoặc chưa chọn mức ưu tiên: hệ thống không cho lưu (AC4.2).

#### UC5. Gắn nhóm sự cố cho phiếu

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: phân loại phiếu theo nhóm sự cố để theo dõi và thống kê về sau.
- Điều kiện trước: đã nhập mô tả lỗi ở bước 4 của UC4.
- Điều kiện sau: phiếu có đúng một nhóm sự cố.
- Liên quan: US5 | MUST

Luồng chính
1. Hệ thống hiển thị danh mục nhóm sự cố cài sẵn.
2. Nhân viên chọn nhóm phù hợp với mô tả lỗi.
3. Hệ thống gắn nhóm đã chọn cho phiếu và điền sẵn mức ưu tiên mặc định của nhóm theo BR-21.

Luồng ngoại lệ
- 2a. Không có nhóm nào phù hợp: nhân viên chọn nhóm Khác (AC5.2).

#### UC6. Duyệt hình thức bảo hành

- Actor chính: Quản lý trung tâm
- Mục tiêu: quyết định hình thức bảo hành cho từng phiếu của trung tâm mình.
- Điều kiện trước: đã đăng nhập và có phiếu chưa duyệt thuộc trung tâm mình.
- Điều kiện sau: phiếu có hình thức Bảo hành miễn phí hoặc Sửa chữa có tính phí, kèm người quyết định và thời điểm.
- Liên quan: US6 | SHOULD

Luồng chính
1. Quản lý trung tâm mở danh sách phiếu của trung tâm mình. Danh sách chia hai nhóm theo BR-20, nhóm đã qua hạn lên trước, và lọc được theo nhóm sự cố hoặc theo hình thức phiếu.
2. Quản lý trung tâm chọn một phiếu để xem thiết bị, mô tả lỗi, ghi chú nguồn gốc, ngày mua và số tháng bảo hành.
3. Quản lý trung tâm duyệt bảo hành miễn phí.
4. Hệ thống ghi hình thức Bảo hành miễn phí, lưu người duyệt và thời điểm duyệt **trên phiếu** (AC6.1).

Luồng ngoại lệ
- 3a. Thiết bị không đủ điều kiện: Quản lý trung tâm từ chối và nhập lý do; hệ thống ghi hình thức Sửa chữa có tính phí cùng lý do trên phiếu (AC6.2).
- 3b. Từ chối nhưng thiếu lý do: hệ thống không lưu quyết định (AC6.3).

---

## 5. Yêu cầu phi chức năng

| Mã | Loại | Yêu cầu | Cách đo |
| :--- | :--- | :--- | :--- |
| NFR1 | Hiệu năng | Tra cứu khách theo số điện thoại trả kết quả dưới **2,0 giây ở phân vị 95** và không quá **4,0 giây** ở trường hợp chậm nhất; lưu phiếu, kèm khách và thiết bị mới nếu có, dưới **3,0 giây ở phân vị 95**. | Kiểm thử tải ở quy mô hiện tại: **65.000 hồ sơ khách**, **12 nhân viên tiếp nhận thao tác đồng thời**, tối thiểu **1.000 lượt tra cứu** và **200 lượt lưu phiếu**; đo phân vị 95 trên phần cứng tối thiểu RAM 8 GB. |
| NFR2 | Bảo mật | SĐT khách hiển thị ở dạng che 4 chữ số giữa, ví dụ `090****567`, trên mọi màn hình. Theo QT-15, chỉ **Quản lý và Ban giám đốc** xem được đầy đủ; L2 không có màn hình riêng cho Ban giám đốc. Ô nhập do người dùng tự gõ không bị che. | **3 màn hình, 3 lượt theo vai trò**: tra cứu khách và lập phiếu thuộc Nhân viên tiếp nhận, duyệt hình thức bảo hành thuộc Quản lý trung tâm. Đạt khi **0/2** lượt của Nhân viên tiếp nhận lộ SĐT đầy đủ, và màn hình của Quản lý trung tâm hiển thị đầy đủ. |
| NFR3 | Dễ sử dụng | Nhân viên tiếp nhận mới, sau **15 phút** hướng dẫn, tự lập một phiếu chuẩn trong **dưới 3,0 phút** mà không cần hỗ trợ. | **5 nhân viên mới**, mỗi người lập **3 phiếu liên tiếp**; đạt khi **từ 80% trở lên, tức 4/5**, có phiếu thứ ba dưới 3,0 phút và **0 lỗi** ở các trường bắt buộc. |
| NFR4 | Tin cậy | Lưu phiếu, kèm khách và thiết bị mới nếu có, thành công toàn bộ hoặc không lưu gì. Khi mất kết nối, form giữ lại dữ liệu đã nhập. Gửi lại cùng một yêu cầu lưu từ hai lần trở lên chỉ tạo đúng một phiếu, nhờ BR-01, BR-03 và BR-06. | Ngắt mạng tại **3 thời điểm**: trước khi gửi, trong khi gửi, và sau khi máy chủ xử lý nhưng chưa phản hồi; lặp lại **3 lần gửi lại**, tổng cộng **9 lượt**. Đạt khi **100%** lượt giữ nguyên dữ liệu đã nhập và mỗi lượt chỉ tạo đúng **1 phiếu**. |

---

## 6. Bảng truy vết yêu cầu

### 6.1. Yêu cầu chức năng

Test case được viết ở BT3, mỗi tiêu chí chấp nhận tương ứng một test case.

| Mã FR | Yêu cầu chức năng | User story | Tiêu chí chấp nhận | Use case | Business rule | MoSCoW |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR1 | Tra cứu khách qua SĐT đã chuẩn hóa, hiển thị lịch sử thiết bị | US1 | AC1.1-AC1.3 | UC1 | BR-01, BR-02 | MUST |
| FR2 | Tạo hồ sơ khách khi SĐT chưa tồn tại | US2 | AC2.1-AC2.3 | UC2 | BR-01 | SHOULD |
| FR3 | Đăng ký thiết bị cho khách, gồm thiết bị mua ngoài | US3 | AC3.1-AC3.3 | UC3 | BR-03, BR-04, BR-05 | SHOULD |
| FR4 | Lập phiếu mới ở trạng thái MỚI với mã duy nhất | US4 | AC4.1-AC4.3 | UC4 | BR-06, BR-07, BR-08 | MUST |
| FR5 | Tự tính hạn cam kết theo mức ưu tiên và lịch làm việc | US4 | AC4.1 | UC4 bước 5 | BR-09, BR-10 | MUST |
| FR6 | Gắn đúng một nhóm sự cố cho phiếu, chọn từ danh mục cài sẵn | US5 | AC5.1-AC5.2 | UC5 | BR-15, BR-21 | MUST |
| FR7 | Duyệt hình thức bảo hành, danh sách xếp phiếu quá hạn lên trước | US6 | AC6.1-AC6.3 | UC6 | BR-14, BR-17, BR-20 | SHOULD |

BR-16 áp dụng chung cho mọi FR có lưu hoặc ẩn dữ liệu.

### 6.2. Yêu cầu phi chức năng

| Mã NFR | Ảnh hưởng tới | Test case viết ở BT3 |
| :--- | :--- | :--- |
| NFR1 | FR1, FR4 | TC-N1: kiểm thử tải 65.000 hồ sơ với 12 nhân viên đồng thời, từ 1.000 lượt tra cứu trở lên và từ 200 lượt lưu phiếu trở lên; đo phân vị 95, tra cứu không quá 2,0 giây và lưu không quá 3,0 giây |
| NFR2 | FR1, FR4, FR7 | TC-N2: 3 lượt kiểm tra trên 3 màn hình theo vai trò; đạt khi 0/2 lượt của Nhân viên tiếp nhận lộ SĐT đầy đủ và màn hình Quản lý trung tâm hiển thị đầy đủ |
| NFR3 | FR4 | TC-N3: 5 nhân viên mới, mỗi người 3 phiếu; đạt khi từ 80% trở lên có phiếu thứ ba không quá 3,0 phút và 0 lỗi trường bắt buộc |
| NFR4 | FR4 | TC-N4: 3 thời điểm ngắt mạng, mỗi thời điểm 3 lần gửi lại, tổng cộng 9 lượt; đạt khi 100% giữ nguyên dữ liệu và đúng 1 phiếu mỗi lượt |

### 6.3. Đối chiếu quy tắc case study với quy tắc SRS

| Quy tắc case study | Thuộc L2 | Thể hiện ở SRS |
| :--- | :--- | :--- |
| QT-01 | có | BR-01 |
| QT-02 | có | BR-02 |
| QT-03 | có | BR-03, BR-05 |
| QT-04 | có | BR-09, BR-10 |
| QT-05 | có, phủ rộng hơn | BR-14. L2 không tự xác định điều kiện bảo hành; mọi phiếu đều chờ Quản lý trung tâm duyệt, nên trường hợp thiếu ngày mua cũng được phủ |
| QT-06 | có | BR-07 |
| QT-07, QT-08 | không, thuộc L4 | không áp dụng |
| QT-09 | không, thuộc L5 | không áp dụng |
| QT-10 | không, thuộc L8 | không áp dụng |
| QT-11, QT-12 | không, thuộc L9 | không áp dụng |
| QT-13 | có | BR-16 |
| QT-14 | có | BR-17 |
| QT-15 | có | NFR2 |

Quy tắc không lấy từ Mục 9, là quyết định của SRS và cần lý do: BR-06 một phiếu mở cho mỗi thiết bị; BR-08 phần cấp lại số theo năm và không sửa được; BR-14 phần mọi phiếu đều chờ duyệt và phần bắt buộc nhập lý do khi từ chối; BR-15 phần mỗi phiếu gắn đúng một nhóm và danh mục cài sẵn; BR-20 hai nhóm theo hạn cùng thứ tự sắp xếp; BR-21 mức ưu tiên mặc định của nhóm.
