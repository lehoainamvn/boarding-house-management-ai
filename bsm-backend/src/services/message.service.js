import {
  getMessagesByRoom,
  sendMessageRepo,
  getOwnerRooms
} from "../repositories/messageRepository.js";

import { poolPromise } from "../config/db.js";
export function getMessagesService(roomId) {
  return getMessagesByRoom(roomId);
}

export function getOwnerRoomsService(ownerId) {
  return getOwnerRooms(ownerId);
}

export async function sendMessageService(data) {
  if (!data.content) {
    throw new Error("Tin nhắn trống");
  }

  // 1. Lưu tin nhắn vào bảng messages
  const message = await sendMessageRepo(data);

  // 2. TỰ ĐỘNG LƯU THÔNG BÁO CHO NGƯỜI NHẬN
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Tìm tên người gửi để hiển thị trong nội dung thông báo (tùy chọn)
    const senderInfo = await pool.request()
      .input("id", data.sender_id)
      .query("SELECT name FROM users WHERE id = @id");
    const senderName = senderInfo.recordset[0]?.name || "Ai đó";

    // Chèn vào bảng notifications cho người nhận (receiver_id)
    await request
      .input("user_id", data.receiver_id)
      .input("title", "Tin nhắn mới")
      .input("content", `${senderName} vừa gửi tin nhắn cho bạn.`)
      .query(`
        INSERT INTO notifications (user_id, title, content, is_read, created_at)
        VALUES (@user_id, @title, @content, 0, GETDATE())
      `);
      
    console.log("✅ Đã lưu thông báo tin nhắn vào DB");
  } catch (err) {
    console.error("❌ Lỗi lưu thông báo tự động:", err.message);
    // Không throw error ở đây để tránh làm gián đoạn việc gửi tin nhắn chính
  }

  return message;
}

export async function getTenantRoomService(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenant_id", tenantId)
    .query(`
      SELECT TOP 1 r.id, r.owner_id
      FROM tenant_rooms tr
      JOIN rooms r ON r.id = tr.room_id
      WHERE tr.tenant_id = @tenant_id
      ORDER BY tr.start_date DESC
    `);

  return result.recordset[0];
}