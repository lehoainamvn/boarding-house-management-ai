import sql from "mssql";
import { poolPromise } from "../config/db.js";

export async function getProfileRepo(userId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("id", sql.Int, userId)
    .query(`
      SELECT
        id,
        name,
        email,
        phone,
        role,
        created_at
      FROM users
      WHERE id = @id
    `);

  return result.recordset[0];
}

export async function updateProfileRepo(userId, data) {
  const pool = await poolPromise;

  await pool.request()
    .input("id", sql.Int, userId)
    .input("name", sql.NVarChar(100), data.name)
    .input("phone", sql.NVarChar(20), data.phone)
    .query(`
      UPDATE users
      SET
        name = @name,
        phone = @phone
      WHERE id = @id
    `);
}
