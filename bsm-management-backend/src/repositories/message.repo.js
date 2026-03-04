import sql from "mssql";
import { poolPromise } from "../config/db.js";

/* LẤY TIN NHẮN */

export async function getMessagesByRoom(roomId) {

  const pool = await poolPromise;

  const result = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE room_id = @room_id
      ORDER BY created_at ASC
    `);

  return result.recordset;

}

/* GỬI TIN NHẮN */

export async function sendMessageRepo(data) {

  const pool = await poolPromise;

  const result = await pool.request()
    .input("room_id", sql.Int, data.room_id)
    .input("sender_id", sql.Int, data.sender_id)
    .input("receiver_id", sql.Int, data.receiver_id)
    .input("content", sql.NVarChar, data.content)
    .query(`
      INSERT INTO messages (room_id, sender_id, receiver_id, content)
      OUTPUT INSERTED.*
      VALUES (@room_id, @sender_id, @receiver_id, @content)
    `);

  return result.recordset[0];

}

/* ROOM CỦA OWNER */

export async function getOwnerRooms(ownerId) {

  const pool = await poolPromise;

  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT 
        r.id,
        r.room_name,
        tr.tenant_id,
        u.name AS tenant_name
      FROM tenant_rooms tr
      JOIN rooms r ON r.id = tr.room_id
      JOIN users u ON u.id = tr.tenant_id
      WHERE r.owner_id = @owner_id
      AND tr.end_date IS NULL
      ORDER BY r.id
    `);

  return result.recordset;

}