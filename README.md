# Hệ thống Quản lý Nhà trọ Thông minh (BSM) 🏘️
Hệ thống quản lý nhà trọ toàn diện tích hợp Trí tuệ nhân tạo (AI) để tối ưu hóa vận hành, dự báo tài chính và hỗ trợ người dùng thông minh.

## 🚀 Công nghệ sử dụng
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white)
![AI-Groq](https://img.shields.io/badge/AI-Groq_Cloud-orange?logo=google-gemini&logoColor=white)
![Machine Learning](https://img.shields.io/badge/ML-Random_Forest-F7931E?logo=scikitlearn&logoColor=white)

## 🛠️ Danh sách kỹ thuật (Tech Stack)
- **Frontend:** React.js v19, Vite v7, Tailwind CSS v4, Chart.js & Recharts (Trực quan hóa dữ liệu).
- **Backend:** Node.js, Express.js.
- **Cơ sở dữ liệu:** Microsoft SQL Server.
- **Xác thực & Bảo mật:** JWT (JSON Web Token), bcryptjs, OTP qua Email (Nodemailer).
- **Thời gian thực & Tự động hóa:** Socket.io, Node-cron.
- **Trí tuệ nhân tạo (AI):** - **Generative AI:** Groq SDK (Llama 3/Mixtral) cho hệ thống Trợ lý ảo.
  - **Predictive AI:** Machine Learning (Random Forest) cho dự báo doanh thu.

## ✨ Tính năng nổi bật
- **Quản lý cốt lõi:** Quản lý nhà trọ, phòng trọ, khách thuê và hợp đồng chuyên nghiệp.
- **Tính toán hóa đơn:** Tự động chốt số và tính toán hóa đơn điện, nước, dịch vụ hàng tháng.
- **🤖 Trợ lý AI thông minh (AI Chatbot):**
  - **Dành cho Chủ trọ:** Truy vấn nhanh dữ liệu doanh thu, phân tích báo cáo tài chính, tư vấn quản lý dựa trên dữ liệu thực tế của hệ thống.
  - **Dành cho Người thuê:** Giải đáp thắc mắc về nội quy phòng trọ, hướng dẫn sử dụng dịch vụ và trả lời các câu hỏi thường gặp (FAQs) trong phạm vi người dùng.
- **📈 Phân tích & Dự báo AI:** Sử dụng Random Forest để dự báo doanh thu tương lai và phát hiện các điểm thu/chi bất thường.
- **Bảo mật:** Xác thực hệ thống với JWT & xác minh danh tính qua mã OTP Email.
- **Thời gian thực:** Tin nhắn nội bộ và thông báo hệ thống tức thời qua Socket.io.
- **Quản lý dữ liệu:** Tìm kiếm, bộ lọc nâng cao, phân trang và hỗ trợ xuất báo cáo Excel.

## 🏛️ Kiến trúc hệ thống
- Mô hình thiết kế: **MVC** (Model - View - Controller).
- Thiết kế giao tiếp: **RESTful API**.
- Cấu trúc thư mục: **Monorepo** (Phân tách rõ ràng Frontend & Backend).

## 🏁 Hướng dẫn bắt đầu

### 1. Thiết lập Cơ sở dữ liệu
- Thực thi các tệp tin script SQL trong thư mục `database` để khởi tạo cấu trúc bảng và dữ liệu mẫu trong SQL Server.

### 2. Thiết lập Backend
```bash
cd bsm-management-backend
npm install
# Cấu hình file .env (Database, JWT, Groq API Key, Email Config)
npm run dev
```

### 3. Thiết lập Frontend
```bash
cd bsm-frontend
npm install
npm run dev
```
## 👨‍💻 Tác giả
- **Lê Hoài Nam**
- GitHub: [https://github.com/lehoainamvn](https://github.com/lehoainamvn)
- Email: naml75803@gmail.com
