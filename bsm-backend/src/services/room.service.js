import {
  getRoomsByHouse,
  getRoomById,
  updateRoom,
  createRoom,
  getCurrentTenantByRoom,
  deleteRoom
} from "../repositories/roomRepository.js";
import { getSettingsByOwner } from "../repositories/settingsRepository.js";
import { createNotification } from "./notification.service.js";
import sql, { poolPromise } from "../config/db.js";

export async function deleteRoomService(ownerId, roomId) {
  const pool = await poolPromise;

  // Kiểm tra hóa đơn chưa thanh toán
  const unpaidInvoices = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT COUNT(*) as count
      FROM invoices
      WHERE room_id = @room_id
        AND status != 'PAID'
    `);

  if (unpaidInvoices.recordset[0].count > 0) {
    throw new Error("Không thể xóa phòng vì còn hóa đơn chưa thanh toán");
  }

  const success = await deleteRoom(ownerId, roomId);
  if (!success) {
    throw new Error("Không thể xóa phòng (có thể đang có người thuê)");
  }
}
export async function createRoomService(ownerId, data) {
  if (!data.room_name) {
    throw new Error("Thiếu tên phòng");
  }

  const pool = await poolPromise;
  const houseId = Number(data.house_id);

  // 1. Lấy giới hạn số phòng (total_rooms) từ bảng houses
  const houseResult = await pool.request()
    .input("house_id", sql.Int, houseId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT total_rooms 
      FROM houses 
      WHERE id = @house_id AND owner_id = @owner_id
    `);

  if (houseResult.recordset.length === 0) {
    throw new Error("Không tìm thấy thông tin nhà trọ");
  }

  const limit = houseResult.recordset[0].total_rooms;

  // 2. Đếm số lượng phòng hiện tại của nhà này
  const currentCountResult = await pool.request()
    .input("house_id", sql.Int, houseId)
    .query(`
      SELECT COUNT(*) as count 
      FROM rooms 
      WHERE house_id = @house_id
    `);

  const currentCount = currentCountResult.recordset[0].count;

  // 3. Chặn nếu đã đạt hoặc vượt quá giới hạn
  if (currentCount >= limit) {
    throw new Error(`Nhà này đã đạt giới hạn tối đa ${limit} phòng. Không thể tạo thêm.`);
  }

  // 4. Kiểm tra trùng tên phòng (giữ nguyên logic cũ của bạn)
  const existingRoom = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("house_id", sql.Int, houseId)
    .input("room_name", sql.NVarChar(50), data.room_name.trim())
    .query(`
      SELECT COUNT(*) as count
      FROM rooms
      WHERE owner_id = @owner_id
        AND house_id = @house_id
        AND room_name = @room_name
    `);

  if (existingRoom.recordset[0].count > 0) {
    throw new Error("Tên phòng đã tồn tại trong nhà này");
  }

  // 5. Nếu mọi thứ hợp lệ, lấy giá mặc định nếu không có giá cụ thể
  const settings = await getSettingsByOwner(ownerId);

  const payload = {
    ...data,
    room_price: data.room_price === undefined || data.room_price === null || data.room_price === ""
      ? settings?.default_room_price ?? 0
      : data.room_price,
    electric_price: data.electric_price === undefined || data.electric_price === null || data.electric_price === ""
      ? settings?.default_electric_price ?? 0
      : data.electric_price,
    water_price: data.water_price === undefined || data.water_price === null || data.water_price === ""
      ? settings?.default_water_price ?? 0
      : data.water_price,
  };

  return createRoom(ownerId, payload);
}
/* =========================
   DANH SÁCH PHÒNG
========================= */
export async function getRoomsByHouseService(ownerId, houseId) {
  return getRoomsByHouse(ownerId, houseId);
}

/* =========================
   CHI TIẾT PHÒNG + NGƯỜI THUÊ
========================= */
export async function getRoomDetailService(ownerId, roomId) {
  const room = await getRoomById(ownerId, roomId);
  if (!room) {
    throw new Error("Không tìm thấy phòng");
  }

  const tenant = await getCurrentTenantByRoom(roomId);

  return {
    ...room,
    tenant
  };
}

/* =========================
   UPDATE PHÒNG
========================= */
export async function updateRoomService(ownerId, roomId, data) {
  const pool = await poolPromise;
  
  // 1. Lấy thông tin giá cũ trước khi update (để so sánh hoặc chỉ để lấy thông tin phòng)
  const oldRoomRes = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`SELECT room_name, room_price, electric_price, water_price FROM rooms WHERE id = @room_id`);
    
  const oldRoom = oldRoomRes.recordset[0];

  // 2. Tiến hành update phòng (giữ nguyên hàm repo cũ của bạn)
  const result = await updateRoom(ownerId, roomId, data);

  // 3. Tìm xem phòng này có người đang thuê không
  const tenantRes = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT TOP 1 tenant_id 
      FROM tenant_rooms 
      WHERE room_id = @room_id AND end_date IS NULL
    `);

  // 4. Nếu có người thuê, tiến hành tạo thông báo cho họ
  if (tenantRes.recordset.length > 0) {
    const tenantId = tenantRes.recordset[0].tenant_id;
    
    // Tạo nội dung thông báo linh hoạt dựa trên dữ liệu gửi lên
    let changes = [];
    if (data.room_price && Number(data.room_price) !== Number(oldRoom.room_price)) changes.push(`giá phòng`);
    if (data.electric_price && Number(data.electric_price) !== Number(oldRoom.electric_price)) changes.push(`giá điện`);
    if (data.water_price && Number(data.water_price) !== Number(oldRoom.water_price)) changes.push(`giá nước`);

    if (changes.length > 0) {
      await createNotification({
        user_id: tenantId,
        title: "Cập nhật giá dịch vụ",
        content: `Chủ trọ vừa cập nhật ${changes.join(", ")} cho phòng ${oldRoom.room_name} của bạn.`
      });
    }
  }

  return result;
}

import { assignTenantToRoomRepo } from "../repositories/roomRepository.js";

export async function assignTenantService(ownerId, roomId, tenantId) {
  await assignTenantToRoomRepo(ownerId, roomId, tenantId);
}