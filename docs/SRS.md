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

Nhân viên tiếp nhận tra cứu khách bằng số điện thoại, ghi nhận thiết bị và mô tả lỗi, gắn nhóm sự cố, chọn mức ưu tiên. Hệ thống tự tính hạn cam kết (SLA) và lưu phiếu ở trạng thái MỚI. Quản lý trung tâm duyệt các phiếu thiếu ngày mua và theo dõi phiếu theo hạn cam kết. Kỹ thuật viên xem được phiếu của trung tâm kèm mã màu hạn.

Thông báo hiển thị bên trong ứng dụng (cảnh báo cho Quản lý trung tâm ở UC6, thông báo cho Nhân viên tiếp nhận ở UC5) thuộc phạm vi.

### 1.3. Ngoài phạm vi (WON'T)

- Phân công kỹ thuật viên, quản lý lịch hẹn (luồng L4).
- Xuất/nhập và tồn kho linh kiện (luồng L5), kể cả việc tạm dừng đồng hồ SLA khi phiếu chờ linh kiện.
- Gửi tin nhắn tự động qua SMS, Zalo hoặc email.
- Khảo sát hài lòng CSAT/NPS (luồng L8).
- Tự động phân loại sự cố bằng học máy (luồng L10). Ở L2, nhân viên tự chọn nhóm sự cố và mức ưu tiên.
- Sửa hoặc hủy phiếu, sửa hồ sơ khách sau khi đã lưu.
- Lịch sử trao đổi với khách theo từng phiếu (ai, khi nào): không thuộc L2.
- Chuyển quyền sở hữu thiết bị từ khách này sang khách khác.

### 1.4. Thuật ngữ

Tên kỹ thuật chỉ xuất hiện trong bảng này; các phần còn lại dùng thuật ngữ nghiệp vụ.

| Thuật ngữ | Định nghĩa | Tên kỹ thuật gợi ý |
| :--- | :--- | :--- |
| Khách hàng | Cá nhân từng mua hàng hoặc dùng dịch vụ tại Mekong Mobile, kể cả khách mang thiết bị mua ngoài đến bảo hành (hồ sơ tạo ở UC3). | `customer` |
| Phân khúc khách hàng | Nhóm khách do bộ phận quản lý CRM phân loại. L2 chỉ hiển thị, không tạo hay sửa; khách mới tạo ở L2 chưa có phân khúc. | `segment` |
| Thiết bị | Một máy cụ thể do khách sở hữu, định danh duy nhất bằng số serial hoặc IMEI. | `device`, `serial_no` |
| Thiết bị mua ngoài | Thiết bị khách mua ở nơi khác, không có trong lịch sử mua hàng nên không có ngày mua. Vẫn được đăng ký và tiếp nhận. | `device.is_external` |
| Phiếu bảo hành | Yêu cầu bảo hành được ghi nhận, có mã duy nhất dạng `BH-xxxxxx/yyyy` (yyyy là năm tiếp nhận) và có vòng đời trạng thái. | `ticket` |
| Trạng thái phiếu | Vị trí của phiếu trong vòng đời xử lý (BR-07). L2 chỉ tạo phiếu ở trạng thái MỚI. | `status` |
| Cờ chờ xác minh bảo hành | Dấu hiệu phiếu chưa xác minh được ngày mua và cần Quản lý trung tâm phê duyệt. Là thuộc tính riêng của phiếu, không phải trạng thái vòng đời. | `is_verified` (false = chờ xác minh) |
| Hình thức phiếu | Bảo hành miễn phí hoặc Sửa chữa có tính phí. Để **chưa xác định** khi phiếu đang chờ xác minh; chỉ chốt sau quyết định của Quản lý trung tâm (BR-14). | `is_warranty` (được phép rỗng) |
| Hạn cam kết (SLA) | Thời điểm chậm nhất phải hoàn thành phiếu, tính từ lúc tiếp nhận theo mức ưu tiên (BR-09, BR-10). | `due_date` |
| Nhóm sự cố | Nhãn phân loại nguyên nhân bảo hành, lấy từ một danh mục dùng chung. Danh mục khởi tạo gồm Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác; nhân viên được thêm nhóm mới (BR-15). | `issue_category` |
| Nhãn phiếu | Các nhóm sự cố được gắn cho một phiếu; một phiếu gắn được nhiều nhóm. | `ticket_issue` |
| Mức ưu tiên | Mức khẩn cấp của phiếu: Cao, Trung bình, Thấp. Quyết định hạn cam kết. | `priority` (`CAO`, `TRUNG_BINH`, `THAP`) |
| Nhật ký trạng thái | Bản ghi mỗi lần phiếu **đổi trạng thái**, kèm người thực hiện, thời điểm và ghi chú (nếu có). Dòng đầu tiên được ghi ngay khi tạo phiếu (BR-07). Quyết định về hình thức bảo hành được lưu trên phiếu, không ghi vào nhật ký này (BR-14). | `ticket_status_log` |

---

## 2. Vai trò người dùng

| Vai trò | Được làm | Không được làm |
| :--- | :--- | :--- |
| Nhân viên tiếp nhận | Tra cứu khách theo SĐT. Tạo hồ sơ khách và thiết bị nếu chưa có. Lập phiếu, gắn nhóm sự cố (kể cả tạo nhóm mới), chọn mức ưu tiên. Xem danh sách phiếu do mình lập trong ngày. | Đổi trạng thái phiếu sang Hoàn tất hoặc Đã đóng. Sửa mã phiếu. Tự quyết định bảo hành miễn phí cho phiếu thiếu ngày mua. Xem SĐT đầy đủ (NFR2). |
| Quản lý trung tâm | Duyệt hoặc từ chối bảo hành miễn phí cho phiếu chờ xác minh. Xem bảng theo dõi hạn cam kết và danh sách phiếu của trung tâm. Xem SĐT đầy đủ. | Xóa vĩnh viễn phiếu hoặc hồ sơ khách (BR-16). Trực tiếp sửa chữa thiết bị. |
| Kỹ thuật viên | Xem danh sách phiếu của trung tâm mình kèm mã màu hạn cam kết. | Tạo phiếu. Sửa thông tin khách hoặc mô tả lỗi ban đầu. Tạo hoặc sửa nhóm sự cố. Xem SĐT đầy đủ. |

Ngoài ba vai trò trên còn có tác nhân hệ thống "tác vụ định kỳ nhắc hạn" (UC6), là thành phần của hệ thống chứ không phải người dùng.

Ban giám đốc không có màn hình riêng trong L2 và không được thêm thành vai trò của luồng này. Quyền của Ban giám đốc theo QT-14 và QT-15 vẫn giữ nguyên trong BR-17 và NFR2, không thu hẹp.

---

