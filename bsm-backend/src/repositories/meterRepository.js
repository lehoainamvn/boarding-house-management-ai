import sql from "mssql";
import { poolPromise } from "../config/db.js";

export async function createMeterReading(roomId, data) {
  const pool = await poolPromise;

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("month", sql.NVarChar, data.month)
    .input("electric_old", sql.Int, data.electric_old)
    .input("electric_new", sql.Int, data.electric_new)
    .input("water_old", sql.Int, data.water_old)
    .input("water_new", sql.Int, data.water_new)
    .query(`
      INSERT INTO meter_readings
      (room_id, month, electric_old, electric_new, water_old, water_new)
      VALUES
      (@room_id, @month, @electric_old, @electric_new, @water_old, @water_new)
    `);
}

export async function getMeterReadingByRoomAndMonth(roomId, month) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("month", sql.NVarChar(7), month)
    .query(`
      SELECT electric_old, electric_new, water_old, water_new
      FROM meter_readings
      WHERE room_id = @room_id
        AND month = @month
    `);

  return result.recordset[0] || null;
}

export async function getMeterHistoryRepo(ownerId, year, month, houseId) {
  const pool = await poolPromise;

  let monthCondition = "";
  let houseCondition = "";
  
  if (month) {
    monthCondition = "AND MONTH(m.created_at) = @month";
  }
  
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("year", sql.Int, year);

  if (month) {
    request.input("month", sql.Int, month);
  }
  
  if (houseId) {
    request.input("house_id", sql.Int, houseId);
  }

  const result = await request.query(`
    SELECT
      r.id AS room_id,
      r.room_name,
      r.water_type,
      r.people_count,

      m.month,
      m.electric_old,
      m.electric_new,
      (m.electric_new - m.electric_old) AS electric_used,

      CASE 
        WHEN r.water_type = 'METER'
          THEN m.water_new - m.water_old
        ELSE r.people_count
      END AS water_used,

      m.created_at
    FROM meter_readings m
    JOIN rooms r ON m.room_id = r.id
    WHERE r.owner_id = @owner_id
      AND YEAR(m.created_at) = @year
      ${monthCondition}
      ${houseCondition}
    ORDER BY r.room_name, m.created_at DESC
  `);

  return result.recordset;
}