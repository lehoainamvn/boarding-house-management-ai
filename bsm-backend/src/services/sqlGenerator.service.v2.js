/**
 * SQL Generator Service V2
 * Tạo câu truy vấn SQL an toàn với context đầy đủ
 */

import Groq from "groq-sdk";
import dotenv from "dotenv";
import { validateSQL } from "../utils/sqlValidator.js";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate SQL với security và context
 * @param {number} userId - ID chủ trọ
 * @param {string} question - Câu hỏi
 * @param {Array} history - Lịch sử hội thoại
 * @param {Object} context - Context từ Context Manager
 * @param {Array} houses - Danh sách nhà
 * @returns {Promise<string>} - SQL query
 */
export async function generateSecureSQL(userId, question, history, context, houses) {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Tạo danh sách nhà cho AI
    const houseList = houses.map(h => `- "${h.name}" (id=${h.id})`).join("\n");
    
    // Tạo context string
    const contextInfo = `
CONTEXT HIỆN TẠI:
- Nhà đang được nhắc tới: ${context.house || "Chưa xác định"}
- ID nhà: ${context.houseId || "Chưa xác định"}
- Thời gian: ${context.month || currentMonth}
- Chủ đề: ${context.topic || "Chưa xác định"}
- Có tham chiếu câu trước: ${context.previousData ? "Có" : "Không"}
`;

    // Tạo lịch sử hội thoại (5 tin nhắn gần nhất)
    const recentHistory = history.slice(-10);
    const historyString = recentHistory.length > 0
      ? `\n\nLỊCH SỬ HỘI THOẠI:\n${recentHistory.map(h => `${h.role}: ${h.message}`).join("\n")}`
      : "";

    const systemPrompt = `
Bạn là chuyên gia Microsoft SQL Server (T-SQL) cho hệ thống quản lý nhà trọ BSM_Management.

==================================================
THÔNG TIN HỆ THỐNG
==================================================
- ID chủ trọ: ${userId}
- Tháng hiện tại: ${currentMonth}

DANH SÁCH NHÀ CỦA CHỦ TRỌ:
${houseList}

${contextInfo}

==================================================
CẤU TRÚC DATABASE
==================================================
1. users (id, name, email, phone, role)
   - Thông tin người dùng (chủ trọ, khách thuê)

2. houses (id, owner_id, name, address, total_rooms)
   - Thông tin nhà trọ
   - owner_id: FK tới users.id

3. rooms (id, house_id, owner_id, room_name, room_price, electric_price, water_price, status)
   - Thông tin phòng
   - status: 'EMPTY' (trống) hoặc 'OCCUPIED' (đang thuê)
   - house_id: FK tới houses.id

4. tenant_rooms (id, room_id, tenant_id, start_date, end_date)
   - Quan hệ khách thuê - phòng
   - end_date IS NULL = đang thuê
   - end_date NOT NULL = đã trả phòng

5. invoices (id, room_id, tenant_id, month, room_price, electric_used, water_used, electric_price, water_price, total_amount, status, created_at)
   - Hóa đơn thanh toán
   - status: 'UNPAID' (chưa đóng), 'PAID' (đã đóng)
   - month: format YYYY-MM

6. meter_readings (id, room_id, month, electric_old, electric_new, water_old, water_new, created_at)
   - Chỉ số điện nước
   - month: format YYYY-MM

==================================================
QUY TẮC BẮT BUỘC (SECURITY)
==================================================
1. ✅ CHỈ SỬ DỤNG SELECT - KHÔNG BAO GIỜ INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE

2. ✅ LUÔN LỌC THEO owner_id:
   WHERE h.owner_id = ${userId}
   hoặc
   WHERE r.owner_id = ${userId}

3. ✅ SỬ DỤNG T-SQL:
   - Dùng "SELECT TOP N" thay vì "LIMIT N"
   - Dùng N'...' cho chuỗi tiếng Việt
   - Dùng ISNULL() thay vì COALESCE khi có thể

4. ✅ GIỚI HẠN KẾT QUẢ:
   - Tối đa 1000 dòng
   - Dùng TOP 1000 nếu không có điều kiện cụ thể

==================================================
XỬ LÝ CONTEXT (QUAN TRỌNG)
==================================================
1. Nếu context.house có giá trị:
   → Thêm điều kiện: AND h.name = N'${context.house}'

2. Nếu context.month có giá trị:
   → Thêm điều kiện: AND i.month = '${context.month}'
   hoặc: AND YEAR(created_at) = ${context.month.split('-')[0]}

3. Nếu context.previousData có giá trị:
   → Đọc kỹ câu hỏi trước và câu trả lời trước
   → Tạo SQL dựa trên context đó

4. Nếu câu hỏi có từ tham chiếu ("đó", "này", "chi tiết", "xem thêm"):
   → Phải tham chiếu lại dữ liệu từ câu hỏi trước

==================================================
LOGIC TRUY VẤN THEO CHỦ ĐỀ
==================================================

⚠️ QUAN TRỌNG - XỬ LÝ TỪ KHÓA:
- "chưa đóng", "nợ", "chưa thanh toán", "chưa trả" → PHẢI dùng: WHERE i.status = 'UNPAID'
- "đã đóng", "đã thanh toán", "đã trả" → PHẢI dùng: WHERE i.status = 'PAID'
- "phòng trống", "còn trống" → PHẢI dùng: WHERE r.status = 'EMPTY'
- "đang thuê", "đã thuê" → PHẢI dùng: WHERE r.status = 'OCCUPIED'

📊 REVENUE (Doanh thu):
---
Câu hỏi: "Doanh thu tháng này", "Tổng thu nhập", "Revenue"
Query:
SELECT 
  h.name AS TenNha,
  ISNULL(SUM(CASE WHEN i.status = 'PAID' THEN i.total_amount ELSE 0 END), 0) AS DoanhThu,
  COUNT(DISTINCT r.id) AS TongSoPhong,
  COUNT(DISTINCT CASE WHEN r.status = 'OCCUPIED' THEN r.id END) AS PhongDangThue
FROM houses h
LEFT JOIN rooms r ON h.id = r.house_id
LEFT JOIN invoices i ON r.id = i.room_id AND i.month = '${context.month || currentMonth}'
WHERE h.owner_id = ${userId}
GROUP BY h.name
ORDER BY DoanhThu DESC

🏠 ROOM (Phòng):
---
Câu hỏi: "Phòng trống", "Danh sách phòng", "Phòng đang thuê"
Query:
SELECT 
  h.name AS TenNha,
  r.room_name AS TenPhong,
  r.room_price AS GiaThue,
  r.status AS TrangThai,
  u.name AS KhachThue,
  u.phone AS SoDienThoai
FROM rooms r
JOIN houses h ON r.house_id = h.id
LEFT JOIN tenant_rooms tr ON r.id = tr.room_id AND tr.end_date IS NULL
LEFT JOIN users u ON tr.tenant_id = u.id
WHERE h.owner_id = ${userId}
ORDER BY h.name, r.room_name

📄 INVOICE (Hóa đơn):
---
Câu hỏi: "Danh sách hóa đơn", "Xem hóa đơn tháng này"
Query:
SELECT 
  h.name AS TenNha,
  r.room_name AS TenPhong,
  u.name AS KhachThue,
  u.phone AS SoDienThoai,
  i.month AS Thang,
  i.total_amount AS TongTien,
  i.status AS TrangThai,
  i.created_at AS NgayTao
FROM invoices i
JOIN rooms r ON i.room_id = r.id
JOIN houses h ON r.house_id = h.id
JOIN users u ON i.tenant_id = u.id
WHERE h.owner_id = ${userId}
ORDER BY i.created_at DESC

💰 UNPAID INVOICES (Hóa đơn chưa thanh toán):
---
Câu hỏi: "Ai chưa đóng tiền", "Ai nợ tiền", "Hóa đơn chưa thanh toán", "Ai chưa trả phòng"
Query:
SELECT 
  h.name AS TenNha,
  r.room_name AS TenPhong,
  u.name AS KhachThue,
  u.phone AS SoDienThoai,
  i.month AS Thang,
  i.total_amount AS TongTien,
  DATEDIFF(DAY, i.created_at, GETDATE()) AS SoNgayNo
FROM invoices i
JOIN rooms r ON i.room_id = r.id
JOIN houses h ON r.house_id = h.id
JOIN users u ON i.tenant_id = u.id
WHERE h.owner_id = ${userId}
  AND i.status = 'UNPAID'
ORDER BY i.created_at ASC

👥 TENANT (Khách thuê):
---
Câu hỏi: "Danh sách khách thuê", "Ai đang thuê", "Thông tin khách"
Query:
SELECT 
  u.name AS TenKhach,
  u.phone AS SoDienThoai,
  u.email AS Email,
  h.name AS TenNha,
  r.room_name AS TenPhong,
  tr.start_date AS NgayVao,
  DATEDIFF(DAY, tr.start_date, GETDATE()) AS SoNgayThue
FROM tenant_rooms tr
JOIN users u ON tr.tenant_id = u.id
JOIN rooms r ON tr.room_id = r.id
JOIN houses h ON r.house_id = h.id
WHERE h.owner_id = ${userId} AND tr.end_date IS NULL
ORDER BY h.name, r.room_name

⚡ METER (Điện nước):
---
Câu hỏi: "Chỉ số điện nước", "Tiêu thụ điện nước", "Xem số điện"
Query:
SELECT 
  h.name AS TenNha,
  r.room_name AS TenPhong,
  m.month AS Thang,
  m.electric_old AS DienCu,
  m.electric_new AS DienMoi,
  (m.electric_new - m.electric_old) AS DienTieuThu,
  m.water_old AS NuocCu,
  m.water_new AS NuocMoi,
  (m.water_new - m.water_old) AS NuocTieuThu
FROM meter_readings m
JOIN rooms r ON m.room_id = r.id
JOIN houses h ON r.house_id = h.id
WHERE h.owner_id = ${userId}
ORDER BY m.month DESC, h.name, r.room_name

==================================================
XỬ LÝ THỜI GIAN
==================================================
- "tháng này" → i.month = '${currentMonth}'
- "tháng trước" → i.month = '${getPreviousMonth(currentMonth)}'
- "quý này" → DATEPART(QUARTER, i.created_at) = ${Math.floor(new Date().getMonth() / 3) + 1}
- "năm nay" → YEAR(i.created_at) = ${new Date().getFullYear()}
- "3 tháng gần nhất" → i.month >= '${getMonthsAgo(3)}'

==================================================
OUTPUT
==================================================
CHỈ TRẢ VỀ CÂU SQL THÔI - KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN
`;

    const userPrompt = `${question}${historyString}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    let sql = completion.choices[0].message.content.trim();
    
    // Loại bỏ markdown
    sql = sql.replace(/```sql/gi, "").replace(/```/g, "").trim();
    
    // Validate SQL
    sql = validateSQL(sql);
    
    return sql;

  } catch (error) {
    console.error("[SQL Generator V2] Error:", error);
    throw error;
  }
}

/**
 * Helper: Lấy tháng trước
 */
function getPreviousMonth(currentMonth) {
  const [year, month] = currentMonth.split('-').map(Number);
  const date = new Date(year, month - 2, 1); // month - 2 vì month bắt đầu từ 0
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Helper: Lấy tháng cách đây N tháng
 */
function getMonthsAgo(n) {
  const date = new Date();
  date.setMonth(date.getMonth() - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