## 3. Quy tắc nghiệp vụ

Các quy tắc nghiệp vụ của L2 nằm ở đây; user story và use case chỉ dẫn chiếu tới, không nhắc lại nội dung. Quy tắc của các luồng khác không thuộc phạm vi L2. Ba quy tắc hiện được nêu trong phần mô tả story thay vì ở bảng này: ngưỡng cảnh báo lỗi lặp lại (US11), định nghĩa "trong ngày" (US8) và thứ tự sắp xếp bảng theo dõi (US7). Bảng đối chiếu nguồn ở mục 6.3.

| Mã | Quy tắc | Nội dung |
| :--- | :--- | :--- |
| BR-01 | Duy nhất số điện thoại | SĐT khách là duy nhất trong hệ thống. Nhập số đã có thì hiển thị hồ sơ sẵn có, không tạo hồ sơ mới. |
| BR-02 | Chuẩn hóa số điện thoại | Trước khi kiểm tra và lưu, SĐT được chuẩn hóa về 10 chữ số bắt đầu bằng `0`. Các dạng `+84901234567`, `84901234567`, `090 123 4567`, `090.123.4567` đều thành `0901234567`. Chuỗi không thành 10 chữ số sau chuẩn hóa là sai định dạng. |
| BR-03 | Duy nhất thiết bị | Thiết bị được xác định bằng số serial/IMEI. Một thiết bị chỉ thuộc một khách tại một thời điểm. |
| BR-04 | Thiết bị mua ngoài | Thiết bị không có trong lịch sử mua hàng vẫn được đăng ký cho khách; bắt buộc nhập serial/IMEI và ghi chú nguồn gốc. Ngày mua để rỗng, trừ khi khách xuất trình hóa đơn thì nhân viên nhập ngày mua và nơi mua theo hóa đơn (Mục 6.1 bước 3). Thiết bị được đánh dấu là mua ngoài, không có hồ sơ mua. |
| BR-05 | Xung đột serial/IMEI | Serial/IMEI đang thuộc khách khác thì không được gắn cho khách hiện tại. Nhân viên báo Quản lý trung tâm xử lý ngoài hệ thống, vì L2 không hỗ trợ chuyển quyền sở hữu. |
| BR-06 | Một phiếu mở cho mỗi thiết bị | Một thiết bị chỉ có tối đa một phiếu chưa đạt trạng thái Đã đóng tại một thời điểm. |
| BR-07 | Vòng đời trạng thái | Trạng thái chỉ tiến, không quay lại. L2 chỉ tạo phiếu ở trạng thái MỚI, và khi tạo phải ghi ngay một dòng nhật ký trạng thái (`from_status` rỗng → MỚI, kèm người tạo và thời điểm). Các trạng thái sau MỚI do luồng khác điều khiển nhưng dùng chung một vòng đời (case study Hình 6.2); hủy phiếu (ĐÃ HỦY) và mở lại phiếu đã đóng đều thuộc luồng khác. Mọi lần chuyển trạng thái đều ghi vào nhật ký trạng thái. Cờ chờ xác minh không phải trạng thái. |
| BR-08 | Mã phiếu | Dạng `BH-xxxxxx/yyyy`: xxxxxx là số thứ tự 6 chữ số tăng dần trên toàn hệ thống, bắt đầu lại từ `000001` mỗi năm; yyyy là năm tiếp nhận. Mã không tái sử dụng, không sửa được và vẫn duy nhất khi nhiều người lưu cùng lúc. |
| BR-09 | Tính hạn cam kết | Hạn cam kết tính từ **thời điểm tiếp nhận** (thời điểm hệ thống chấp nhận lưu phiếu lần đầu, tức `received_at`): mức Cao 24 giờ, Trung bình 72 giờ, Thấp 120 giờ (QT-04). |
| BR-10 | Loại trừ Chủ Nhật | Giờ cam kết tính liên tục, nhưng ngày Chủ Nhật không được tính: đồng hồ dừng suốt Chủ Nhật và chạy lại từ 00:00 Thứ Hai. Đồng hồ **không** dừng vì bất kỳ lý do nào khác, kể cả khi phiếu đang chờ linh kiện. Ngày lễ chưa được loại trừ trong L2. Ví dụ ở bảng dưới. |
| BR-11 | Mã màu hạn cam kết | Dựa trên phần trăm thời gian còn lại so với tổng thời gian SLA của phiếu. Xanh: còn từ 25% trở lên. Vàng: còn dưới 25% và lớn hơn 0. Đỏ: đã tới hạn hoặc quá hạn (còn 0% trở xuống). |
| BR-12 | Điều kiện bảo hành | Thiết bị còn bảo hành nếu ngày tiếp nhận không muộn hơn ngày mua cộng số tháng bảo hành (cộng theo tháng lịch). Số tháng bảo hành lấy từ dữ liệu mua hàng của thiết bị. |
| BR-13 | Cờ chờ xác minh | Khi thiết bị không có ngày mua, hệ thống tự gắn cờ chờ xác minh; nhân viên không tự đánh dấu. Phiếu vẫn được tiếp nhận; hình thức phiếu để **chưa xác định** (giá trị rỗng), không mặc định là miễn phí hay tính phí, cho đến khi Quản lý trung tâm quyết định. |
| BR-14 | Quyết định phiếu chờ xác minh | Chỉ Quản lý trung tâm được duyệt hoặc từ chối bảo hành miễn phí. Khi từ chối bắt buộc nhập lý do; hệ thống lưu **trên phiếu** người quyết định, thời điểm và lý do, không ghi vào nhật ký trạng thái. |
| BR-15 | Nhóm sự cố | Nhóm sự cố nằm trong danh mục dùng chung. Nhân viên được thêm nhóm mới; tên nhóm được cắt khoảng trắng đầu cuối và so khớp không phân biệt hoa thường, nên không có hai nhóm trùng tên. Nhóm mới phải vào danh mục trước khi gắn vào phiếu. Mỗi phiếu gắn tối đa 5 nhóm, không gắn một nhóm hai lần. |
| BR-16 | Xóa mềm | Không xóa vĩnh viễn khách hàng, thiết bị, phiếu hay nhóm sự cố; chỉ đánh dấu ẩn để giữ dữ liệu lịch sử. |
| BR-17 | Phạm vi theo trung tâm | Hồ sơ khách hàng và thiết bị dùng chung toàn công ty: nhân viên tiếp nhận tra cứu được khách đã mua ở bất kỳ cửa hàng nào. Riêng **phiếu** thì theo trung tâm: phiếu thuộc trung tâm của tài khoản lập phiếu; Quản lý trung tâm và Kỹ thuật viên chỉ xem phiếu của trung tâm mình; Quản lý trung tâm lọc thêm được theo nhân viên tiếp nhận. Theo QT-14, Quản lý xem được toàn bộ đơn vị mình phụ trách và Ban giám đốc xem được toàn công ty; L2 không xây màn hình riêng cho Ban giám đốc. |

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
| US2 | Nhân viên tiếp nhận | Tạo mới hồ sơ khách hàng | MUST |
| US3 | Nhân viên tiếp nhận | Đăng ký thiết bị cho khách | MUST |
| US4 | Nhân viên tiếp nhận | Lập phiếu bảo hành mới | MUST |
| US5 | Nhân viên tiếp nhận | Gắn nhóm sự cố cho phiếu | MUST |
| US6 | Nhân viên tiếp nhận | Tự động tính hạn cam kết | MUST |
| US7 | Quản lý trung tâm | Bảng theo dõi hạn cam kết của phiếu | MUST |
| US8 | Nhân viên tiếp nhận | Xem và xuất danh sách phiếu tiếp nhận trong ngày | MUST |
| US9 | Nhân viên tiếp nhận | Tự xác định bảo hành miễn phí hay sửa chữa tính phí | SHOULD |
| US10 | Quản lý trung tâm | Duyệt hoặc từ chối bảo hành miễn phí | SHOULD |
| US11 | Nhân viên tiếp nhận | Cảnh báo thiết bị bảo hành nhiều lần cùng một lỗi | COULD |

