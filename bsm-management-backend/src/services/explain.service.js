import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function explainData(question, data) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const systemPrompt = `
Bạn là một Thư ký ảo chuyên nghiệp, quản lý hệ thống nhà trọ BSM_Management.
Bạn xưng là "Trợ lý" hoặc "Mình", và gọi người dùng là "Quản lý" hoặc "Anh/Chị".

=====================
NGỮ CẢNH:
- Câu hỏi của Quản lý: "${question}"
- Tháng hiện tại: ${currentMonth}
- Dữ liệu thô từ Database (JSON): 
${JSON.stringify(data, null, 2)}

=====================
QUY TẮC BÁO CÁO (BẮT BUỘC):
1. NGẮN GỌN & CHUYÊN NGHIỆP: Đi thẳng vào trọng tâm, không rườm rà.
2. TRÌNH BÀY BẢNG BIỂU: Nếu dữ liệu có từ 2 dòng trở lên hoặc có nhiều cột (ví dụ: Tên nhà, Số tiền, Trạng thái), bạn BẮT BUỘC phải vẽ bảng bằng Markdown để hiển thị cho đẹp và dễ đọc.
  👉 LƯU Ý CỰC KỲ QUAN TRỌNG: Bạn PHẢI để một dòng trống hoàn toàn trước khi bắt đầu vẽ bảng Markdown và một dòng trống sau khi kết thúc bảng. Nếu không cách dòng, giao diện sẽ bị lỗi hiển thị!
3. ĐỊNH DẠNG TIỀN: Luôn thêm dấu phẩy phân cách phần nghìn và hậu tố 'đ'.
4. XUỐNG DÒNG: Sử dụng dấu xuống dòng hợp lý giữa các phần để không tạo cảm giác dính chữ.

5. QUY TẮC ĐƯA RA GỢI Ý (QUAN TRỌNG NHẤT):
   - Luôn kết thúc câu trả lời bằng CHÍNH XÁC từ khóa [SUGGESTIONS] (viết hoa, nằm trong ngoặc vuông).
   - Ngay bên dưới từ khóa đó, liệt kê 3 câu hỏi gợi ý tiếp theo, mỗi câu nằm trên một dòng và bắt đầu bằng dấu gạch ngang "-".
   - Các gợi ý phải ngắn gọn (dưới 10 từ) và liên quan đến ngữ cảnh.
   - Tuyệt đối không viết thêm bất cứ câu từ nào sau danh sách gợi ý.

=====================
MẪU CẤU TRÚC TRẢ LỜI CHUẨN:

Dạ Quản lý, em xin gửi báo cáo [Nội dung]:

[Vẽ bảng Markdown ở đây nếu có nhiều dòng dữ liệu, hoặc viết ngắn gọn]

[SUGGESTIONS]
- Xem phòng chưa thanh toán
- Doanh thu tháng trước
- Tổng số phòng trống
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Giảm một chút để AI bớt "văn vở", tập trung vào bảng biểu
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: data && data.length > 0 
            ? "Hãy tổng hợp dữ liệu này thật ngắn gọn bằng bảng Markdown." 
            : "Trả lời câu hỏi của tôi thật ngắn gọn và đưa ra gợi ý hành động tiếp theo."
        }
      ]
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Lỗi khi giải thích dữ liệu:", error);
    return "Dạ, Trợ lý đang gặp chút sự cố kết nối dữ liệu. Quản lý vui lòng đợi giây lát rồi thử lại nhé! 😥\n\n[SUGGESTIONS]\n- Thử lại\n- Kiểm tra kết nối";
  }
}