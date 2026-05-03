import sql from "mssql";
import { poolPromise } from "../config/db.js";

/**
 * tìm tenant theo email
 */

export async function findTenantByEmail(email) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      SELECT id, name, email, phone
      FROM users
      WHERE email = @email
        AND role = 'TENANT'
    `);

  return result.recordset[0];
}

/**
 * tạo tenant mới
 */
export async function createTenant({ name, email, phone }) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("name", sql.NVarChar, name)
    .input("email", sql.NVarChar, email)
    .input("phone", sql.NVarChar, phone)
    .query(`
      INSERT INTO users (name, email, role, phone, password)
      OUTPUT INSERTED.id
      VALUES (@name, @email, 'TENANT', @phone, '123456')
    `);

  return result.recordset[0].id;
}

/**
 * gán tenant vào phòng
 */
export async function assignTenantToRoom(roomId, tenantId, startDate) {
  const pool = await poolPromise;

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("tenant_id", sql.Int, tenantId)
    .input("start_date", sql.Date, startDate)
    .query(`
      INSERT INTO tenant_rooms (room_id, tenant_id, start_date)
      VALUES (@room_id, @tenant_id, @start_date)
    `);

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      UPDATE rooms
      SET status = 'OCCUPIED'
      WHERE id = @room_id
    `);
}
/**
 * Lấy dashboard tenant
 */
export async function getTenantDashboardRepo(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenantId", sql.Int, tenantId)
    .query(`
      SELECT 
          u.id AS tenant_id,
          u.name AS tenant_name,
          u.email,
          u.phone,

          r.id AS room_id,
          r.room_name,
          r.room_price,
          r.electric_price,
          r.water_type,
          r.water_price,
          r.water_price_per_person,
          r.people_count,
          r.status,

          h.id AS house_id,
          h.name AS house_name,
          h.address

      FROM tenant_rooms tr
      JOIN users u ON tr.tenant_id = u.id
      JOIN rooms r ON tr.room_id = r.id
      JOIN houses h ON r.house_id = h.id
      WHERE tr.tenant_id = @tenantId
        AND tr.end_date IS NULL
    `);

  return result.recordset[0];
}

/**
 * Lấy hóa đơn mới nhất
 */
export async function getLatestInvoiceRepo(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenantId", sql.Int, tenantId)
    .query(`
      SELECT TOP 1 *
      FROM invoices
      WHERE tenant_id = @tenantId
      ORDER BY created_at DESC
    `);

  return result.recordset[0];
}

/**
 * Lấy thông báo
 */
export async function getTenantNotificationsRepo(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenantId", sql.Int, tenantId)
    .query(`
      SELECT TOP 5 *
      FROM notifications
      WHERE user_id = @tenantId
      ORDER BY created_at DESC
    `);

  return result.recordset;
}export async function getInvoiceDetailByTenantId(tenantId, invoiceId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenant_id", sql.Int, tenantId)
    .input("invoice_id", sql.Int, invoiceId)
    .query(`
      SELECT i.*, r.room_name
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      WHERE i.id = @invoice_id
        AND i.tenant_id = @tenant_id
    `);

  return result.recordset[0];
}