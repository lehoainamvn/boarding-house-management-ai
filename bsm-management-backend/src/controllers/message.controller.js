import sql from "mssql";
import { poolPromise } from "../config/db.js";

import {
  getMessagesService,
  sendMessageService,
  getOwnerRoomsService
} from "../services/message.service.js";

/* =========================
   OWNER: LẤY DANH SÁCH PHÒNG
========================= */
export async function getOwnerRooms(req, res) {
  try {
    const ownerId = req.user.id;
    const rooms = await getOwnerRoomsService(ownerId);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* =========================
   LẤY TIN NHẮN
========================= */
export async function getMessages(req, res) {
  try {
    const roomId = Number(req.params.roomId);

    if (!roomId) {
      return res.status(400).json({ message: "roomId không hợp lệ" });
    }

    const messages = await getMessagesService(roomId);
    res.json(messages);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   GỬI TIN NHẮN
========================= */
export async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;

    if (!req.body.room_id) {
      return res.status(400).json({ message: "Thiếu room_id" });
    }

    const message = await sendMessageService({
      room_id: req.body.room_id,
      sender_id: senderId,
      receiver_id: req.body.receiver_id,
      content: req.body.content
    });

    res.json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   TENANT: LẤY PHÒNG HIỆN TẠI
========================= */
export async function getTenantRoom(req, res) {
  try {
    console.log("🔥 USER TOKEN:", req.user); // 👈 THÊM DÒNG NÀY

    const userId = req.user.id;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("tenant_id", sql.Int, userId)
      .query(`
        SELECT TOP 1 r.id, r.owner_id
        FROM tenant_rooms tr
        JOIN rooms r ON r.id = tr.room_id
        WHERE tr.tenant_id = @tenant_id
        ORDER BY tr.start_date DESC
      `);

    console.log("🔥 RESULT:", result.recordset);

    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}