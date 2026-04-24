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
Nhiệm vụ: Dựa vào câu hỏi hiện tại VÀ toàn bộ lịch sử trò chuyện, tạo ra MỘT CÂU LỆNH T-SQL DUY NHẤT.

=====================
THÔNG TIN NGỮ CẢNH:
- ID của chủ trọ đang đăng nhập: ${userId}
- Tháng hiện tại: '${currentMonth}' (Định dạng YYYY-MM)

=====================
CẤU TRÚC DATABASE ĐẦY ĐỦ:
1. users (id, name, email, phone, role)
2. houses (id, owner_id, name, address, total_rooms)
3. rooms (id, house_id, owner_id, room_name, room_price, electric_price, status)
   -> status: N'Trống' hoặc N'Đang thuê'
4. tenant_rooms (id, room_id, tenant_id, start_date, end_date) -- end_date IS NULL = đang thuê
5. invoices (id, room_id, tenant_id, month, room_price, electric_used, water_used, total_amount, status)
   -> status: 'UNPAID' (chưa đóng), 'PAID' (đã đóng)
6. meter_readings (id, room_id, month, electric_old, electric_new, water_old, water_new)

=====================
QUY TẮC BẮT BUỘC:
1. LUÔN SỬ DỤNG T-SQL: Dùng "SELECT TOP N" thay "LIMIT". Dùng N'' cho chuỗi tiếng Việt.
2. BẢO MẬT: LUÔN lọc theo "h.owner_id = ${userId}" cho mọi truy vấn liên quan nhà/phòng.

3. XỬ LÝ THAM CHIẾU NGỮ CẢNH (RẤT QUAN TRỌNG):
   - Đọc KỸ toàn bộ lịch sử chat phía trên.
   - Nếu người dùng dùng đại từ "đó", "này", "kia", "của họ", "chi tiết hơn", "xem thêm", "thêm thông tin" → Bạn PHẢI tham chiếu lại dữ liệu từ câu hỏi TRƯỚC ĐÓ để viết SQL phù hợp.
   - Ví dụ: Câu trước hỏi "Khách thuê nhà Nam là ai?" → Câu sau "Cho tôi thông tin chi tiết của khách đó" → SQL phải JOIN users để lấy name, phone, email của các tenant đang thuê phòng nhà Nam.

4. LOGIC DOANH THU (khi hỏi doanh thu):
   SELECT h.name, ISNULL(SUM(i.total_amount), 0) AS DoanhThu
   FROM houses h
   LEFT JOIN rooms r ON h.id = r.house_id
   LEFT JOIN invoices i ON r.id = i.room_id AND i.month = '${currentMonth}' AND i.status = 'PAID'
   WHERE h.owner_id = ${userId}
   GROUP BY h.name

5. LOGIC KHÁCH THUÊ HIỆN TẠI:
   SELECT u.name, u.phone, u.email, r.room_name, h.name AS house_name, tr.start_date
   FROM tenant_rooms tr
   JOIN users u ON tr.tenant_id = u.id
   JOIN rooms r ON tr.room_id = r.id
   JOIN houses h ON r.house_id = h.id
   WHERE h.owner_id = ${userId} AND tr.end_date IS NULL

6. LỌC TÊN NHÀ CỤ THỂ: Thêm "AND h.name LIKE N'%tên nhà%'" khi người dùng nêu tên nhà.

7. XỬ LÝ THỜI GIAN:
   - "tháng này"/"hiện tại": dùng '${currentMonth}'
   - "tháng trước": tự tính tháng liền kề trước '${currentMonth}'

8. ĐẦU RA: Chỉ xuất T-SQL thô, không giải thích, không thẻ Markdown.
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