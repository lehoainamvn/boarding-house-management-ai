import {
  getMessagesService,
  sendMessageService,
  getOwnerRoomsService,
  getTenantRoomService
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
    console.log("🔥 USER TOKEN:", req.user); 

    const userId = req.user.id;
    const room = await getTenantRoomService(userId);

    console.log("🔥 RESULT:", room);

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}