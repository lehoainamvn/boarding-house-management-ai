import sql from "mssql";
import { poolPromise } from "../config/db.js";

/* =========================
   DANH SÁCH PHÒNG
========================= */
export async function getRoomsByHouse(ownerId, houseId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("house_id", sql.Int, houseId)
    .query(`
      SELECT 
        r.*,
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM tenant_rooms tr 
            WHERE tr.room_id = r.id 
              AND tr.end_date IS NULL
          )
          THEN 1 ELSE 0
        END AS hasTenant
      FROM rooms r
      WHERE r.owner_id = @owner_id
        AND r.house_id = @house_id
      ORDER BY r.id
    `);

  return result.recordset;
}

/* =========================
   CHI TIẾT PHÒNG
========================= */
export async function getRoomById(ownerId, roomId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT *
      FROM rooms
      WHERE id = @room_id
        AND owner_id = @owner_id
    `);

  return result.recordset[0];
}

/* =========================
   NGƯỜI ĐANG THUÊ PHÒNG
========================= */
export async function getCurrentTenantByRoom(roomId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        tr.start_date
      FROM tenant_rooms tr
      JOIN users u ON tr.tenant_id = u.id
      WHERE tr.room_id = @room_id
        AND tr.end_date IS NULL
    `);

  return result.recordset[0] || null;
}

/* =========================
   UPDATE PHÒNG
========================= */
/* =========================
   UPDATE PHÒNG (SET GIÁ)
========================= */
export async function updateRoom(ownerId, roomId, data) {
  const pool = await poolPromise;

  const roomName =
    typeof data.room_name === "string" && data.room_name.trim() !== ""
      ? data.room_name.trim()
      : null;

  const roomPrice =
    Number.isFinite(Number(data.room_price)) ? Number(data.room_price) : null;

  const electricPrice =
    Number.isFinite(Number(data.electric_price))
      ? Number(data.electric_price)
      : null;

  const waterType =
    data.water_type === "PERSON" || data.water_type === "METER"
      ? data.water_type
      : null;

  const waterPrice =
    Number.isFinite(Number(data.water_price)) ? Number(data.water_price) : null;

  const waterPricePerPerson =
    Number.isFinite(Number(data.water_price_per_person))
      ? Number(data.water_price_per_person)
      : null;

  const peopleCount =
    Number.isFinite(Number(data.people_count))
      ? Number(data.people_count)
      : null;

  const result = await pool
    .request()
    .input("room_id", sql.Int, roomId)
    .input("owner_id", sql.Int, ownerId)
    .input("room_name", sql.NVarChar(50), roomName)
    .input("room_price", sql.Decimal(12, 2), roomPrice)
    .input("electric_price", sql.Decimal(12, 2), electricPrice)
    .input("water_type", sql.NVarChar(10), waterType)
    .input("water_price", sql.Decimal(12, 2), waterPrice)
    .input("water_price_per_person", sql.Decimal(12, 2), waterPricePerPerson)
    .input("people_count", sql.Int, peopleCount)
    .query(`
      UPDATE rooms
      SET
        room_name = COALESCE(@room_name, room_name),
        room_price = COALESCE(@room_price, room_price),
        electric_price = COALESCE(@electric_price, electric_price),
        water_type = COALESCE(@water_type, water_type),
        water_price = COALESCE(@water_price, water_price),
        water_price_per_person = COALESCE(@water_price_per_person, water_price_per_person),
        people_count = COALESCE(@people_count, people_count)
      WHERE id = @room_id
        AND owner_id = @owner_id
    `);

  return result.rowsAffected[0] === 1;
}



//them phong moi
export async function createRoom(ownerId, data) {
  const pool = await poolPromise;

  await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("house_id", sql.Int, Number(data.house_id))
    .input("room_name", sql.NVarChar(50), data.room_name)
    .input("room_price", sql.Decimal(12, 2), Number(data.room_price))
    .input("electric_price", sql.Decimal(12, 2), Number(data.electric_price))
    .input("water_price", sql.Decimal(12, 2), Number(data.water_price))
    .input("status", sql.NVarChar(20), "EMPTY") // ✅ ĐÚNG DB
    .query(`
      INSERT INTO rooms (
        owner_id,
        house_id,
        room_name,
        room_price,
        electric_price,
        water_price,
        status
      )
      VALUES (
        @owner_id,
        @house_id,
        @room_name,
        @room_price,
        @electric_price,
        @water_price,
        @status
      )
    `);
}

// room.repo.js
export async function deleteRoom(ownerId, roomId) {
  const pool = await poolPromise;

  // ❌ Không cho xóa nếu đang có người thuê
  const renting = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT 1
      FROM tenant_rooms
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  if (renting.recordset.length > 0) {
    throw new Error("Không thể xóa phòng đang có người thuê");
  }

  // ✅ Xóa lịch sử thuê (đã trả)
  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      DELETE FROM tenant_rooms
      WHERE room_id = @room_id
    `);

  // ✅ Xóa phòng
  const result = await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      DELETE FROM rooms
      WHERE id = @room_id
        AND owner_id = @owner_id
    `);

  return result.rowsAffected[0] === 1;
}
export async function assignTenantToRoomRepo(ownerId, roomId, tenantId) {
  const pool = await poolPromise;

  // 1. Check phòng có thuộc owner không
  const room = await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT id, status
      FROM rooms
      WHERE id = @room_id AND owner_id = @owner_id
    `);

  if (room.recordset.length === 0) {
    throw new Error("Phòng không tồn tại");
  }

  if (room.recordset[0].status === "OCCUPIED") {
    throw new Error("Phòng đã có người thuê");
  }

  // 2. Insert tenant_rooms
  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("tenant_id", sql.Int, tenantId)
    .query(`
      INSERT INTO tenant_rooms (room_id, tenant_id, start_date)
      VALUES (@room_id, @tenant_id, GETDATE())
    `);

  // 3. Update trạng thái phòng
  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      UPDATE rooms
      SET status = 'OCCUPIED'
      WHERE id = @room_id
    `);
}
export async function countRoomsByHouse(houseId, ownerId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("house_id", sql.Int, houseId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT COUNT(*) AS total
      FROM rooms
      WHERE house_id = @house_id
        AND owner_id = @owner_id
    `);

  return result.recordset[0].total;
}