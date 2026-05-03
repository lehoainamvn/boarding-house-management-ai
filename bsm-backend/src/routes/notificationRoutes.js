import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import sql from "mssql";
// 👉 CŨNG IMPORT poolPromise TỪ FILE KẾT NỐI VÀO ĐÂY (Sửa lại đường dẫn cho đúng nhé)
import { poolPromise } from "../config/db.js"; 

const router = express.Router();

// 1. API LẤY DANH SÁCH THÔNG BÁO
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; 
    
    // Đảm bảo lấy được kết nối từ poolPromise
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT * FROM notifications 
        WHERE user_id = @user_id 
        ORDER BY created_at DESC
      `);

    res.status(200).json(result.recordset);

  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// 2. API ĐÁNH DẤU ĐỌC TẤT CẢ
router.put("/read-all", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const pool = await poolPromise;
      const request = pool.request();
  
      await request
        .input("user_id", sql.Int, userId)
        .query(`UPDATE notifications SET is_read = 1 WHERE user_id = @user_id`);
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Lỗi đọc thông báo:", error);
      res.status(500).json({ error: "Lỗi Server" });
    }
});

// 3. API ĐỌC TỪNG THÔNG BÁO
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .input("user_id", req.user.id)
      .query("UPDATE notifications SET is_read = 1 WHERE id = @id AND user_id = @user_id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =======================================================
   🔥 THÊM 2 HÀM XÓA THÔNG BÁO DƯỚI ĐÂY
======================================================= */

// 🔥 4. API XÓA TẤT CẢ THÔNG BÁO CỦA USER
router.delete("/clear-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;
    
    await pool.request()
      .input("user_id", sql.Int, userId)
      .query("DELETE FROM notifications WHERE user_id = @user_id");
      
    res.status(200).json({ success: true, message: "Đã xóa toàn bộ thông báo" });
  } catch (err) {
    console.error("Lỗi xóa tất cả thông báo:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔥 5. API XÓA 1 THÔNG BÁO THEO ID
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input("id", sql.Int, parseInt(req.params.id)) // 👈 SỬA THÀNH DÒNG NÀY (Thêm sql.Int và parseInt)
      .input("user_id", sql.Int, req.user.id)
      .query("DELETE FROM notifications WHERE id = @id AND user_id = @user_id");

    // Kiểm tra xem có dòng nào trong DB thực sự bị xóa không
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông báo hoặc bạn không có quyền xóa" });
    }

    res.json({ success: true, message: "Đã xóa thông báo thành công" });
  } catch (err) {
    console.error("Lỗi xóa thông báo:", err);
    res.status(500).json({ message: err.message });
  }
});


export default router;