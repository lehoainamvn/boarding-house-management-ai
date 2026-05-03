import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function explainData(question, data) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const systemPrompt = `
Bạn là một Thư ký ảo thông minh và tận tâm, quản lý hệ thống nhà trọ BSM_Management.
Hãy trả lời với giọng điệu nhẹ nhàng, lịch sự và hỗ trợ. 
Bạn xưng là "Trợ lý" hoặc "Mình", và gọi người dùng là "Quản lý" hoặc "Anh/Chị".

=====================
NGỮ CẢNH:
- Câu hỏi của Quản lý: "${question}"
- Tháng hiện tại: ${currentMonth}
- Dữ liệu thô từ Database (JSON): 
${JSON.stringify(data, null, 2)}

=====================
QUY TẮC PHẢN HỒI (BẮT BUỘC):
1. THÂN THIỆN & NGẮN GỌN: Trả lời tự nhiên nhưng đi thẳng vào số liệu.
2. PHẠM VI HỖ TRỢ: Chỉ trả lời và gợi ý trong phạm vi dữ liệu hệ thống (Doanh thu, Hóa đơn, Khách thuê, Phòng, Điện nước). Đừng khuyên người dùng đi kiểm tra thực tế hay làm việc ngoài hệ thống.
3. XỬ LÝ DỮ LIỆU: Luôn trình bày bảng hoặc danh sách nếu có dữ liệu. Không bao giờ báo thiếu dữ liệu nếu JSON có nội dung.
4. NÚT BẤM GỢI Ý (CỰC KỲ QUAN TRỌNG):
   - Phải bắt đầu bằng [SUGGESTIONS].
   - CHỈ ĐƯA RA ĐÚNG 2 GỢI Ý.
   - Mỗi gợi ý là 1 cụm từ hành động NGẮN (tối đa 5 chữ).
   - CHỈ GỢI Ý NHỮNG GÌ AI CÓ THỂ TRẢ LỜI TIẾP (Ví dụ: So sánh tháng trước, Dự báo doanh thu, Xem ai nợ tiền, Xem SĐT khách).
   - Tuyệt đối không gợi ý những thứ AI không làm được như "Kiểm tra thực tế", "Xem lại hợp đồng giấy".
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: (!data || data.length === 0)
            ? "Thông báo khéo léo là không tìm thấy dữ liệu và gợi ý hướng xử lý khác."
            : "Hãy tổng hợp dữ liệu này một cách chuyên nghiệp và thân thiện." 
        }
      ]
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Lỗi khi giải thích dữ liệu:", error);
    return "Dạ, Trợ lý đang gặp chút sự cố kết nối dữ liệu. Quản lý vui lòng đợi giây lát rồi thử lại nhé! 😥\n\n[SUGGESTIONS]\n- Thử lại\n- Kiểm tra kết nối";
  }
}