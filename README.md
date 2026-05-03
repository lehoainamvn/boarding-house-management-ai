# Hệ thống Quản lý Nhà trọ Thông minh (BSM) 🏘️

> Hệ thống quản lý nhà trọ toàn diện tích hợp Trí tuệ nhân tạo (AI) để tối ưu hóa vận hành, dự báo tài chính và hỗ trợ người dùng thông minh.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/lehoainamvn/bsm)

---

## � Mục lục

- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [API Documentation](#-api-documentation)
- [Đóng góp](#-đóng-góp)
- [Tác giả](#-tác-giả)
- [License](#-license)

---

## ✨ Tính năng nổi bật

### 🏠 Quản lý Cốt lõi
- ✅ Quản lý nhà trọ, phòng trọ, khách thuê và hợp đồng chuyên nghiệp
- ✅ Theo dõi trạng thái phòng (Trống, Đã cho thuê, Bảo trì)
- ✅ Quản lý thông tin khách thuê và lịch sử hợp đồng
- ✅ Tính toán tự động hóa đơn điện, nước, dịch vụ hàng tháng

### 🤖 Trí tuệ Nhân tạo (AI)
- **Trợ lý AI thông minh (Chatbot):**
  - 👨‍💼 **Dành cho Chủ trọ:** Truy vấn nhanh dữ liệu doanh thu, phân tích báo cáo tài chính, tư vấn quản lý dựa trên dữ liệu thực tế
  - 👤 **Dành cho Người thuê:** Giải đáp thắc mắc về nội quy, hướng dẫn sử dụng dịch vụ, trả lời FAQs
- **Phân tích & Dự báo:** Sử dụng Random Forest để dự báo doanh thu tương lai và phát hiện các điểm thu/chi bất thường

### 💰 Quản lý Tài chính
- ✅ Tính toán hóa đơn tự động
- ✅ Theo dõi thanh toán và nợ
- ✅ Báo cáo doanh thu chi tiết
- ✅ Dự báo tài chính dựa trên AI
- ✅ Hỗ trợ thanh toán VNPay

### 🔐 Bảo mật & Xác thực
- ✅ Xác thực JWT (JSON Web Token)
- ✅ Mã hóa mật khẩu với bcryptjs
- ✅ Xác minh danh tính qua OTP Email
- ✅ Đăng nhập Google OAuth 2.0 với chọn vai trò

### 📱 Tính năng Thời gian Thực
- ✅ Tin nhắn nội bộ tức thời qua Socket.io
- ✅ Thông báo hệ thống real-time
- ✅ Cập nhật dữ liệu live

### 📊 Quản lý Dữ liệu
- ✅ Tìm kiếm nâng cao
- ✅ Bộ lọc linh hoạt
- ✅ Phân trang hiệu quả
- ✅ Xuất báo cáo Excel

---

## 🚀 Công nghệ sử dụng

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real_Time-010101?logo=socketdotio&logoColor=white)

- **React.js v19** - UI Framework
- **Vite v7** - Build tool & Dev server
- **Tailwind CSS v4** - Styling
- **Chart.js & Recharts** - Data visualization
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white)

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Microsoft SQL Server** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Socket.io** - Real-time communication
- **Node-cron** - Task scheduling

### AI & Machine Learning
![Groq](https://img.shields.io/badge/Groq-LLM-orange?logo=google-gemini&logoColor=white)
![ML](https://img.shields.io/badge/ML-Random_Forest-F7931E?logo=scikitlearn&logoColor=white)

- **Groq SDK** - Generative AI (Llama 3/Mixtral)
- **Random Forest** - Predictive analytics
- **Python** - ML model training

---

## 🏛️ Kiến trúc hệ thống

### Mô hình Thiết kế
- **MVC** (Model - View - Controller) - Tách biệt logic, view, và dữ liệu
- **RESTful API** - Giao tiếp chuẩn HTTP
- **Monorepo** - Quản lý Frontend & Backend trong một repository

### Cấu trúc Thư mục
```
bsm/
├── bsm-frontend/              # React Frontend
│   ├── src/
│   │   ├── api/              # API calls
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── hooks/            # Custom hooks
│   │   └── assets/           # Static files
│   └── package.json
│
├── bsm-backend/               # Node.js Backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Express middlewares
│   │   ├── validators/       # Input validation
│   │   ├── helpers/          # Utility functions
│   │   ├── errors/           # Error handling
│   │   ├── constants/        # Constants
│   │   ├── config/           # Configuration
│   │   └── jobs/             # Scheduled tasks
│   └── package.json
│
├── database/                  # SQL scripts
├── docker-compose.yml         # Docker configuration
└── README.md
```

---

## 🏁 Hướng dẫn cài đặt

### Yêu cầu Hệ thống
- **Node.js** v18 hoặc cao hơn
- **npm** v9 hoặc cao hơn
- **SQL Server** 2019 hoặc cao hơn
- **Git**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/lehoainamvn/bsm.git
cd bsm
```

### 2️⃣ Thiết lập Cơ sở Dữ liệu
```bash
# Thực thi các script SQL trong thư mục database
# Sử dụng SQL Server Management Studio hoặc Azure Data Studio
# Chạy các file .sql để khởi tạo cấu trúc bảng và dữ liệu mẫu
```

### 3️⃣ Thiết lập Backend
```bash
cd bsm-backend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cấu hình biến môi trường
# - DATABASE_URL: Kết nối SQL Server
# - JWT_SECRET: Secret key cho JWT
# - GROQ_API_KEY: API key từ Groq
# - EMAIL_USER: Email cho Nodemailer
# - EMAIL_PASSWORD: Password email
# - GOOGLE_CLIENT_ID: Google OAuth Client ID

# Khởi động server
npm start
# Server chạy tại http://localhost:5000
```

### 4️⃣ Thiết lập Frontend
```bash
cd bsm-frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cấu hình biến môi trường
# - VITE_API_BASE_URL: URL backend (http://localhost:5000)
# - VITE_GOOGLE_CLIENT_ID: Google OAuth Client ID

# Khởi động dev server
npm run dev
# Frontend chạy tại http://localhost:5173
```

### 5️⃣ Xác minh Cài đặt
```bash
# Kiểm tra backend
curl http://localhost:5000/api/health

# Kiểm tra frontend
# Mở trình duyệt: http://localhost:5173
```

---

## 📁 Cấu trúc Thư mục Chi tiết

### Frontend Structure
```
bsm-frontend/src/
├── api/                    # API integration
│   ├── authApi.js
│   ├── houseApi.js
│   ├── invoiceApi.js
│   └── ...
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Reusable components
│   ├── modals/            # Modal dialogs
│   └── layout/            # Layout components
├── pages/
│   ├── auth/              # Login, Register, etc.
│   ├── owner/             # Owner dashboard pages
│   └── tenant/            # Tenant pages
├── hooks/                 # Custom React hooks
├── layouts/               # Page layouts
├── assets/                # Images, icons, etc.
└── App.jsx
```

### Backend Structure
```
bsm-backend/src/
├── controllers/           # Request handlers (14 files)
├── services/              # Business logic (25 files)
├── repositories/          # Data access layer (13 files)
├── routes/                # API routes (18 files)
├── middlewares/           # Express middlewares
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
├── validators/            # Input validation (5 files)
├── helpers/               # Utility functions
├── errors/                # Error classes
├── constants/             # Constants
├── config/                # Configuration
├── jobs/                  # Scheduled tasks
└── server.js              # Entry point
```

---

## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login              - Đăng nhập
POST   /api/auth/register           - Đăng ký
POST   /api/auth/google-login       - Đăng nhập Google
POST   /api/auth/forgot-password    - Quên mật khẩu
POST   /api/auth/reset-password     - Đặt lại mật khẩu
```

### House Management
```
GET    /api/houses                  - Danh sách nhà
POST   /api/houses                  - Tạo nhà mới
GET    /api/houses/:id              - Chi tiết nhà
PUT    /api/houses/:id              - Cập nhật nhà
DELETE /api/houses/:id              - Xóa nhà
```

### Room Management
```
GET    /api/rooms                   - Danh sách phòng
POST   /api/rooms                   - Tạo phòng mới
GET    /api/rooms/:id               - Chi tiết phòng
PUT    /api/rooms/:id               - Cập nhật phòng
DELETE /api/rooms/:id               - Xóa phòng
```

### Invoice Management
```
GET    /api/invoices                - Danh sách hóa đơn
POST   /api/invoices                - Tạo hóa đơn
GET    /api/invoices/:id            - Chi tiết hóa đơn
PUT    /api/invoices/:id            - Cập nhật hóa đơn
POST   /api/payment                 - Xử lý thanh toán
```

### AI Features
```
POST   /api/ai                      - Chat với AI (Owner)
POST   /api/ai-tenant               - Chat với AI (Tenant)
POST   /api/predict-revenue         - Dự báo doanh thu
```

Xem chi tiết tại: [API Documentation](./API_DOCUMENTATION.md)

---

## 🧪 Testing

### Frontend Testing
```bash
cd bsm-frontend
npm run test
```

### Backend Testing
```bash
cd bsm-backend
npm run test
```

---

## 🐳 Docker Deployment

```bash
# Build và chạy với Docker Compose
docker-compose up -d

# Kiểm tra containers
docker-compose ps

# Xem logs
docker-compose logs -f
```

---

## 📈 Performance Optimization

- ✅ Code splitting & lazy loading
- ✅ Image optimization
- ✅ Database indexing
- ✅ Caching strategy
- ✅ API response compression

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ OTP verification
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting
- ✅ Input validation

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

Dự án này được cấp phép dưới MIT License - xem file [LICENSE](LICENSE) để chi tiết.

---

## 👨‍💻 Tác giả

**Lê Hoài Nam**
- 🌐 GitHub: [@lehoainamvn](https://github.com/lehoainamvn)
- 📧 Email: naml75803@gmail.com
- 💼 LinkedIn: [Lê Hoài Nam](https://linkedin.com/in/lehoainam)

---

## 📞 Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra [Issues](https://github.com/lehoainamvn/bsm/issues)
2. Tạo Issue mới với mô tả chi tiết
3. Liên hệ qua email: naml75803@gmail.com

---

## 🙏 Cảm ơn

Cảm ơn tất cả những người đã đóng góp và hỗ trợ dự án này!

---

**Made with ❤️ by Lê Hoài Nam**

Last Updated: April 24, 2026
