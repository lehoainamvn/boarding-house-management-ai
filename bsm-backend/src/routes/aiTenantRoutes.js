import express from "express";
import { poolPromise } from "../config/db.js";
import { askGroq } from "../services/groq.service.js"; 

const router = express.Router();

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

router.post("/chat", async (req, res) => {
  try {
    const { question, userId } = req.body;
    const pool = await poolPromise;

    /* ===== 1. LƯU TIN NHẮN CỦA USER ===== */
    await saveChatMessage(pool, userId, "user", question);

    /* ===== 2. LẤY NGỮ CẢNH (GỒM CẢ THÔNG TIN CHỦ TRỌ) ===== */
    const userRes = await pool.request().input("id", userId).query(`SELECT name, email, phone FROM users WHERE id=@id`);
    const u = userRes.recordset[0] || {};

    // ĐÃ SỬA: JOIN thêm bảng users (o) để lấy thông tin Owner (Chủ trọ)
    const roomRes = await pool.request().input("tenantId", userId).query(`
      SELECT 
        r.room_name, h.name AS house_name, h.address,
        o.name AS owner_name, o.phone AS owner_phone
      FROM tenant_rooms tr
      JOIN rooms r ON tr.room_id = r.id
      JOIN houses h ON r.house_id = h.id
      JOIN users o ON h.owner_id = o.id
      WHERE tr.tenant_id = @tenantId AND tr.end_date IS NULL
    `);
    const room = roomRes.recordset[0];

    const invoiceRes = await pool.request().input("tenantId", userId).query(`
      SELECT TOP 1 month, total_amount, status 
      FROM invoices WHERE tenant_id = @tenantId ORDER BY month DESC
    `);
    const invoice = invoiceRes.recordset[0];

    let meter = null;
    if (room) {
      const meterRes = await pool.request().input("tenantId", userId).query(`
        SELECT TOP 1 m.month, m.electric_old, m.electric_new, m.water_old, m.water_new
        FROM meter_readings m
        JOIN tenant_rooms tr ON m.room_id = tr.room_id
        WHERE tr.tenant_id = @tenantId
        ORDER BY m.month DESC
      `);
      meter = meterRes.recordset[0];
    }

    /* ===== 3. DỰNG PROMPT CHUYÊN NGHIỆP HƠN ===== */
    let contextStr = `THÔNG TIN NGƯỜI THUÊ:
- Tên khách: ${u.name} (SĐT: ${u.phone})`;

    if (room) {
      contextStr += `\n- Đang thuê: ${room.room_name} (Khu: ${room.house_name}, Địa chỉ: ${room.address})`;
      contextStr += `\n- THÔNG TIN CHỦ TRỌ QUẢN LÝ: Tên: ${room.owner_name}, SĐT liên hệ: ${room.owner_phone || "Chưa có"}.`;
    } else {
      contextStr += `\n- Hiện tại khách chưa thuê phòng nào.`;
    }

    if (invoice) {
      contextStr += `\n- Hóa đơn mới nhất (Tháng ${invoice.month}): ${invoice.total_amount} VNĐ - Trạng thái: ${invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}.`;
    }

    if (meter) {
      const elUsed = meter.electric_new - meter.electric_old;
      const waUsed = meter.water_new - meter.water_old;
      contextStr += `\n- Điện nước mới nhất (Tháng ${meter.month}): Dùng ${elUsed} kWh điện, ${waUsed} m3 nước.`;
    }

    const systemPrompt = `
Bạn là trợ lý ảo thân thiện hỗ trợ khách thuê trọ. Xưng "Mình" và gọi khách là "Bạn".
DỮ LIỆU HIỆN TẠI CỦA KHÁCH:
${contextStr}

Nhiệm vụ:
1. Dựa CỤC KỲ CHÍNH XÁC vào dữ liệu trên để trả lời.
2. NẾU KHÁCH HỎI THÔNG TIN CHỦ TRỌ (tên, sđt) hoặc cần hỗ trợ: BẮT BUỘC cung cấp "THÔNG TIN CHỦ TRỌ QUẢN LÝ" ở trên để khách liên hệ.
3. Nếu không có dữ liệu hóa đơn/điện nước (vì tháng mới chưa chốt), hãy báo nhẹ nhàng: "Hiện tại hệ thống chưa cập nhật hóa đơn/điện nước tháng này. Bạn có thể liên hệ trực tiếp chủ trọ là anh/chị [Tên chủ trọ] qua SĐT [SĐT chủ trọ] để hỏi thêm nhé!".
4. Trình bày đẹp mắt, lịch sự, có emoji.

Câu hỏi của khách: "${question}"
`;

    /* ===== 4. GỌI AI VÀ TRẢ KẾT QUẢ ===== */
    const answer = await askGroq(systemPrompt);
    
    // Gợi ý thông minh (Thay đổi tùy theo việc có hóa đơn hay chưa)
    const suggestions = invoice ? ["Chi tiết hóa đơn", "Thông tin chủ trọ", "Địa chỉ phòng"] : ["Thông tin chủ trọ", "Số điện nước", "Địa chỉ phòng"];

    await saveChatMessage(pool, userId, "assistant", answer);

    return res.json({ answer, suggestions });

  } catch (err) {
    console.error("TENANT AI ERROR:", err);
    res.status(500).json({ answer: "⚠️ Hệ thống AI đang bận. Bạn vui lòng thử lại sau nhé." });
  }
});

export default router;