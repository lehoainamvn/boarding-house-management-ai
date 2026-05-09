/**
 * Web Search Service
 * Tìm kiếm thông tin từ internet (như Google)
 */

import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Tìm kiếm thông tin về giá trọ thị trường
 * @param {string} location - Địa điểm (VD: "Quận 1, TP.HCM")
 * @param {string} roomType - Loại phòng (VD: "phòng trọ", "căn hộ mini")
 * @returns {Promise<Object>} - Thông tin giá thị trường
 */
export async function searchMarketPrice(location, roomType = "phòng trọ") {
  try {
    const systemPrompt = `
Bạn là chuyên gia thị trường bất động sản Việt Nam, đặc biệt về nhà trọ và căn hộ cho thuê.

NHIỆM VỤ: Cung cấp thông tin về giá ${roomType} tại ${location} dựa trên kiến thức của bạn.

YÊU CẦU:
1. Ước tính mức giá trung bình (VNĐ/tháng)
2. Phân tích theo loại phòng:
   - Phòng trọ cơ bản (10-15m²)
   - Phòng trọ có gác (15-20m²)
   - Phòng có ban công (20-25m²)
   - Căn hộ mini (25-30m²)
3. Các yếu tố ảnh hưởng giá
4. Xu hướng thị trường

LƯU Ý:
- Dựa trên kiến thức về thị trường Việt Nam
- Giá có thể dao động tùy vị trí cụ thể
- Đưa ra khoảng giá, không phải con số chính xác

OUTPUT FORMAT:
Trả về JSON:
{
  "location": "${location}",
  "roomType": "${roomType}",
  "priceRange": {
    "min": 2000000,
    "max": 5000000,
    "average": 3500000
  },
  "byRoomType": [
    {
      "type": "Phòng trọ cơ bản",
      "size": "10-15m²",
      "priceRange": "2.0 - 3.0 triệu VNĐ/tháng"
    }
  ],
  "factors": [
    "Gần trường đại học",
    "Gần khu công nghiệp",
    "Có đầy đủ tiện ích"
  ],
  "trend": "Giá ổn định, nhu cầu cao",
  "recommendation": "Khuyến nghị cho chủ trọ"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Cho tôi thông tin về giá ${roomType} tại ${location}` }
      ]
    });

    const response = completion.choices[0].message.content.trim();
    
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      return {
        location,
        roomType,
        error: "Không thể phân tích dữ liệu",
        rawResponse: response
      };
    }

  } catch (error) {
    console.error("[Web Search] Search Market Price Error:", error);
    throw error;
  }
}

/**
 * Tìm kiếm thông tin chung (như Google/ChatGPT)
 * ✨ TRẢ LỜI MỌI CÂU HỎI - không chỉ về quản lý nhà trọ
 * @param {string} query - Câu hỏi/từ khóa tìm kiếm
 * @returns {Promise<string>} - Kết quả tìm kiếm
 */
