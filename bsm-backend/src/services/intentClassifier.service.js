/**
 * Intent Classifier Service
 * Phân loại ý định của người dùng: CHAT | DATABASE | AMBIGUOUS
 */

import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Phân loại intent của câu hỏi
 * @param {string} question - Câu hỏi hiện tại
 * @param {Array} history - Lịch sử hội thoại
 * @returns {Promise<Object>} - { intent: "CHAT" | "DATABASE" | "AMBIGUOUS" }
 */
export async function classifyIntent(question, history = []) {
  try {
    // Tạo context từ lịch sử (3 tin nhắn gần nhất)
    const recentHistory = history.slice(-6); // 3 cặp user-assistant
    const historyContext = recentHistory.length > 0
      ? `\n\nLịch sử hội thoại gần đây:\n${recentHistory.map(h => `${h.role}: ${h.message}`).join("\n")}`
      : "";

    const systemPrompt = `
Bạn là bộ phân loại ý định (Intent Classifier) cho hệ thống quản lý nhà trọ BSM_Management.

NHIỆM VỤ: Phân loại câu hỏi của người dùng thành ĐÚNG 1 trong 3 loại:

==================================================
1. CHAT
==================================================
Định nghĩa:
- Chào hỏi, tạm biệt
- Hỏi về AI (bạn là ai, bạn làm gì)
- Hỏi thông tin cá nhân (tên tôi, email tôi, sdt tôi)
- Tâm sự, cảm ơn
- Không liên quan đến nghiệp vụ quản lý nhà trọ

Ví dụ:
- "Xin chào"
- "Bạn là ai?"
- "Tên tôi là gì?"
- "Cảm ơn bạn"
- "Tạm biệt"
- "Hôm nay thế nào?"

==================================================
2. DATABASE
==================================================
Định nghĩa:
- Câu hỏi cần truy vấn dữ liệu từ database
- Có đủ thông tin để xác định (nhà nào, thời gian nào)
- Hoặc có thể suy luận từ context hội thoại

Ví dụ:
- "Doanh thu tháng này của nhà Sunrise"
- "Nhà Green Home còn phòng trống không?"
- "Ai chưa đóng tiền điện tháng 3?"
- "Xem chi tiết hơn" (nếu có context trước đó)
- "Thông tin của khách đó" (nếu có context về khách nào)
- "Tháng trước thì sao?" (nếu có context về chủ đề)

==================================================
3. AMBIGUOUS
==================================================
Định nghĩa:
- Câu hỏi thiếu thông tin quan trọng
- Không xác định được nhà nào (khi có nhiều nhà)
- Không xác định được thời gian (khi cần thiết)
- Không có context để suy luận

Ví dụ:
- "Doanh thu thế nào?" (không nói nhà nào, tháng nào)
- "Còn phòng trống không?" (không nói nhà nào)
- "Tổng số phòng là bao nhiêu?" (không nói nhà nào)
- "Xem danh sách khách thuê" (không nói nhà nào)

NGOẠI LỆ - Trả DATABASE nếu:
- Câu hỏi có tên nhà cụ thể: "Nhà Sunrise", "Nhà A", "Green Home"
- Câu hỏi có từ tham chiếu context: "đó", "này", "kia", "chi tiết", "xem thêm", "thông tin thêm"
- Lịch sử hội thoại có đủ context để suy luận

==================================================
QUY TẮC QUAN TRỌNG:
==================================================
1. Đọc KỸ lịch sử hội thoại để hiểu context
2. Nếu câu hỏi có từ tham chiếu ("đó", "này", "chi tiết") → ưu tiên DATABASE
3. Nếu chỉ có 1 nhà trong hệ thống → câu hỏi về phòng/doanh thu là DATABASE
4. Nếu có nhiều nhà và câu hỏi không nói rõ nhà nào → AMBIGUOUS
5. CHỈ TRẢ VỀ 1 TỪ DUY NHẤT: CHAT hoặc DATABASE hoặc AMBIGUOUS

==================================================
OUTPUT FORMAT:
==================================================
Chỉ trả về JSON với format:
{
  "intent": "CHAT" hoặc "DATABASE" hoặc "AMBIGUOUS"
}
`;

    const userPrompt = `${question}${historyContext}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const rawResponse = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let intent = "CHAT"; // default
    try {
      const parsed = JSON.parse(rawResponse);
      intent = parsed.intent || "CHAT";
    } catch {
      // Fallback: extract từ text
      if (rawResponse.includes("DATABASE")) intent = "DATABASE";
      else if (rawResponse.includes("AMBIGUOUS")) intent = "AMBIGUOUS";
      else intent = "CHAT";
    }

    // Normalize
    intent = intent.toUpperCase();
    if (!["CHAT", "DATABASE", "AMBIGUOUS"].includes(intent)) {
      intent = "CHAT";
    }

    return { intent };

  } catch (error) {
    console.error("[Intent Classifier] Error:", error);
    
    // ✨ FALLBACK: Phân loại dựa trên từ khóa khi API lỗi
    const questionLower = question.toLowerCase().trim();
    
    // 1. Check CHAT keywords
    const chatKeywords = [
      "xin chào", "chào", "hello", "hi", "hey",
      "bạn là ai", "ai là bạn", "giới thiệu",
      "tên tôi", "thông tin của tôi", "email của tôi", "sdt của tôi",
      "cảm ơn", "thank", "tạm biệt", "bye", "bb"
    ];
    
    if (chatKeywords.some(kw => questionLower.includes(kw) || questionLower === kw)) {
      console.log("[Intent Classifier] Fallback → CHAT (keyword match)");
      return { intent: "CHAT" };
    }
    
    // 2. Check DATABASE keywords (có tên nhà hoặc từ khóa nghiệp vụ rõ ràng)
    const databaseKeywords = [
      "doanh thu", "revenue", "phòng trống", "empty room",
      "hóa đơn", "invoice", "chưa đóng", "unpaid",
      "khách thuê", "tenant", "danh sách", "list"
    ];
    
    const hasHouseName = history.some(h => 
      h.message && (h.message.includes("nhà") || h.message.includes("house"))
    );
    
    if (databaseKeywords.some(kw => questionLower.includes(kw)) && hasHouseName) {
      console.log("[Intent Classifier] Fallback → DATABASE (keyword + context)");
      return { intent: "DATABASE" };
    }
    
    // 3. Mặc định: CHAT (để xử lý như general question)
    console.log("[Intent Classifier] Fallback → CHAT (default)");
    return { intent: "CHAT" };
  }
}
