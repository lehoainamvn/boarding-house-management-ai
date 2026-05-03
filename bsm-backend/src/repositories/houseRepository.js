import sql, { poolPromise } from "../config/db.js";

/* ================= GET ================= */
export async function getMyHousesRepo(ownerId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT 
        h.id,
        h.name,
        h.address,
        h.total_rooms,
        COUNT(r.id) AS created_rooms
      FROM houses h
      LEFT JOIN rooms r ON h.id = r.house_id
      WHERE h.owner_id = @owner_id
      GROUP BY h.id, h.name, h.address, h.total_rooms
    `);

  return result.recordset;
}

/* ================= CREATE HOUSE ================= */
export async function createHouse(ownerId, data) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("owner_id", sql.Int, ownerId)
    .input("name", sql.NVarChar, data.name)
    .input("address", sql.NVarChar, data.address)
    .input("total_rooms", sql.Int, data.totalRooms)
    .query(`
      INSERT INTO houses (owner_id, name, address, total_rooms)
      OUTPUT INSERTED.id
      VALUES (@owner_id, @name, @address, @total_rooms)
    `);

  return result.recordset[0].id;
}

/* ================= CREATE ROOMS ================= */
export async function createRooms(houseId, ownerId, totalRooms) {
  const pool = await poolPromise;

  for (let i = 1; i <= totalRooms; i++) {
    await pool
      .request()
      .input("house_id", sql.Int, houseId)
      .input("owner_id", sql.Int, ownerId)
      .input("room_name", sql.NVarChar, `Phòng ${i}`)
      .query(`
        INSERT INTO rooms (
          house_id, owner_id, room_name,
          room_price, electric_price, water_price, status
        )
        VALUES (
          @house_id, @owner_id, @room_name,
          0, 0, 0, 'EMPTY'
        )
      `);
  }
}

/* ================= UPDATE HOUSE ================= */
export async function updateHouseRepo(ownerId, houseId, data) {
  const pool = await poolPromise;

  await pool
    .request()
    .input("id", sql.Int, houseId)
    .input("owner_id", sql.Int, ownerId)
    .input("name", sql.NVarChar, data.name)
    .input("address", sql.NVarChar, data.address)
    .input("total_rooms", sql.Int, data.totalRooms)
    .query(`
      UPDATE houses
      SET name = @name,
          address = @address,
          total_rooms = @total_rooms
      WHERE id = @id AND owner_id = @owner_id
    `);
}

/* ================= DELETE HOUSE ================= */
export async function deleteHouseRepo(ownerId, houseId) {
  const pool = await poolPromise;

  // ❗ Xóa rooms trước (tránh lỗi FK)
  await pool
    .request()
    .input("house_id", sql.Int, houseId)
    .query(`DELETE FROM rooms WHERE house_id = @house_id`);

  // Xóa house
  await pool
    .request()
    .input("id", sql.Int, houseId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      DELETE FROM houses
      WHERE id = @id AND owner_id = @owner_id
    `);
}
export async function getHouseById(ownerId, houseId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("owner_id", sql.Int, ownerId)
    .input("house_id", sql.Int, houseId)
    .query(`
      SELECT id, total_rooms
      FROM houses
      WHERE id = @house_id
        AND owner_id = @owner_id
    `);

  return result.recordset[0];
} 