
import sql from "mssql";
import { poolPromise } from "../config/db.js";

export async function createNotification({ user_id, title, content }) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("user_id", sql.Int, user_id)
      .input("title", sql.NVarChar(100), title)
      .input("content", sql.NVarChar(255), content)
      .query(`
        INSERT INTO notifications (user_id, title, content, is_read, created_at)
        VALUES (@user_id, @title, @content, 0, GETDATE())
      `);
      
    console.log(`🔔 Đã lưu thông báo cho user ${user_id}`);
  } catch (error) {
    console.error("❌ Lỗi tạo thông báo:", error);
  }
}