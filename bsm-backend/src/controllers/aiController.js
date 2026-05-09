/**
 * AI Controller
 * Xử lý các request liên quan đến AI Assistant
 */

import { processAiChat } from "../services/ai.service.v2.js";

/**
 * Chat với AI Assistant
 * POST /api/ai/chat
 * Body: { question: string }
 * Response: { intent, response, suggestions, context }
 */
export async function chatWithAI(req, res) {
  try {
    const { question } = req.body;
    
    // Validate input
    if (!question || question.trim() === "") {
      return res.status(400).json({
        intent: "ERROR",
        response: "Vui lòng nhập câu hỏi.",
        answer: "Vui lòng nhập câu hỏi.",  // Backward compatibility
        suggestions: ["Doanh thu tháng này", "Phòng trống"],
        context: {}
      });
    }

    const userId = req.user.id;
    
    // Xử lý chat với AI
    const result = await processAiChat(userId, question);

    // Trả về kết quả theo format mới (backward compatible)
    return res.json({
      // Format mới
      intent: result.intent,
      response: result.response,
      sql: result.sql || null,
      suggestions: result.suggestions || [],
      context: result.context || {},
      
      // Backward compatibility với frontend cũ
      answer: result.response  // Frontend cũ đọc field "answer"
    });

  } catch (err) {
    console.error("[AI Controller] Error:", err);
    
    return res.status(500).json({
      intent: "ERROR",
      response: "⚠️ Hệ thống đang gặp sự cố tạm thời, anh/chị vui lòng thử lại sau.",
      answer: "⚠️ Hệ thống đang gặp sự cố tạm thời, anh/chị vui lòng thử lại sau.",  // Backward compatibility
      suggestions: ["Thử lại", "Doanh thu tháng này"],
      context: {}
    });
  }
}
