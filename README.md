1.	TÊN ĐỀ TÀI: Xây dựng website quản lý tiền trọ hỗ trợ dự đoán chi phí thông minh
2.	Giới thiệu hệ thống:
2.1.  Bối cảnh
Trong thực tế, việc quản lý tiền trọ, chi phí điện nước và dự đoán chi phí tương lai vẫn còn thực hiện thủ công, dễ sai sót và thiếu khả năng phân tích. Người thuê trọ thường không biết trước chi phí tháng sau, trong khi chủ trọ gặp khó khăn trong việc dự báo doanh thu và chi phí vận hành.
2.2. Mục tiêu hệ thống
Hệ thống được xây dựng nhằm:
-	Quản lý tập trung thông tin nhà trọ, phòng trọ, khách thuê
-	Tự động tính toán và quản lý hóa đơn
-	Dự đoán chi phí tương lai
-	Đưa ra gợi ý tiết kiệm chi phí điện – nước
-	Hỗ trợ ra quyết định tài chính cho cả chủ trọ và người thuê
3.	Đối tượng sử dụng (ACTOR)
3.1. Chủ trọ (OWNER)
Quản lý nhiều nhà trọ
Theo dõi doanh thu, chi phí
Dự đoán tài chính dài hạn
3.2. Người thuê trọ (TENANT)
Theo dõi chi phí cá nhân
Dự đoán tiền trọ tháng sau
Nhận gợi ý tiết kiệm
3.3. Hệ thống (SYSTEM)
Phân tích dữ liệu
Dự đoán chi phí
Gợi ý 

🟢 TUẦN 1 – Nghiên cứu & thiết kế

Phân tích bài toán

Xác định chức năng

Vẽ Use Case

Vẽ ERD

Thiết kế database

Chọn công nghệ

🎯 Output: tài liệu phân tích + sơ đồ

🟡 GIAI ĐOẠN OWNER (Tuần 2 → Tuần 7)
📌 TUẦN 2 – Auth (100%)

Login / Register

Quản lý người dùng

🎯 Có hệ thống đăng nhập ổn định

📌 TUẦN 3 – Quản lý nhà & phòng (100%)

CRUD houses

CRUD rooms

Quan hệ owner → house → room

Hiển thị trạng thái phòng

📌 TUẦN 4 – Quản lý khách thuê (100%)

CRUD tenant

Gán tenant vào phòng

Kết thúc hợp đồng

Hiển thị phòng đang có người thuê

📌 TUẦN 5 – Điện nước & tạo hóa đơn

Nhập chỉ số

Tính tiền tự động

Tạo hóa đơn

Lọc theo tháng

📌 TUẦN 6 – Quản lý hóa đơn nâng cao (100%)

Chi tiết hóa đơn

Đánh dấu đã thanh toán

Modal gửi Zalo

Lọc theo nhà

📌 TUẦN 7 – Dashboard OWNER (70%)

Thống kê:

Tổng doanh thu

Phòng trống

Hóa đơn chưa thanh toán

Biểu đồ doanh thu

Xuất Excel

Hoàn thiện UI

🎯 Kết thúc tuần 7: OWNER hoàn chỉnh 100%

🔵 GIAI ĐOẠN USER / TENANT (Tuần 8–9)
📌 TUẦN 8 – Giao diện USER

Layout riêng cho tenant

Tenant xem:

Thông tin phòng

Hợp đồng

Hóa đơn của mình

Chỉ được xem dữ liệu của mình

📌 TUẦN 9 – Nâng cấp USER

Lịch sử thanh toán

Thông báo

Dự đoán chi phí tháng sau

Trung bình 3 tháng gần nhất

Biểu đồ tiền điện nước của riêng tenant

🎯 Hoàn thiện phần người dùng

🟣 TUẦN 10 – Tối ưu & bảo mật

Fix bug

Kiểm tra phân quyền chéo

Validate input

Tối ưu SQL

🟠 TUẦN 11 – Viết báo cáo

Chương 1: Giới thiệu

Chương 2: Cơ sở lý thuyết

Chương 3: Phân tích & thiết kế

Chương 4: Xây dựng hệ thống

Chương 5: Kết luận & hướng phát triển

🔴 TUẦN 12 – Chuẩn bị bảo vệ

Luyện demo 5–7 phút

Chuẩn bị câu hỏi phản biện

Backup dữ liệu

Deploy nếu cần