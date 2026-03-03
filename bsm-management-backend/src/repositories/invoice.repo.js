import sql from "mssql";
import { poolPromise } from "../config/db.js";

export async function createInvoiceRepo(data) {
  const pool = await poolPromise;

  // 1. Lấy tenant đang thuê phòng
  const tenantResult = await pool.request()
    .input("room_id", sql.Int, data.room_id)
    .query(`
      SELECT tenant_id
      FROM tenant_rooms
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  if (tenantResult.recordset.length === 0) {
    throw new Error("Phòng chưa có người thuê");
  }

  const tenantId = tenantResult.recordset[0].tenant_id;

  // 2. Lưu chỉ số điện nước
  await pool.request()
    .input("room_id", sql.Int, data.room_id)
    .input("month", sql.NVarChar(7), data.month)
    .input("electric_old", sql.Int, data.electric_old)
    .input("electric_new", sql.Int, data.electric_new)
    .input("water_old", sql.Int, data.water_old)
    .input("water_new", sql.Int, data.water_new)
    .query(`
      INSERT INTO meter_readings (
        room_id, month,
        electric_old, electric_new,
        water_old, water_new
      )
      VALUES (
        @room_id, @month,
        @electric_old, @electric_new,
        @water_old, @water_new
      )
    `);

  // 3. Tạo hóa đơn
  await pool.request()
    .input("room_id", sql.Int, data.room_id)
    .input("tenant_id", sql.Int, tenantId)
    .input("month", sql.NVarChar(7), data.month)
    .input("room_price", sql.Decimal(12,2), data.room_price)
    .input("electric_used", sql.Int, data.electric_used)
    .input("water_used", sql.Int, data.water_used)
    .input("electric_cost", sql.Decimal(12,2), data.electric_cost)
    .input("water_cost", sql.Decimal(12,2), data.water_cost)
    .input("total_amount", sql.Decimal(12,2), data.total_amount)
    .query(`
      INSERT INTO invoices (
        room_id, tenant_id, month,
        room_price,
        electric_used, water_used,
        electric_cost, water_cost,
        total_amount
      )
      VALUES (
        @room_id, @tenant_id, @month,
        @room_price,
        @electric_used, @water_used,
        @electric_cost, @water_cost,
        @total_amount
      )
    `);
}
export async function getInvoicesByMonth(ownerId, month, houseId) {
  const pool = await poolPromise;

  let houseCondition = "";
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId)
    .input("month", sql.NVarChar(7), month);

  if (houseId) {
    request.input("house_id", sql.Int, houseId);
  }

  const result = await request.query(`
    SELECT 
      i.id,
      i.month,
      i.total_amount,
      i.status,
      i.created_at,
      r.room_name,
      u.name AS tenant_name,
      u.phone AS tenant_phone   -- 🔥 THÊM DÒNG NÀY
    FROM invoices i
    JOIN rooms r ON i.room_id = r.id
    JOIN users u ON i.tenant_id = u.id
    WHERE r.owner_id = @owner_id
      AND i.month = @month
      ${houseCondition}
    ORDER BY i.created_at DESC
  `);

  return result.recordset;
}
export async function getInvoiceById(ownerId, invoiceId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("invoice_id", sql.Int, invoiceId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      SELECT 
        i.*,
        r.room_name,
        u.name AS tenant_name,
        u.phone AS tenant_phone  -- 🔥 THÊM DÒNG NÀY
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      JOIN users u ON i.tenant_id = u.id
      WHERE i.id = @invoice_id
        AND r.owner_id = @owner_id
    `);

  return result.recordset[0];
}
export async function markInvoicePaid(ownerId, invoiceId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("invoice_id", sql.Int, invoiceId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      UPDATE invoices
      SET status = 'PAID',
          paid_at = GETDATE()
      WHERE id = @invoice_id
        AND EXISTS (
          SELECT 1
          FROM rooms r
          WHERE r.id = invoices.room_id
            AND r.owner_id = @owner_id
        )
    `);

  return result.rowsAffected[0] === 1;
}
