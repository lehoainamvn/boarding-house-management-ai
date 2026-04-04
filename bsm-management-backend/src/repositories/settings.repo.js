import sql from "mssql";
import { poolPromise } from "../config/db.js";


// Lấy cài đặt (Cập nhật query để lấy thêm default_room_price)
export async function getSettingsByOwner(ownerId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .query(`SELECT billing_day, default_electric_price, default_water_price, default_room_price 
            FROM settings WHERE owner_id = @owner_id`);
  return result.recordset[0];
}

// Cập nhật cài đặt
export async function updateSettingsRepo(ownerId, data) {
  const pool = await poolPromise;
  
  // 1. Cập nhật bảng Settings
  await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("billing_day", sql.Int, data.billing_day)
    .input("electric_price", sql.Decimal(12,2), data.default_electric_price)
    .input("water_price", sql.Decimal(12,2), data.default_water_price)
    .input("room_price", sql.Decimal(12,2), data.default_room_price) // Thêm giá phòng
    .query(`
      UPDATE settings
      SET billing_day = @billing_day,
          default_electric_price = @electric_price,
          default_water_price = @water_price,
          default_room_price = @room_price
      WHERE owner_id = @owner_id
    `);

  // 2. Nếu chọn "Áp dụng cho tất cả phòng"
  if (data.apply_to_all) {
    await pool.request()
      .input("owner_id", sql.Int, ownerId)
      .input("room_price", sql.Decimal(12,2), data.default_room_price)
      .input("electric_price", sql.Decimal(12,2), data.default_electric_price)
      .input("water_price", sql.Decimal(12,2), data.default_water_price)
      .query(`
        UPDATE rooms 
        SET room_price = @room_price, 
            electric_price = @electric_price, 
            water_price = @water_price 
        WHERE owner_id = @owner_id
      `);
  }
}