Có 8 story MUST làm bộ lõi của luồng, 2 story SHOULD và 1 story COULD là phần mở rộng.

### 4.2. Chi tiết user story và tiêu chí chấp nhận

Mỗi tiêu chí chấp nhận (AC) viết theo dạng Given-When-Then và chuyển được trực tiếp thành một test case ở BT3. Thông báo hiển thị cho người dùng được ghi trong dấu ngoặc kép.

#### US1 [MUST] Tra cứu khách hàng qua số điện thoại

Là nhân viên tiếp nhận, tôi muốn tra cứu hồ sơ khách bằng số điện thoại để không phải hỏi lại và nhập lại thông tin khách đã có.

- AC1.1 Tìm thấy khách
  - Given: số điện thoại `0901234567` đã có trong hệ thống.
  - When: nhân viên nhập `0901234567` và tra cứu.
  - Then: hệ thống hiển thị họ tên, SĐT che dạng `090****567`, địa chỉ, phân khúc và danh sách thiết bị đã mua của khách.
- AC1.2 Chưa có hồ sơ
  - Given: số điện thoại `0908777666` không có trong hệ thống.
  - When: nhân viên tra cứu.
  - Then: hệ thống báo "Không tìm thấy thông tin khách hàng" và mở sẵn form tạo khách mới với số điện thoại đã điền.
- AC1.3 Sai định dạng
  - Given: nhân viên nhập `090123`, không thành đúng 10 chữ số sau chuẩn hóa.
  - When: nhân viên tra cứu.
  - Then: hệ thống từ chối tìm kiếm, báo "Số điện thoại phải gồm đúng 10 chữ số (dạng 0xxxxxxxxx)" và giữ nguyên nội dung đã nhập.
- AC1.4 Số cần chuẩn hóa
  - Given: nhân viên nhập `+84 901 234 567`.
  - When: nhân viên tra cứu.
  - Then: hệ thống chuẩn hóa thành `0901234567` và hiển thị kết quả như AC1.1 (BR-02).

#### US2 [MUST] Tạo mới hồ sơ khách hàng

Là nhân viên tiếp nhận, tôi muốn tạo hồ sơ khách ngay trên màn hình tiếp nhận khi số điện thoại chưa có để lập tiếp phiếu mà không bị ngắt quãng.

Họ tên là trường bắt buộc; địa chỉ không bắt buộc.

- AC2.1 Tạo thành công
  - Given: số điện thoại `0988777666` chưa có trong hệ thống.
  - When: nhân viên nhập họ tên "Nguyễn Văn A" và lưu khách hàng.
  - Then: hệ thống lưu hồ sơ (chưa có phân khúc) và tự điền khách vừa tạo vào form lập phiếu.
- AC2.2 Trùng số điện thoại khi lưu đồng thời
  - Given: số `0988777666` vừa được nhân viên khác tạo.
  - When: nhân viên lưu khách hàng.
  - Then: hệ thống chặn tạo trùng (BR-01), báo "Số điện thoại đã tồn tại trên hệ thống" và nạp hồ sơ đã có.
- AC2.3 Thiếu họ tên
  - Given: nhân viên để trống họ tên.
  - When: nhân viên lưu khách hàng.
  - Then: hệ thống từ chối lưu, đánh dấu trường thiếu và báo "Vui lòng nhập Họ tên khách hàng".

#### US3 [MUST] Đăng ký thiết bị cho khách

Là nhân viên tiếp nhận, tôi muốn chọn thiết bị từ lịch sử mua hàng của khách hoặc đăng ký thiết bị mua ngoài để ghi nhận đúng máy khách mang đến.

- AC3.1 Chọn thiết bị đã mua
  - Given: khách đã được chọn và thiết bị `SN-PHONE-123` nằm trong lịch sử mua hàng của khách.
  - When: nhân viên chọn thiết bị đó.
  - Then: hệ thống tự điền serial/IMEI, ngày mua và số tháng bảo hành.
- AC3.2 Thiết bị mua ngoài
  - Given: thiết bị khách mang đến không nằm trong lịch sử mua hàng.
  - When: nhân viên nhập serial/IMEI `SN-EXT-999` kèm ghi chú nguồn gốc rồi lưu phiếu.
  - Then: hệ thống tạo hồ sơ thiết bị mới cho khách và đánh dấu là mua ngoài, không có hồ sơ mua (BR-04).
- AC3.3 Serial thuộc khách khác
  - Given: serial `SN-PHONE-123` đang thuộc khách khác.
  - When: nhân viên gắn thiết bị đó vào khách hiện tại.
  - Then: hệ thống từ chối (BR-05) và báo nhân viên chuyển Quản lý trung tâm xử lý.
- AC3.4 Thiết bị đang có phiếu mở
  - Given: thiết bị `SN-PHONE-123` đang có một phiếu chưa đạt trạng thái Đã đóng.
  - When: nhân viên chọn thiết bị đó.
  - Then: hệ thống hiển thị mã phiếu đang mở và không cho tạo phiếu thứ hai (BR-06).
- AC3.5 Thiếu serial
  - Given: nhân viên đăng ký thiết bị mua ngoài nhưng để trống serial/IMEI.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống từ chối và báo "Số serial/IMEI là trường bắt buộc".
