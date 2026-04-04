import express from "express";
import { poolPromise } from "../config/db.js";
import { detectIntent } from "../services/intent.service.js";
import { generateSQL } from "../services/sqlGenerator.service.js";
import { explainData } from "../services/explain.service.js";
import { validateSQL } from "../utils/sqlValidator.js";
import { normalizeQuestion } from "../utils/questionParser.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Hàm tiện ích: Lưu tin nhắn vào DB
async function saveChatMessage(pool, userId, role, msg) {
  await pool.request()
    .input("user", userId)
    .input("role", role)
    .input("msg", msg)
    .query(`
      INSERT INTO ChatMessages(user_id, role, message)
      VALUES(@user, @role, @msg)
    `);
}

router.post("/chat", verifyToken, async (req, res) => {
  try {
    let { question } = req.body;
    const userId = req.user.id; 
    question = normalizeQuestion(question);

    console.log("User Question:", question);

    const pool = await poolPromise;

    /* ===== 1. LƯU TIN NHẮN CỦA USER ===== */
    await saveChatMessage(pool, userId, "user", question);

    /* ===== 2. RULE-BASE: THÔNG TIN CÁ NHÂN & CHÀO HỎI ===== */
    const personalQuestions = [
      "tôi tên gì", 
      "thông tin của tôi", 
      "thông tin cá nhân", 
      "số điện thoại của tôi", 
      "email của tôi",
      "tôi là ai"
    ];
    const questionLower = question.toLowerCase().trim();
    const greetings = ["hi", "hello", "xin chào", "chào bạn", "chào", "chào ai"];
    
    if (greetings.includes(questionLower)) {
      const answer = "Xin chào 👋 Mình là trợ lý AI quản lý nhà trọ của bạn. Mình có thể giúp bạn phân tích doanh thu, tìm phòng trống hoặc kiểm tra ai đang nợ tiền phòng. Bạn cần xem thông tin gì?";
      await saveChatMessage(pool, userId, "assistant", answer);
      
      return res.json({ 
        answer,
        suggestions: ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"]
      });
    }

    if (personalQuestions.includes(questionLower)) {
      const result = await pool.request()
        .input("id", userId)
        .query(`SELECT name, email, phone FROM users WHERE id = @id`);

      const user = result.recordset[0];
      const answer = `👤 Tên: ${user.name}\n📧 Email: ${user.email}\n📱 SĐT: ${user.phone}`;

      await saveChatMessage(pool, userId, "assistant", answer);
      
      return res.json({ 
        answer,
        suggestions: ["Doanh thu tháng này", "Phòng chưa thanh toán", "Xem thông tin phòng"]
      });
    }

    /* ===== 3. PHÂN LOẠI Ý ĐỊNH (INTENT) ===== */
    let intent = await detectIntent(question);
    intent = intent.toUpperCase();
    if (intent.includes("CHAT")) intent = "CHAT";
    if (intent.includes("DATABASE")) intent = "DATABASE";

    console.log("Detected Intent:", intent);

    /* ===== 4. XỬ LÝ CHAT BÌNH THƯỜNG (KHÔNG CẦN TRUY VẤN DB) ===== */
    if (intent === "CHAT") {
      const explain = await explainData(question, []); 
      
      let answer = explain;
      let suggestions = ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"];

      if (explain.includes("[SUGGESTIONS]")) {
        const parts = explain.split("[SUGGESTIONS]");
        answer = parts[0].trim();
        suggestions = parts[1]
          .split("\n")
          .map(s => s.replace("-", "").trim())
          .filter(s => s.length > 0);
      }

      await saveChatMessage(pool, userId, "assistant", answer);
      return res.json({ answer, suggestions });
    }

    /* ===== 5. XỬ LÝ NGHIỆP VỤ BẰNG AI (TEXT-TO-SQL) ===== */
    
    // ĐÃ FIX: Lấy 5 tin nhắn gần nhất từ bảng ChatMessages trong DB
    const historyResult = await pool.request()
      .input("userId", userId)
      .query(`
        SELECT TOP 5 role, message 
        FROM ChatMessages 
        WHERE user_id = @userId 
        ORDER BY id DESC
      `);

    // Chuyển mảng từ Database về định dạng chuẩn của Groq (Gần nhất nằm ở dưới cùng)
    // Đã sửa lại item.message thay vì item.parts[0].text bị lỗi
    const conversationHistory = historyResult.recordset.reverse().map(item => ({
      role: item.role, 
      content: item.message 
    }));

    // Gửi mảng lịch sử (đã bao gồm câu hỏi vừa lưu ở Bước 1) sang Groq
    let sqlQuery = await generateSQL(conversationHistory, userId);
    
    // Chuẩn hóa chuỗi SQL AI trả về
    sqlQuery = sqlQuery.replace(/```sql/g, "").replace(/```/g, "").trim();
    console.log("AI Generated SQL:", sqlQuery);

    // Kiểm tra tính an toàn của SQL
    sqlQuery = validateSQL(sqlQuery);

    // Thực thi câu lệnh Database
    const result = await pool.request().query(sqlQuery);
    const data = result.recordset;

    /* ===== 6. AI GIẢI THÍCH DỮ LIỆU ĐỌC ĐƯỢC ===== */
    const explain = await explainData(question, data); 
    
    let answer = explain;
    let suggestions = ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"]; 

    if (explain.includes("[SUGGESTIONS]")) {
      const parts = explain.split("[SUGGESTIONS]");
      answer = parts[0].trim(); 
      
      suggestions = parts[1]
        .split("\n")
        .map(s => s.replace("-", "").trim())
        .filter(s => s.length > 0);
    }

    /* LƯU AI MESSAGE VÀ TRẢ VỀ */
    await saveChatMessage(pool, userId, "assistant", answer);
    
    return res.json({ answer, suggestions });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ 
      answer: "⚠️ Trợ lý AI đang gặp sự cố hoặc câu hỏi quá phức tạp. Vui lòng thử lại sau.",
      suggestions: ["Thử lại", "Doanh thu tháng này"]
    });
  }
});

export default router;