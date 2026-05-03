import sql from "mssql";
import { poolPromise } from "../config/db.js";

// Import io instance from server
let io = null;

export function setSocketIO(socketIO) {
  io = socketIO;
}

export async function createNotification({ user_id, title, content }) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("user_id", sql.Int, user_id)
      .input("title", sql.NVarChar(100), title)
      .input("content", sql.NVarChar(255), content)
      .query(`
        INSERT INTO notifications (user_id, title, content, is_read, created_at)
        VALUES (@user_id, @title, @content, 0, GETDATE());
        
        SELECT TOP 1 * FROM notifications WHERE id = SCOPE_IDENTITY();
      `);
      
    const newNotification = result.recordset[0];
    
    console.log(`🔔 Đã lưu thông báo cho user ${user_id}`);
    
    // Emit socket event to user
    if (io) {
      io.to(`user_${user_id}`).emit("new_notification", newNotification);
      console.log(`📡 Đã emit notification real-time tới user_${user_id}`);
    } else {
      console.warn("⚠️ Socket.io chưa được khởi tạo");
    }
    
    return newNotification;
  } catch (error) {
    console.error("❌ Lỗi tạo thông báo:", error);
    throw error;
  }
}