- AC3.6 Khách xuất trình hóa đơn
  - Given: thiết bị không có trong lịch sử mua hàng, nhưng khách có hóa đơn mua ở nơi khác.
  - When: nhân viên nhập ngày mua và nơi mua theo hóa đơn rồi lưu phiếu.
  - Then: hệ thống lưu ngày mua đó cho thiết bị, xác định điều kiện bảo hành theo ngày mua vừa nhập (BR-12) và không gắn cờ chờ xác minh (BR-13).

#### US4 [MUST] Lập phiếu bảo hành mới

Là nhân viên tiếp nhận, tôi muốn lập phiếu bảo hành cho thiết bị của khách, chọn mức ưu tiên và cấp mã phiếu ngay tại quầy để khách có căn cứ theo dõi máy của mình.

- AC4.1 Lập phiếu thành công
  - Given: khách và thiết bị đã được chọn.
  - When: nhân viên nhập mô tả lỗi "Màn hình chớp tắt khi sạc" và lưu phiếu.
  - Then: hệ thống sinh mã duy nhất dạng `BH-000123/2026` (BR-08), lưu phiếu ở trạng thái MỚI (BR-07) và báo lập phiếu thành công kèm mã phiếu.
- AC4.2 Mất kết nối khi lưu
  - Given: kết nối bị mất giữa lúc lưu phiếu.
  - When: nhân viên thử lưu lại, một hoặc nhiều lần.
  - Then: hệ thống giữ nguyên dữ liệu đã nhập và chỉ tạo đúng một phiếu.
- AC4.3 Thiếu mô tả lỗi
  - Given: nhân viên để trống mô tả lỗi.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống từ chối, đánh dấu ô mô tả và báo "Mô tả lỗi do khách kể là trường bắt buộc".
- AC4.4 Thiếu nhóm sự cố hoặc mức ưu tiên
  - Given: nhân viên chưa gắn nhóm sự cố hoặc chưa chọn mức ưu tiên.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống không cho lưu và yêu cầu chọn cả hai, vì mức ưu tiên là đầu vào của hạn cam kết (BR-09).
- AC4.5 Ghi phụ kiện kèm theo và tình trạng ngoại quan
  - Given: khách gửi kèm sạc và tai nghe, máy bị trầy ở góc.
  - When: nhân viên ghi phụ kiện kèm theo (Sạc / Tai nghe / Hộp / Khác) và tình trạng ngoại quan của máy.
  - Then: hệ thống lưu hai thông tin này trên phiếu và in ra ở phiếu nhận máy; cả hai đều không bắt buộc.

#### US5 [MUST] Gắn nhóm sự cố cho phiếu

Là nhân viên tiếp nhận, tôi muốn gắn một hoặc nhiều nhóm sự cố cho phiếu, và tạo nhóm mới khi sự cố chưa có trong danh mục, để phân loại đúng ngay lúc tiếp nhận và lọc phiếu theo nhóm về sau.

- AC5.1 Gắn nhóm có sẵn
  - Given: phiếu đang được lập và danh mục có nhóm Pin.
  - When: nhân viên chọn nhóm Pin.
  - Then: hệ thống gắn nhãn Pin cho phiếu và hiển thị trên phiếu.
- AC5.2 Tạo nhóm mới
  - Given: sự cố "vỡ kính" chưa có nhóm tương ứng trong danh mục.
  - When: nhân viên nhập tên nhóm "Vỡ kính" và xác nhận tạo.
  - Then: hệ thống thêm "Vỡ kính" vào danh mục dùng chung trước, rồi gắn vào phiếu; về sau lọc theo "Vỡ kính" tìm ra phiếu này.
- AC5.3 Nhóm trùng tên
  - Given: phiếu đã gắn nhóm Pin.
  - When: nhân viên gắn tiếp "pin" (khác hoa thường).
  - Then: hệ thống nhận ra là cùng một nhóm và phiếu chỉ giữ một nhãn Pin (BR-15).
- AC5.4 Vượt số nhãn tối đa
  - Given: phiếu đã có 5 nhóm sự cố.
  - When: nhân viên gắn nhóm thứ 6.
  - Then: hệ thống từ chối và báo phiếu đã đạt số nhãn tối đa (BR-15).

#### US6 [MUST] Tự động tính hạn cam kết

Là nhân viên tiếp nhận, tôi muốn hệ thống tự tính hạn cam kết theo mức ưu tiên và lịch làm việc để hẹn đúng thời gian trả máy cho khách mà không phải tính tay.

- AC6.1 Trong tuần
  - Given: phiếu mức Cao tạo lúc 09:00 Thứ Hai.
  - When: phiếu được lưu thành công.
  - Then: hạn cam kết là 09:00 Thứ Ba cùng tuần.
- AC6.2 Vượt Chủ Nhật
  - Given: phiếu mức Cao tạo lúc 15:00 Thứ Bảy.
  - When: phiếu được lưu thành công.
  - Then: hạn cam kết là 15:00 Thứ Hai tuần kế tiếp, vì Chủ Nhật không được tính (BR-10).
- AC6.3 Mức Trung bình
  - Given: phiếu mức Trung bình (72 giờ) tạo lúc 10:00 Thứ Sáu.
  - When: phiếu được lưu thành công.
  - Then: hạn cam kết là 10:00 Thứ Ba tuần sau.
- AC6.4 Mức Thấp
  - Given: phiếu mức Thấp (120 giờ) tạo lúc 09:00 Thứ Tư.
  - When: phiếu được lưu thành công.
  - Then: hạn cam kết là 09:00 Thứ Ba tuần sau.

#### US7 [MUST] Bảng theo dõi hạn cam kết của phiếu

Là Quản lý trung tâm, tôi muốn mở bảng theo dõi các phiếu của trung tâm kèm mã màu hạn cam kết để ưu tiên xử lý phiếu sắp trễ trước khi vi phạm cam kết với khách.

Phần mở rộng đã khai báo: Kỹ thuật viên xem cùng bảng ở chế độ chỉ đọc và không nhận cảnh báo quá hạn (AC7.5, BR-17).

Bảng liệt kê các phiếu **chưa đạt trạng thái Hoàn tất** của trung tâm, xếp Đỏ trước, rồi Vàng, rồi Xanh. Phiếu đã Hoàn tất nhưng khách chưa đến lấy máy không còn bị tính hạn và không còn trên bảng.

- AC7.1 Mã màu
  - Given: ba phiếu có thời gian SLA còn lại lần lượt là 60%, 10% và đã quá hạn.
  - When: Quản lý trung tâm mở bảng theo dõi.
  - Then: ba phiếu hiển thị lần lượt màu Xanh, Vàng và Đỏ (BR-11).
- AC7.2 Không có phiếu
  - Given: trung tâm không có phiếu nào chưa hoàn tất.
  - When: Quản lý trung tâm mở bảng theo dõi.
  - Then: hệ thống hiển thị bảng trống kèm "Trung tâm hiện không có phiếu nào đang xử lý".
