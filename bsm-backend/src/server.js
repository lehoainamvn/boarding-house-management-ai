import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import meterRoutes from "./routes/meterRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiTenantRoutes from "./routes/aiTenantRoutes.js"
import predictRoute from "./routes/predictRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import "./jobs/cron.js";
/* ✅ IMPORT ĐÚNG */
import { verifyMail } from "./config/mail.js";
import { poolPromise } from "./config/db.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { setSocketIO } from "./services/notification.service.js";
dotenv.config();

/* ✅ VERIFY SMTP */
verifyMail();
const app = express();
const server = http.createServer(app);
/* SOCKET */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Set io instance for notification service
setSocketIO(io);

io.on("connection", (socket) => {

  console.log("✅ User connected:", socket.id);

  // Auto join user's personal room for notifications
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined personal room: user_${userId}`);
  });

  socket.on("join_room", (roomId) => {
    console.log(`👉 ${socket.id} join room ${roomId}`);
    socket.join(roomId);
  });

 
socket.on("send_message", async (data) => {
    console.log("📨 send:", data);
    
    // 1. Gửi tin nhắn vào khung chat bình thường
    io.to(data.room_id).emit("receive_message", data);

    // 2. Tự động lưu thông báo vào database và làm rung chuông
    try {
      const pool = await poolPromise;
      const request = pool.request();

      const receiverId = data.receiver_id; 
      const senderName = data.sender_name || "Ai đó"; 
      // Bạn có thể tùy chỉnh nội dung theo ý thích
      const notifyContent = `Bạn có tin nhắn mới từ phòng ${data.room_id}`;

     if (receiverId) {
        // Lưu thông báo vào CSDL
        const result = await request
          // Bỏ sql.Int và sql.NVarChar đi, truyền thẳng giá trị vào
          .input('user_id', receiverId)
          .input('title', 'Tin nhắn mới')
          .input('content', notifyContent)
          .query(`
            INSERT INTO notifications (user_id, title, content, is_read, created_at)
            VALUES (@user_id, @title, @content, 0, GETDATE());
            
            -- Lấy luôn thông báo vừa lưu đầy đủ id để bắn lên React
            SELECT TOP 1 * FROM notifications WHERE id = SCOPE_IDENTITY();
          `);

        const newNotify = result.recordset[0];

        // Bắn thông báo real-time tới riêng người nhận (Room: user_ID)
        io.to(`user_${receiverId}`).emit("new_notification", newNotify);
        
        console.log(`🔔 Đã gửi thông báo Realtime tới user_${receiverId}`);
      }
    } catch (error) {
      console.error("❌ Lỗi lưu thông báo tin nhắn:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ disconnected:", socket.id);
  });

});
// ===== MIDDLEWARE =====
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("public/uploads"));
// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-tenant", aiTenantRoutes);
app.use("/api/predict-revenue", predictRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);

// Flat routes (starting with /api/...)
app.use("/api", meterRoutes); // covers /api/meters and /api/rooms/:id/meter-readings
app.use("/api", invoiceRoutes); // covers /api/invoices
app.use("/api", revenueRoutes); // covers /api/revenue
app.use("/api", uploadRoutes); // covers /api/upload

// ===== ERROR HANDLING =====
app.use(errorMiddleware);

// ===== START SERVER =====
/* START SERVER */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
  