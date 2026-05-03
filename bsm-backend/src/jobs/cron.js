import cron from "node-cron";
import sql from "mssql";

import { poolPromise } from "../config/db.js"; 

cron.schedule("8 0 * * *", async () => {
  try {
    console.log("[Cron Job] Đang kiểm tra ngày nhắc nhở...");

    // 1. Chờ lấy kết nối từ poolPromise đã khởi tạo
    const pool = await poolPromise;
    const request = pool.request();

    // 2. Chèn dữ liệu thông báo mới vào DB
    await request
      .input('user_id', sql.Int, 14) // Ép cứng gửi cho user 14 để test
      .input('title', sql.NVarChar, 'Nhắc nhở hóa đơn')
      .input('content', sql.NVarChar, 'Hôm nay là ngày 29, vui lòng kiểm tra...')
      .query(`
        INSERT INTO notifications (user_id, title, content, is_read, created_at)
        VALUES (@user_id, @title, @content, 0, GETDATE())
      `);
      
    console.log("[Cron Job] Đã lưu thông báo vào database thành công!");

  } catch (error) {
    console.error("❌ Lỗi Cron Job không lưu được vào DB:", error.message);
  }
});