- AC7.3 Lọc theo nhân viên
  - Given: Quản lý trung tâm đang xem bảng của trung tâm mình.
  - When: Quản lý trung tâm lọc theo một nhân viên tiếp nhận.
  - Then: bảng chỉ còn phiếu do nhân viên đó lập trong trung tâm (BR-17).
- AC7.4 Cảnh báo quá hạn
  - Given: một phiếu vừa chuyển sang màu Đỏ.
  - When: tác vụ định kỳ nhắc hạn chạy kiểm tra.
  - Then: hệ thống hiển thị cảnh báo phiếu quá hạn trên màn hình của Quản lý trung tâm.
- AC7.5 Góc nhìn Kỹ thuật viên
  - Given: Kỹ thuật viên mở bảng theo dõi.
  - When: bảng hiển thị.
  - Then: chỉ có phiếu của trung tâm mình kèm mã màu, và không có cảnh báo quá hạn (BR-17).

#### US8 [MUST] Xem và xuất danh sách phiếu tiếp nhận trong ngày

Là nhân viên tiếp nhận, tôi muốn xem và in danh sách phiếu do mình lập trong ngày để rà soát thông tin và bàn giao cho Quản lý trung tâm.

Phần mở rộng đã khai báo: Quản lý trung tâm xem được danh sách của cả trung tâm và lọc theo nhân viên tiếp nhận (AC8.4, BR-17).

"Trong ngày" là từ 00:00 đến 23:59 của ngày hiện tại theo giờ Việt Nam.

- AC8.1 Có phiếu
  - Given: nhân viên đã tạo 5 phiếu trong ngày hôm nay.
  - When: nhân viên mở danh sách phiếu tiếp nhận trong ngày.
  - Then: hệ thống hiển thị đúng 5 phiếu, mới nhất lên đầu.
- AC8.2 Chưa có phiếu
  - Given: nhân viên chưa tạo phiếu nào trong ngày.
  - When: nhân viên mở danh sách.
  - Then: hệ thống hiển thị bảng trống kèm "Chưa có phiếu bảo hành nào được ghi nhận trong ngày hôm nay".
- AC8.3 In và xuất file
  - Given: danh sách trong ngày đang hiển thị.
  - When: nhân viên chọn in danh sách bàn giao hoặc xuất Excel.
  - Then: bản in hoặc file có đủ các cột của bảng và SĐT khách hiển thị theo quyền của người dùng (NFR2).
- AC8.4 Góc nhìn Quản lý trung tâm
  - Given: Quản lý trung tâm mở danh sách trong ngày.
  - When: danh sách hiển thị.
  - Then: Quản lý trung tâm thấy phiếu của cả trung tâm và lọc được theo nhân viên (BR-17).

#### US9 [SHOULD] Tự xác định bảo hành miễn phí hay sửa chữa tính phí

Là nhân viên tiếp nhận, tôi muốn hệ thống tự xác định thiết bị còn hay hết hạn bảo hành để báo đúng chi phí cho khách ngay khi tiếp nhận, và vẫn nhận được máy khi thiếu ngày mua.

- AC9.1 Còn bảo hành
  - Given: thiết bị có ngày mua và ngày tiếp nhận nằm trong thời hạn bảo hành.
  - When: nhân viên lưu phiếu.
  - Then: hình thức phiếu là Bảo hành miễn phí và không gắn cờ chờ xác minh (BR-12).
- AC9.2 Hết bảo hành
  - Given: thiết bị có ngày mua nhưng ngày tiếp nhận đã quá thời hạn bảo hành.
  - When: nhân viên lưu phiếu.
  - Then: hình thức phiếu là Sửa chữa có tính phí và hệ thống nhắc nhân viên báo chi phí cho khách.
- AC9.3 Thiếu ngày mua
  - Given: thiết bị không có ngày mua trong hệ thống, ví dụ thiết bị mua ngoài.
  - When: nhân viên lưu phiếu.
  - Then: hệ thống vẫn lưu phiếu, tự gắn cờ chờ xác minh (BR-13) và đưa phiếu vào danh sách chờ Quản lý trung tâm quyết định.
- AC9.4 Đúng ngày hết hạn
  - Given: ngày tiếp nhận đúng bằng ngày mua cộng số tháng bảo hành.
  - When: nhân viên lưu phiếu.
  - Then: hình thức phiếu là Bảo hành miễn phí, vì điều kiện còn bảo hành là nhỏ hơn hoặc bằng (BR-12).

#### US10 [SHOULD] Duyệt hoặc từ chối bảo hành miễn phí

Là Quản lý trung tâm, tôi muốn xem xét và quyết định các phiếu thiếu ngày mua để chốt được trường hợp đủ điều kiện, và có lý do rõ ràng khi từ chối.

- AC10.1 Duyệt
  - Given: phiếu đang chờ xác minh.
  - When: Quản lý trung tâm mở chi tiết phiếu và duyệt bảo hành miễn phí.
  - Then: hệ thống bỏ cờ chờ xác minh, ghi hình thức Bảo hành miễn phí, lưu người duyệt và thời điểm duyệt, rồi đưa phiếu sang luồng xử lý chuẩn.
- AC10.2 Từ chối kèm lý do
  - Given: phiếu đang chờ xác minh.
  - When: Quản lý trung tâm từ chối bảo hành miễn phí và nhập lý do.
  - Then: hệ thống chuyển hình thức sang Sửa chữa có tính phí, lưu lý do cùng người quyết định và thời điểm trên phiếu, rồi thông báo cho nhân viên đã lập phiếu.
- AC10.3 Từ chối thiếu lý do
  - Given: Quản lý trung tâm chọn từ chối nhưng để trống lý do.
  - When: Quản lý trung tâm xác nhận.
  - Then: hệ thống không lưu quyết định và yêu cầu nhập lý do (BR-14).

#### US11 [COULD] Cảnh báo thiết bị bảo hành nhiều lần cùng một lỗi

Là nhân viên tiếp nhận, tôi muốn được cảnh báo khi thiết bị đã bảo hành nhiều lần cùng một lỗi để kịp báo Quản lý trung tâm kiểm tra lô hàng.

Ngưỡng: phiếu đang lập là **lần thứ 3 trở đi** cùng một nhóm sự cố trên thiết bị, tức thiết bị đã có từ 2 phiếu trước đó cùng nhóm. Hệ thống kiểm tra sau khi nhóm sự cố của phiếu mới được gắn.

