import sql from "mssql";
import { poolPromise } from "../config/db.js";

import { createMeterReading } from "../repositories/meter.repo.js";
import { createInvoiceRepo } from "../repositories/invoice.repo.js";
import { getMeterHistoryRepo } from "../repositories/meter.repo.js";
import { createNotification } from "./notification.service.js"; // Đảm bảo file này nằm cùng thư mục services

export function getMeterHistoryService(ownerId, year, month, roomId) {
  return getMeterHistoryRepo(ownerId, year, month, roomId);
}

/*
  Ghi chỉ số + tạo hóa đơn
*/
export async function inputMeterAndCreateInvoice(roomId, payload) {
  const pool = await poolPromise;

  // 1️⃣ Lấy thông tin phòng
  const roomRes = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`SELECT * FROM rooms WHERE id = @room_id`);

  const room = roomRes.recordset[0];
  if (!room) throw new Error("Không tìm thấy phòng");

  // 2️⃣ Lấy tenant đang thuê
  const tenantRes = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT TOP 1 tenant_id
      FROM tenant_rooms
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  if (tenantRes.recordset.length === 0) {
    throw new Error("Phòng chưa có người thuê");
  }

  const tenantId = tenantRes.recordset[0].tenant_id;

  // 3️⃣ Tính toán
  const electric_used = payload.electric_new - payload.electric_old;
  const water_used = payload.water_new - payload.water_old;

  const electric_cost = electric_used * room.electric_price;
  const water_cost = water_used * room.water_price;

  const total_amount = room.room_price + electric_cost + water_cost;

  // 4️⃣ Lưu chỉ số điện nước
  await createMeterReading(roomId, payload);

  // 5️⃣ Tạo hóa đơn
  await createInvoiceRepo({
    room_id: roomId,
    tenant_id: tenantId,
    month: payload.month,
    room_price: room.room_price,
    electric_used,
    water_used,
    electric_cost,
    water_cost,
    total_amount
  });

  // 6️⃣ Tạo thông báo hóa đơn mới cho người thuê
  try {
    const formattedMoney = new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(total_amount);

    // Đã có await ở đây để xử lý đồng bộ chính xác
    await createNotification({
      user_id: tenantId,
      title: "Hóa đơn mới",
      content: `Hóa đơn tháng ${payload.month} của phòng ${room.room_name} đã được tạo. Tổng tiền: ${formattedMoney}.`
    });

    console.log("🔔 Đã xử lý thông báo thành công cho tenant:", tenantId);
  } catch (error) {
    console.error("❌ Lỗi khi thực thi tạo thông báo:", error);
  }
}
