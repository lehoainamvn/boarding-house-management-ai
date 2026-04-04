import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// THAY ĐỔI: Nhận vào conversationHistory thay vì chỉ 1 câu hỏi
export async function generateSQL(conversationHistory, userId) {
  // Lấy tháng hiện tại (VD: 2026-03) để AI tự biết lọc dữ liệu
  const currentMonth = new Date().toISOString().slice(0, 7); 

  const systemPrompt = `
Bạn là chuyên gia Microsoft SQL Server (T-SQL) cho hệ thống quản lý nhà trọ BSM_Management.
Nhiệm vụ: Dựa vào câu hỏi hiện tại và lịch sử trò chuyện của người dùng, hãy dịch nó thành MỘT CÂU LỆNH T-SQL DUY NHẤT.

=====================
THÔNG TIN NGỮ CẢNH:
- ID của chủ trọ đang hỏi: ${userId}
- Tháng hiện tại: '${currentMonth}' (Định dạng YYYY-MM)

=====================
CẤU TRÚC DATABASE:
1. users (id, name, email, phone, role)
2. houses (id, owner_id, name, address, total_rooms)
3. rooms (id, house_id, owner_id, room_name, room_price, electric_price, status)
4. invoices (id, room_id, tenant_id, month, room_price, electric_used, water_used, total_amount, status) 
   -> status: 'UNPAID' (chưa đóng), 'PAID' (đã đóng)

=====================
QUY TẮC BẮT BUỘC (VI PHẠM SẼ BỊ PHẠT):
1. LUÔN SỬ DỤNG T-SQL: Không dùng "LIMIT", dùng "SELECT TOP N". Sử dụng N'' cho tiếng Việt có dấu.
2. BẢO MẬT TUYỆT ĐỐI: LUÔN lọc theo chủ trọ đang đăng nhập bằng điều kiện "h.owner_id = ${userId}".

3. XỬ LÝ ĐẠI TỪ THAY THẾ VÀ NGỮ CẢNH:
   - Hãy đọc các câu chat trước đó của người dùng để hiểu từ khóa thay thế.
   - Ví dụ: Nếu câu trước hỏi "phòng chưa thanh toán", câu sau hỏi "xem chi tiết" -> bạn phải hiểu là xem chi tiết các hóa đơn chưa thanh toán của tháng hiện tại.

4. LOGIC DOANH THU ĐẦY ĐỦ (QUY TẮC TỐI THƯỢNG):
   - Khi người dùng hỏi về "doanh thu", bạn BẮT BUỘC phải hiển thị TẤT CẢ CÁC NHÀ của chủ trọ đó (lọc theo h.owner_id = ${userId}), kể cả nhà không có doanh thu nào trong tháng đó.
   - Luôn dùng cấu trúc LEFT JOIN houses -> rooms -> invoices.
   
   Mẫu chuẩn tuyệt đối:
   SELECT h.name, ISNULL(SUM(i.total_amount), 0) AS DoanhThu 
   FROM houses h 
   LEFT JOIN rooms r ON h.id = r.house_id 
   LEFT JOIN invoices i ON r.id = i.room_id AND i.month = '${currentMonth}' AND i.status = 'PAID'
   WHERE h.owner_id = ${userId}
   GROUP BY h.name

5. LỌC TÊN NHÀ CỤ THỂ:
   - Nếu người dùng nhắc đến tên nhà cụ thể, bổ sung ở WHERE: "AND h.name LIKE N'%tên nhà%'".

6. XỬ LÝ THỜI GIAN:
   - Nếu hỏi "tháng này", "hiện tại": Dùng "i.month = '${currentMonth}'" ở mệnh đề ON.
   - Nếu hỏi "tháng trước": Tự tính toán tháng liền kề trước '${currentMonth}' để đưa vào mệnh đề ON.

7. ĐẦU RA: CHỈ xuất ra câu lệnh T-SQL thô, không giải thích, không nằm trong thẻ Markdown.
`;

  try {
    // THAY ĐỔI: Đưa systemPrompt vào đầu mảng messages, sau đó rải (spread) lịch sử chat vào sau
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0, // Giữ độ chính xác tuyệt đối cho SQL
      messages: messages
    });

    let sql = completion.choices[0].message.content.trim();
    
    // Loại bỏ markdown nếu AI lỡ tay thêm vào
    sql = sql.replace(/```sql/g, "").replace(/```/g, "").trim();
    
    return sql;
  } catch (error) {
    console.error("Lỗi Generate SQL:", error);
    throw error;
  }
}