- AC11.1 Đạt ngưỡng
  - Given: thiết bị `SN-PHONE-123` đã có 2 phiếu trước đó cùng nhóm Màn hình.
  - When: nhân viên gắn nhóm Màn hình cho phiếu mới, tức lần thứ 3.
  - Then: hệ thống hiển thị cảnh báo "Thiết bị đã bảo hành lỗi Màn hình 2 lần. Đây là lần thứ 3 - cần báo Quản lý trung tâm xem xét." và nhân viên vẫn tiếp tục lập phiếu được.
- AC11.2 Chưa đạt ngưỡng
  - Given: thiết bị chỉ có 1 phiếu trước đó cùng nhóm.
  - When: nhân viên gắn nhóm đó cho phiếu mới, tức lần thứ 2.
  - Then: hệ thống không hiển thị cảnh báo.
- AC11.3 Không tải được lịch sử
  - Given: hệ thống không tải được lịch sử bảo hành của thiết bị do lỗi kết nối.
  - When: nhân viên gắn nhóm sự cố.
  - Then: hệ thống báo "Chưa tải được lịch sử bảo hành của thiết bị này", bỏ qua cảnh báo và cho tiếp tục lập phiếu.

### 4.3. Đặc tả use case

Có bảy use case UC1 đến UC7. UC1 và UC4 được UC2 gọi vào (include), không phải mục tiêu độc lập của người dùng. Thông báo và dữ liệu mẫu nằm ở tiêu chí chấp nhận nên use case chỉ dẫn chiếu tới.

#### UC1. Tra cứu khách hàng theo số điện thoại

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: tra cứu hồ sơ khách và lịch sử mua thiết bị theo số điện thoại đã chuẩn hóa.
- Điều kiện trước: đã đăng nhập, đang ở màn hình tiếp nhận.
- Điều kiện sau: thông tin khách và danh sách thiết bị đã mua được hiển thị.
- Liên quan: US1 | MUST

Luồng chính
1. Nhân viên nhập số điện thoại.
2. Hệ thống chuẩn hóa và kiểm tra số theo BR-02.
3. Hệ thống hiển thị họ tên, SĐT che, địa chỉ, phân khúc và danh sách thiết bị đã mua.

Luồng ngoại lệ
- 2a. Số sai định dạng: hệ thống từ chối tìm kiếm và giữ nguyên nội dung đã nhập (AC1.3).
- 3a. Số chưa có trong hệ thống: hệ thống báo không tìm thấy và mở form tạo khách mới (AC1.2). `[extend UC3]`

#### UC2. Lập phiếu bảo hành mới

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: ghi nhận một yêu cầu bảo hành để theo dõi đến khi đóng.
- Điều kiện trước: đã đăng nhập và có quyền tiếp nhận.
- Điều kiện sau: một phiếu ở trạng thái MỚI được lưu, có mã duy nhất, hạn cam kết, và có hình thức phiếu hoặc cờ chờ xác minh.
- Liên quan: US1, US2, US3, US4, US5, US6, US9, US11 | MUST

Luồng chính
1. Nhân viên chọn lập phiếu bảo hành mới.
2. Nhân viên nhập số điện thoại khách.
3. Hệ thống tra cứu và hiển thị khách cùng lịch sử mua hàng. `[include UC1]`
4. Nhân viên chọn thiết bị từ danh sách đã mua, hoặc đăng ký thiết bị mua ngoài.
5. Nhân viên nhập mô tả lỗi và đính kèm ảnh nếu có.
6. Nhân viên gắn một hoặc nhiều nhóm sự cố. `[include UC4]`
7. Nhân viên chọn mức ưu tiên và lưu phiếu.
8. Hệ thống xác định điều kiện bảo hành (BR-12, BR-13), sinh mã phiếu (BR-08), tính hạn cam kết (BR-09, BR-10), lưu phiếu ở trạng thái MỚI và hiển thị mã phiếu.

Luồng ngoại lệ
- 3a. Khách chưa có trong hệ thống: mở form tạo khách mới (UC3); sau khi lưu khách, quay lại bước 4. `[extend UC3]`
- 4a. Thiết bị không nằm trong lịch sử mua hàng: nhân viên đăng ký thiết bị mua ngoài với serial/IMEI và ghi chú nguồn gốc (BR-04); nếu khách có hóa đơn thì nhập thêm ngày mua và nơi mua (AC3.6). Không có ngày mua thì hệ thống tự gắn cờ chờ xác minh (BR-13). Thiếu serial thì xem AC3.5.
- 4b. Serial thuộc khách khác: hệ thống từ chối gắn (AC3.3).
- 4c. Thiết bị đang có phiếu mở: hệ thống hiển thị phiếu đó và không cho tạo phiếu thứ hai (AC3.4).
- 5a. Mô tả lỗi để trống: hệ thống từ chối lưu, dữ liệu đã nhập được giữ lại (AC4.3).
- 6a. Nhóm sự cố chưa có trong danh mục: xử lý theo UC4, ngoại lệ 2a.
- 6b. Thiết bị đạt ngưỡng lỗi lặp lại: hệ thống hiển thị cảnh báo, nhân viên vẫn tiếp tục được (AC11.1).
- 6c. Không tải được lịch sử bảo hành: hệ thống bỏ qua cảnh báo và cho tiếp tục (AC11.3).
- 7a. Chưa gắn nhóm sự cố hoặc chưa chọn mức ưu tiên: hệ thống không cho lưu (AC4.4).
- 8a. Mất kết nối khi lưu: hệ thống giữ dữ liệu đã nhập; thử lại không tạo phiếu trùng (AC4.2).

#### UC3. Tạo khách hàng mới

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: tạo hồ sơ khách mới để tiếp tục lập phiếu mà không bị ngắt quãng.
- Điều kiện trước: tra cứu ở UC1 hoặc UC2 không tìm thấy số điện thoại.
- Điều kiện sau: hồ sơ khách mới được lưu (chưa có phân khúc) và gắn vào form lập phiếu.
- Liên quan: US2 | MUST

Luồng chính
1. Hệ thống mở form tạo khách với số điện thoại điền sẵn.
2. Nhân viên nhập họ tên, địa chỉ (nếu có) và lưu.
3. Hệ thống kiểm tra tính duy nhất của số điện thoại (BR-01), lưu hồ sơ và đưa khách vào form lập phiếu (UC2).

Luồng ngoại lệ
- 2a. Thiếu họ tên: hệ thống từ chối lưu (AC2.3).
- 3a. Trùng số điện thoại khi lưu đồng thời: hệ thống không tạo trùng và nạp hồ sơ đã có (AC2.2).

#### UC4. Gắn nhóm sự cố cho phiếu

- Actor chính: Nhân viên tiếp nhận
- Mục tiêu: phân loại phiếu theo một hoặc nhiều nhóm sự cố để theo dõi và lọc về sau.
- Điều kiện trước: đã nhập mô tả lỗi ở bước 5 của UC2.
- Điều kiện sau: phiếu có một hoặc nhiều nhóm sự cố; nhóm mới (nếu có) đã vào danh mục dùng chung.
- Liên quan: US5 | MUST

