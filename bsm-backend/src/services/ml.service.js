import express from "express"
import { poolPromise } from "../config/db.js"
import { predictRevenue } from "../services/ml.service.js"

const router = express.Router()

router.get("/predict-revenue", async (req, res) => {
  try {
    const houseId = req.query.house;
    const months = Number(req.query.months) || 3;

    if (!houseId) {
      return res.status(400).json({ error: "Vui lòng cung cấp nhà trọ" });
    }

    const pool = await poolPromise;

    // 1. Lấy dữ liệu lịch sử từ Database (Lọc theo đúng nhà trọ đang chọn)
    const result = await pool.request()
      .input("houseId", houseId)
      .query(`
        SELECT
          FORMAT(i.created_at, 'yyyy-MM') as month,
          SUM(i.total_amount) as revenue
        FROM invoices i
        JOIN rooms r ON i.room_id = r.id
        WHERE r.house_id = @houseId
        GROUP BY FORMAT(i.created_at, 'yyyy-MM')
        ORDER BY month ASC
      `);

    const history = result.recordset;

    // 2. Truyền lịch sử vào ML Service
    // Lưu ý: Python script mới sẽ trả về MỘT OBJECT chứa cả { history, predictions, insight }
    const aiResult = await predictRevenue(history, months);

    // 3. Nếu data Python trả về dạng chuỗi (String), bạn cần ép kiểu về JSON
    // Nếu trong hàm predictRevenue bạn đã JSON.parse() rồi thì bỏ dòng parse đi nhé.
    let finalResult = aiResult;
    if (typeof aiResult === 'string') {
        finalResult = JSON.parse(aiResult);
    }

    // 4. Trả thẳng cục Object xịn xò này về cho Frontend (React) vẽ biểu đồ!
    res.json(finalResult);

  } catch(err) {
    console.error("Lỗi khi dự đoán doanh thu:", err);
    res.status(500).json({
      error: "AI Predict Error"
    });
  }
});

export default router;