import {
  getRoomsByHouseService,
  getRoomDetailService,
  createRoomService,
  updateRoomService,
  deleteRoomService
} from "../services/room.service.js";

export async function deleteRoom(req, res) {
  try {
    const ownerId = req.user.id;
    const roomId = Number(req.params.id);

    await deleteRoomService(ownerId, roomId);
    res.json({ message: "Xóa phòng thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   DANH SÁCH PHÒNG
========================= */
export async function getRoomsByHouse(req, res) {
  try {
    const ownerId = req.user.id;
    const { houseId } = req.query;

    if (!houseId) {
      return res.status(400).json({ message: "Thiếu houseId" });
    }

    const rooms = await getRoomsByHouseService(ownerId, Number(houseId));
    res.json(rooms);
  } catch (err) {
    console.error("getRoomsByHouse error:", err);
    res.status(500).json({ message: err.message });
  }
}

/* =========================
   TẠO PHÒNG
========================= */
export async function createRoom(req, res) {
  try {
    const ownerId = req.user.id;
    await createRoomService(ownerId, req.body);
    res.json({ message: "Thêm phòng thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   CHI TIẾT PHÒNG
========================= */
export async function getRoomDetailController(req, res) {
  try {
    const ownerId = req.user.id;
    const roomId = Number(req.params.id);

    const room = await getRoomDetailService(ownerId, roomId);
    res.json(room);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

/* =========================
   UPDATE PHÒNG
========================= */
export async function updateRoom(req, res) {
  try {
    const ownerId = req.user.id;
    const roomId = Number(req.params.id);

    await updateRoomService(ownerId, roomId, req.body);

    res.json({ message: "Cập nhật giá thành công" });
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
}

import { assignTenantService } from "../services/room.service.js";

export async function assignTenantToRoom(req, res) {
  try {
    const ownerId = req.user.id;
    const roomId = Number(req.params.id);
    const { tenant_id } = req.body;

    if (!tenant_id) {
      return res.status(400).json({ message: "Thiếu tenant_id" });
    }

    await assignTenantService(ownerId, roomId, tenant_id);
    res.json({ message: "Gán người thuê thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}