Luồng chính
1. Hệ thống hiển thị danh mục nhóm sự cố dùng chung.
2. Nhân viên chọn một hoặc nhiều nhóm phù hợp với mô tả lỗi.
3. Hệ thống gắn các nhóm đã chọn cho phiếu.

Luồng ngoại lệ
- 2a. Không có nhóm nào phù hợp: nhân viên nhập tên nhóm mới; hệ thống thêm vào danh mục trước rồi gắn vào phiếu (AC5.2, BR-15).
- 2b. Nhóm trùng tên khác hoa thường: hệ thống chỉ giữ một nhãn (AC5.3).
- 2c. Phiếu đã đủ 5 nhãn: hệ thống từ chối gắn thêm (AC5.4).

#### UC5. Duyệt hoặc từ chối bảo hành miễn phí

- Actor chính: Quản lý trung tâm
- Mục tiêu: quyết định điều kiện bảo hành miễn phí cho các phiếu thiếu ngày mua.
- Điều kiện trước: đã đăng nhập và có phiếu đang chờ xác minh.
- Điều kiện sau: phiếu được xác nhận bảo hành miễn phí, hoặc chuyển sang sửa chữa có tính phí kèm lý do.
- Liên quan: US9, US10 | SHOULD

Luồng chính
1. Quản lý trung tâm mở danh sách phiếu chờ xác minh.
2. Quản lý trung tâm chọn một phiếu để xem thiết bị, mô tả lỗi và ghi chú nguồn gốc.
3. Quản lý trung tâm duyệt bảo hành miễn phí.
4. Hệ thống bỏ cờ chờ xác minh, ghi hình thức Bảo hành miễn phí, lưu người duyệt và thời điểm duyệt **trên phiếu**, rồi đưa phiếu sang luồng xử lý chuẩn (AC10.1).

Luồng ngoại lệ
- 3a. Thiết bị không đủ điều kiện: Quản lý trung tâm từ chối và nhập lý do; hệ thống chuyển sang Sửa chữa có tính phí, ghi lý do trên phiếu và thông báo cho nhân viên đã lập phiếu (AC10.2).
- 3b. Từ chối nhưng thiếu lý do: hệ thống không lưu quyết định (AC10.3, BR-14).

#### UC6. Theo dõi hạn cam kết

- Actor chính: Quản lý trung tâm, Kỹ thuật viên
- Tác nhân hệ thống: tác vụ định kỳ nhắc hạn
- Mục tiêu: theo dõi hạn cam kết và cảnh báo các phiếu có nguy cơ vi phạm.
- Điều kiện trước: phiếu đã được tạo và có hạn cam kết.
- Điều kiện sau: mỗi phiếu chưa hoàn tất hiển thị mã màu; phiếu quá hạn được cảnh báo cho Quản lý trung tâm.
- Liên quan: US7 | MUST

Luồng chính
1. Quản lý trung tâm hoặc Kỹ thuật viên mở bảng theo dõi phiếu của trung tâm mình.
2. Hệ thống tính thời gian còn lại đến hạn của từng phiếu chưa đạt trạng thái Hoàn tất.
3. Hệ thống hiển thị mã màu theo BR-11.
4. Quản lý trung tâm lọc theo nhân viên tiếp nhận nếu cần.
5. Tác vụ định kỳ nhắc hạn phát cảnh báo trên màn hình Quản lý trung tâm cho các phiếu chuyển sang Đỏ (AC7.4).

Luồng ngoại lệ
- 1a. Kỹ thuật viên mở bảng: chỉ thấy phiếu của trung tâm mình và không có cảnh báo quá hạn (AC7.5).
- 3a. Trung tâm không có phiếu nào chưa hoàn tất: hiển thị bảng trống (AC7.2).

#### UC7. Xem danh sách phiếu tiếp nhận trong ngày

- Actor chính: Nhân viên tiếp nhận, Quản lý trung tâm
- Mục tiêu: lấy danh sách phiếu lập trong ngày để rà soát và bàn giao.
- Điều kiện trước: đã đăng nhập.
- Điều kiện sau: danh sách phiếu trong ngày được hiển thị, có thể in hoặc xuất file.
- Liên quan: US8 | MUST

Luồng chính
1. Người dùng mở danh sách phiếu tiếp nhận trong ngày.
2. Hệ thống lọc phiếu tạo trong ngày hiện tại: nhân viên tiếp nhận chỉ thấy phiếu của mình; Quản lý trung tâm thấy phiếu của cả trung tâm và lọc được theo nhân viên (BR-17).
3. Hệ thống hiển thị mã phiếu, thời gian tạo, khách hàng, thiết bị và trạng thái hạn cam kết.
4. Người dùng chọn in danh sách bàn giao hoặc xuất Excel.
5. Hệ thống tạo bản in hoặc file, SĐT hiển thị theo quyền của người dùng (NFR2).

Luồng ngoại lệ
- 2a. Chưa có phiếu nào (kể cả khi đã lọc theo nhân viên): hiển thị bảng trống (AC8.2).

---

## 5. Yêu cầu phi chức năng

