import sql from "mssql";
import { poolPromise } from "../config/db.js";

/* ===== GET ALL ===== */
export async function getAllClients() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT id, name, email, phone
    FROM users
    WHERE role = 'TENANT'
  `);
  return result.recordset;
}

/* ===== GET ALL WITH STATUS ===== */
export async function getAllClientsWithStatus(ownerId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("owner_id", sql.Int, ownerId)
    .query(`
    SELECT DISTINCT
      u.id,
      u.name,
      u.email,
      u.phone,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM tenant_rooms tr
          INNER JOIN rooms r ON tr.room_id = r.id
          WHERE tr.tenant_id = u.id AND tr.end_date IS NULL AND r.owner_id = @owner_id
        ) THEN 'CURRENT'
        ELSE 'PAST'
      END AS status,
      MIN(tr.start_date) AS first_start_date,
      MAX(CASE WHEN tr.end_date IS NOT NULL THEN tr.end_date ELSE NULL END) AS last_end_date
    FROM users u
    INNER JOIN tenant_rooms tr ON u.id = tr.tenant_id
    INNER JOIN rooms r ON tr.room_id = r.id
    WHERE u.role = 'TENANT' AND r.owner_id = @owner_id
    GROUP BY u.id, u.name, u.email, u.phone
  `);
  return result.recordset;
}

/* ===== CREATE ===== */
export async function createClient({ name, email, phone, password }) {
  const pool = await poolPromise;
  await pool.request()
    .input("name", sql.NVarChar, name)
    .input("email", sql.NVarChar, email)
    .input("phone", sql.NVarChar, phone)
    .input("password", sql.NVarChar, password)
    .query(`
      INSERT INTO users (name, email, phone, role, password)
      VALUES (@name, @email, @phone, 'TENANT', @password)
    `);
}

/* ===== UPDATE ===== */
export async function updateClient(id, { name, email, phone }) {
  const pool = await poolPromise;
  await pool.request()
    .input("id", sql.Int, id)
    .input("name", sql.NVarChar, name)
    .input("email", sql.NVarChar, email)
    .input("phone", sql.NVarChar, phone)
    .query(`
      UPDATE users
      SET name = @name,
          email = @email,
          phone = @phone
      WHERE id = @id AND role = 'TENANT'
    `);
}

/* ===== DELETE ===== */
export async function deleteClient(id) {
  const pool = await poolPromise;

  // 1. kiểm tra client có đang thuê phòng không
  const check = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT 1
      FROM tenant_rooms
      WHERE tenant_id = @id
        AND end_date IS NULL
    `);

  if (check.recordset.length > 0) {
    throw new Error("CLIENT_IS_RENTING");
  }

  // 2. xóa client
  await pool.request()
    .input("id", sql.Int, id)
    .query(`
      DELETE FROM users
      WHERE id = @id AND role = 'TENANT'
    `);
}