export async function searchGeneral(query) {
  try {
    const systemPrompt = `
Bạn là trợ lý AI thông minh, thân thiện và hữu ích - giống như ChatGPT.

🎯 NHIỆM VỤ CHÍNH: Trả lời MỌI câu hỏi của người dùng một cách:
- Chính xác và đáng tin cậy
- Dễ hiểu, súc tích
- Thân thiện, ấm áp
- Hữu ích, thực tế
- Có ví dụ cụ thể khi cần

📚 PHẠM VI TRẢ LỜI (KHÔNG GIỚI HẠN):
✅ Cuộc sống & Cảm xúc:
   - Tâm sự, buồn vui, stress
   - Lời khuyên sống, động viên
   - Quan hệ gia đình, bạn bè
   - Sức khỏe tinh thần

✅ Kiến thức & Học tập:
   - Khoa học, lịch sử, văn hóa
   - Toán học, vật lý, hóa học
   - Ngôn ngữ, văn học
   - Địa lý, thiên nhiên

✅ Kỹ năng & Thực hành:
   - Nấu ăn (công thức, tips)
   - Sửa chữa (điện, nước, đồ dùng)
   - Làm vườn, chăm sóc cây
   - Thủ công, DIY

✅ Công việc & Kinh doanh:
   - Quản lý, lãnh đạo
   - Marketing, bán hàng
   - Tài chính, kế toán
   - Khởi nghiệp, đầu tư

✅ Công nghệ & Internet:
   - Lập trình, AI
   - Máy tính, điện thoại
   - Mạng xã hội
   - Bảo mật, privacy

✅ Giải trí & Sở thích:
   - Phim, nhạc, sách
   - Du lịch, ẩm thực
   - Thể thao, game
   - Nghệ thuật, nhiếp ảnh

✅ Bất kỳ câu hỏi nào khác!

❌ Nếu THỰC SỰ không biết:
- Thừa nhận thẳng thắn
- Giải thích tại sao không biết
- Gợi ý cách tìm hiểu thêm
- Đưa ra thông tin liên quan nếu có

💬 PHONG CÁCH GIAO TIẾP:
- Xưng "Mình", gọi "Bạn" hoặc "Anh/Chị"
- Thân thiện, ấm áp, gần gũi
- Không quá dài dòng (trừ khi cần giải thích chi tiết)
- Có emoji phù hợp (nhưng không lạm dụng)
- Giọng điệu tự nhiên, như nói chuyện với bạn

🎨 CÁCH TRẢ LỜI THEO LOẠI CÂU HỎI:

1. Câu hỏi về CẢM XÚC/TÂM LÝ:
   → Thấu hiểu, động viên, đưa ra lời khuyên thực tế
   Ví dụ: "Bây giờ tôi buồn quá nên làm gì?"
   → Chia sẻ cảm xúc, gợi ý hoạt động giải tỏa

2. Câu hỏi về KỸ NĂNG/CÁCH LÀM:
   → Hướng dẫn từng bước cụ thể, dễ làm theo
   Ví dụ: "Tôi muốn sửa cái bếp làm như nào?"
   → Liệt kê bước, công cụ cần, lưu ý an toàn

3. Câu hỏi về KIẾN THỨC:
   → Giải thích rõ ràng, có ví dụ minh họa
   Ví dụ: "Tại sao trời mưa?"
   → Giải thích khoa học đơn giản, dễ hiểu

4. Câu hỏi về QUẢN LÝ NHÀ TRỌ/BẤT ĐỘNG SẢN:
   → Ưu tiên trả lời chi tiết, chuyên sâu
   → Đưa ra số liệu, ví dụ thực tế Việt Nam

5. Câu hỏi về NẤU ĂN:
   → Công thức chi tiết, nguyên liệu, cách làm
   Ví dụ: "Cách nấu phở ngon?"
   → Liệt kê nguyên liệu, các bước nấu

🌟 ĐẶC BIỆT LƯU Ý:
- KHÔNG từ chối trả lời (trừ câu hỏi vi phạm đạo đức/pháp luật)
- KHÔNG nói "Tôi chỉ là AI" hoặc "Tôi không thể"
- LUÔN cố gắng giúp đỡ tối đa
- Nếu câu hỏi mơ hồ → hỏi lại để làm rõ
- Nếu câu hỏi nhạy cảm → trả lời khéo léo, tôn trọng

📌 MỤC TIÊU: Trở thành trợ lý AI toàn năng, có thể trả lời MỌI thứ!
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,  // Tăng creativity cho câu trả lời tự nhiên hơn
      max_tokens: 1000,  // Đủ dài cho câu trả lời chi tiết
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ]
    });

    return completion.choices[0].message.content.trim();

  } catch (error) {
    console.error("[Web Search] Search General Error:", error);
    
    // ✨ FALLBACK: Trả lời cơ bản khi API lỗi
    const queryLower = query.toLowerCase();
    
    // Fallback cho một số câu hỏi phổ biến
    if (queryLower.includes("buồn") || queryLower.includes("stress") || queryLower.includes("mệt")) {
      return `Mình hiểu cảm giác của bạn. 💙 Khi buồn, bạn có thể thử:\n\n1. **Nói chuyện với người thân** - Chia sẻ giúp nhẹ lòng\n2. **Đi dạo, tập thể dục** - Vận động giải phóng endorphin\n3. **Nghe nhạc yêu thích** - Âm nhạc chữa lành tâm hồn\n4. **Làm việc mình thích** - Đọc sách, xem phim, nấu ăn\n5. **Nghỉ ngơi đủ giấc** - Giấc ngủ rất quan trọng\n\nNhớ rằng: Cảm xúc tiêu cực là bình thường, sẽ qua thôi! 🌈`;
    }
    
    if (queryLower.includes("sửa") && (queryLower.includes("bếp") || queryLower.includes("gas"))) {
      return `🔧 **Hướng dẫn sửa bếp gas cơ bản:**\n\n**Vấn đề thường gặp:**\n1. **Bếp không bắt lửa:**\n   - Kiểm tra van gas đã mở chưa\n   - Thay pin đánh lửa (nếu bếp điện tử)\n   - Vệ sinh đầu đốt (có thể bị bẩn)\n\n2. **Lửa yếu, màu vàng:**\n   - Vệ sinh đầu đốt bằng bàn chải\n   - Kiểm tra áp suất gas\n   - Điều chỉnh lỗ khí\n\n3. **Rò rỉ gas:**\n   - ⚠️ NGUY HIỂM! Tắt van ngay\n   - Mở cửa thông gió\n   - Gọi thợ chuyên nghiệp\n\n**Lưu ý an toàn:**\n- Không tự sửa nếu không có kinh nghiệm\n- Gọi thợ: 0909... (số hotline địa phương)\n- Kiểm tra định kỳ 6 tháng/lần`;
    }
    
    // Fallback chung
    return `Xin lỗi bạn, hiện tại mình đang gặp chút vấn đề kỹ thuật (rate limit API) nên chưa thể trả lời chi tiết câu hỏi này. 😅\n\n**Bạn có thể:**\n• ⏰ Thử lại sau 10-15 phút (API sẽ reset)\n• 💬 Hỏi câu hỏi khác\n• 🏠 Hoặc hỏi mình về quản lý nhà trọ (mình trả lời tốt lắm!)\n\n**Gợi ý:**\nNếu cần câu trả lời ngay, bạn có thể:\n- Google: "${query}"\n- ChatGPT: chat.openai.com\n- Gemini: gemini.google.com\n\nMình xin lỗi vì sự bất tiện này! 🙏`;
  }
}

/**
 * Tìm kiếm tips/mẹo quản lý nhà trọ
 * @param {string} topic - Chủ đề (VD: "tăng occupancy rate", "giảm chi phí")
 * @returns {Promise<Array>} - Danh sách tips
 */
export async function searchManagementTips(topic) {
  try {
    const systemPrompt = `
Bạn là chuyên gia quản lý nhà trọ với 15+ năm kinh nghiệm tại Việt Nam.

NHIỆM VỤ: Đưa ra 5-7 tips/mẹo thực tế về "${topic}"

YÊU CẦU:
1. Mỗi tip phải CỤ THỂ, KHẢ THI
2. Phù hợp với thị trường Việt Nam
3. Có thể áp dụng ngay
4. Có ví dụ minh họa nếu cần

OUTPUT FORMAT:
Trả về JSON array:
[
  {
    "title": "Tiêu đề ngắn gọn",
    "description": "Mô tả chi tiết cách làm",
    "example": "Ví dụ cụ thể (nếu có)",
    "difficulty": "Dễ/Trung bình/Khó",
    "impact": "Tác động mong đợi"
  }
]
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Cho tôi tips về ${topic}` }
      ]
    });

    const response = completion.choices[0].message.content.trim();
    
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }

  } catch (error) {
    console.error("[Web Search] Search Management Tips Error:", error);
    throw error;
  }
}