| Mã | Loại | Yêu cầu | Cách đo |
| :--- | :--- | :--- | :--- |
| NFR1 | Hiệu năng | Tra cứu khách theo số điện thoại trả kết quả dưới **2,0 giây ở phân vị 95** và không quá **4,0 giây** ở trường hợp chậm nhất; lưu phiếu (kèm khách và thiết bị mới nếu có) dưới **3,0 giây ở phân vị 95**. | Kiểm thử tải ở quy mô hiện tại: **65.000 hồ sơ khách**, **12 nhân viên tiếp nhận thao tác đồng thời**, tối thiểu **1.000 lượt tra cứu** và **200 lượt lưu phiếu**; đo phân vị 95 trên phần cứng tối thiểu RAM 8 GB. |
| NFR2 | Bảo mật | SĐT khách hiển thị ở dạng che 4 chữ số giữa (ví dụ `090****567`) trên mọi màn hình, bản in và file xuất. Theo QT-15, chỉ **Quản lý và Ban giám đốc** xem được đầy đủ; L2 không có màn hình riêng cho Ban giám đốc. Ô nhập do người dùng tự gõ không bị che. | **3 vai trò × 4 màn hình chính** (tra cứu khách, lập phiếu, bảng theo dõi hạn cam kết, danh sách trong ngày) + **1 bản in** + **1 file xuất** = **14 lượt kiểm tra** trên dữ liệu 65.000 hồ sơ khách. Đạt khi **0/14** lượt lộ SĐT đầy đủ ngoài vai trò Quản lý, và **4/4** màn hình của Quản lý hiển thị đầy đủ. |
| NFR3 | Dễ sử dụng | Nhân viên tiếp nhận mới, sau **15 phút** hướng dẫn, tự lập một phiếu chuẩn trong **dưới 3,0 phút** mà không cần hỗ trợ; thao tác bàn giao cuối ngày (in hoặc xuất danh sách) trong **dưới 2 phút**, thay cho **40 phút** chép Excel hiện tại (Mục 6.1 bước 13). | **5 nhân viên mới**, mỗi người lập **3 phiếu liên tiếp**; đạt khi **≥ 80% (4/5)** có phiếu thứ ba dưới 3,0 phút và **0 lỗi** ở các trường bắt buộc; đo riêng thời gian bàn giao cuối ngày. |
| NFR4 | Tin cậy | Lưu phiếu (kèm khách và thiết bị mới nếu có) thành công toàn bộ hoặc không lưu gì. Khi mất kết nối, form giữ lại dữ liệu đã nhập. Gửi lại cùng một yêu cầu lưu từ hai lần trở lên chỉ tạo đúng một phiếu. | Ngắt mạng tại **3 thời điểm** (trước khi gửi · trong khi gửi · sau khi máy chủ xử lý nhưng chưa phản hồi) × **3 lần gửi lại** = **9 lượt**; đạt khi **100%** lượt giữ nguyên dữ liệu đã nhập và mỗi lượt chỉ tạo đúng **1 phiếu**. |

---

## 6. Bảng truy vết yêu cầu

### 6.1. Yêu cầu chức năng

Test case được viết ở BT3, mỗi tiêu chí chấp nhận tương ứng một test case.

| Mã FR | Yêu cầu chức năng | User story | Tiêu chí chấp nhận | Use case | Business rule | MoSCoW |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR1 | Tra cứu khách qua SĐT đã chuẩn hóa, hiển thị lịch sử thiết bị | US1 | AC1.1-AC1.4 | UC1 | BR-01, BR-02 | MUST |
| FR2 | Tạo hồ sơ khách khi SĐT chưa tồn tại | US2 | AC2.1-AC2.3 | UC3 | BR-01 | MUST |
| FR3 | Đăng ký thiết bị cho khách, gồm thiết bị mua ngoài | US3 | AC3.1-AC3.6 | UC2 (bước 4) | BR-03, BR-04, BR-05, BR-06 | MUST |
| FR4 | Lập phiếu mới ở trạng thái MỚI với mã duy nhất | US4 | AC4.1-AC4.5 | UC2 | BR-07, BR-08, BR-09 | MUST |
| FR5 | Gắn một hoặc nhiều nhóm sự cố, tạo nhóm mới | US5 | AC5.1-AC5.4 | UC4 (bước 6 của UC2) | BR-15 | MUST |
| FR6 | Tự tính hạn cam kết theo mức ưu tiên và lịch làm việc | US6 | AC6.1-AC6.4 | UC2 (bước 8) | BR-09, BR-10 | MUST |
| FR7 | Hiển thị hạn cam kết bằng mã màu, cảnh báo phiếu quá hạn | US7 | AC7.1-AC7.5 | UC6 | BR-11, BR-17 | MUST |
| FR8 | Xem, in và xuất danh sách phiếu trong ngày | US8 | AC8.1-AC8.4 | UC7 | BR-17 | MUST |
| FR9 | Tự xác định hình thức bảo hành miễn phí hoặc tính phí | US9 | AC9.1-AC9.4 | UC2 (bước 8) | BR-12, BR-13 | SHOULD |
| FR10 | Duyệt hoặc từ chối bảo hành miễn phí cho phiếu chờ xác minh | US10 | AC10.1-AC10.3 | UC5 | BR-13, BR-14 | SHOULD |
| FR11 | Cảnh báo khi thiết bị có từ 3 phiếu trước cùng nhóm lỗi | US11 | AC11.1-AC11.3 | UC2 (6b, 6c) | — | COULD |

BR-16 (xóa mềm) áp dụng chung cho mọi FR có lưu hoặc ẩn dữ liệu.

### 6.2. Yêu cầu phi chức năng

| Mã NFR | Ảnh hưởng tới | Test case (viết ở BT3) |
| :--- | :--- | :--- |
| NFR1 | FR1, FR4 | TC-N1: kiểm thử tải 65.000 hồ sơ với 12 nhân viên đồng thời, ≥1.000 lượt tra cứu và ≥200 lượt lưu phiếu; đo phân vị 95 (≤2,0 s tra cứu, ≤3,0 s lưu) |
| NFR2 | FR1, FR4, FR7, FR8 | TC-N2: 14 lượt kiểm tra (3 vai trò × 4 màn hình + 1 bản in + 1 file xuất); đạt khi 0 lượt lộ SĐT đầy đủ ngoài vai trò Quản lý |
| NFR3 | FR4, FR8 | TC-N3: 5 nhân viên mới × 3 phiếu; đạt khi ≥80% có phiếu thứ ba ≤3,0 phút và 0 lỗi trường bắt buộc; đo thao tác bàn giao cuối ngày ≤2 phút |
| NFR4 | FR4 | TC-N4: 3 thời điểm ngắt mạng × 3 lần gửi lại = 9 lượt; đạt khi 100% giữ nguyên dữ liệu và đúng 1 phiếu mỗi lượt |

### 6.3. Đối chiếu quy tắc case study với quy tắc SRS

| Quy tắc case study | Thuộc L2 | Thể hiện ở SRS |
| :--- | :--- | :--- |
| QT-01 | có | BR-01 |
| QT-02 | có | BR-02 |
| QT-03 | có | BR-03, BR-05 |
| QT-04 | có | BR-09, BR-10 |
| QT-05 | có (chỉ L2) | BR-12, BR-13, BR-14 |
| QT-06 | có | BR-07 |
| QT-07, QT-08 | không (L4) | không áp dụng |
| QT-09 | không (L5) | không áp dụng |
| QT-10 | không (L8) | không áp dụng |
| QT-11, QT-12 | không (L9) | không áp dụng |
| QT-13 | có | BR-16 |
| QT-14 | có | BR-17 |
| QT-15 | có | NFR2 |

Quy tắc không lấy từ Mục 9, là quyết định của SRS và cần lý do: BR-06 (một phiếu mở cho mỗi thiết bị), BR-11 (mã màu và ngưỡng 25%), BR-15 (phần cho nhân viên tự thêm nhóm, cắt khoảng trắng, so khớp không phân biệt hoa thường, tối đa 5 nhóm), BR-08 (phần cấp lại số theo năm và không sửa được), BR-04 (phần bắt buộc ghi chú nguồn gốc).

