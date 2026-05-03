import { processAiChatService } from "../services/ai.service.js";

export async function chatWithAI(req, res) {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ reply: "Vui lòng nhập câu hỏi." });
    }

    const userId = req.user.id; 
    
    const result = await processAiChatService(userId, question);

    return res.json({
      answer: result.answer,
      suggestions: result.suggestions
    });

  } catch (err) {
    console.error("Lỗi Controller Chat AI:", err);
    res.status(500).json({
      answer: "⚠️ Đã xảy ra lỗi trong quá trình phân tích dữ liệu. Vui lòng thử lại với cách diễn đạt khác!",
      suggestions: ["Thử lại", "Doanh thu tháng này"]
    });
  }
}