import sql from "mssql";
import { poolPromise } from "../config/db.js";
import { createNotification } from "../services/notification.service.js"; // 👉 Import file thông báo vào đây

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

  // 1.5. Kiểm tra xem hóa đơn tháng này đã tồn tại chưa
  const existingInvoice = await pool.request()
    .input("room_id", sql.Int, data.room_id)
    .input("month", sql.NVarChar(7), data.month)
    .query(`
      SELECT id
      FROM invoices
      WHERE room_id = @room_id
        AND month = @month
    `);

  if (existingInvoice.recordset.length > 0) {
    throw new Error("Hóa đơn tháng này đã tồn tại. Vui lòng chỉnh sửa hóa đơn hiện tại.");
  }

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

  // 🔥 4. TỰ ĐỘNG TẠO THÔNG BÁO KHI TẠO HÓA ĐƠN THÀNH CÔNG
  try {
    const formattedMoney = new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(data.total_amount);

    await createNotification({
      user_id: tenantId,
      title: "Hóa đơn mới",
      content: `Hóa đơn tháng ${data.month} đã được tạo. Tổng tiền cần thanh toán: ${formattedMoney}.`
    });

    console.log(`🔔 Đã lưu thông báo hóa đơn thành công cho tenant: ${tenantId}`);
  } catch (error) {
    // Không ném lỗi throw ở đây để tránh việc hóa đơn tạo thành công nhưng lại bị lỗi vì cái thông báo
    console.error("❌ Lỗi tự động tạo thông báo ở repository:", error);
  }
}

export async function getInvoicesByMonth(ownerId, month, houseId) {
  const pool = await poolPromise;

  let monthCondition = "";
  let houseCondition = "";
  
  if (month && month.trim()) {
    monthCondition = "AND i.month = @month";
  }
  
  if (houseId) {
    houseCondition = "AND r.house_id = @house_id";
  }

  console.log("🔍 getInvoicesByMonth - Building query:", {
    ownerId,
    month: month || "null",
    houseId: houseId || "null",
    monthCondition: monthCondition || "none",
    houseCondition: houseCondition || "none"
  });

  const request = pool.request()
    .input("owner_id", sql.Int, ownerId);

  if (month && month.trim()) {
    request.input("month", sql.NVarChar(7), month);
  }
  
  if (houseId) {
    request.input("house_id", sql.Int, houseId);
  }

  const query = `
    SELECT 
      i.id,
      i.month,
      i.total_amount,
      i.status,
      i.created_at,
      r.room_name,
      u.name AS tenant_name,
      u.phone AS tenant_phone
    FROM invoices i
    JOIN rooms r ON i.room_id = r.id
    JOIN users u ON i.tenant_id = u.id
    WHERE r.owner_id = @owner_id
      ${monthCondition}
      ${houseCondition}
    ORDER BY i.created_at DESC
  `;

  console.log("📝 SQL Query:", query);

  const result = await request.query(query);

  console.log("✅ Query result rowCount:", result.recordset.length);

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
        u.phone AS tenant_phone
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      JOIN users u ON i.tenant_id = u.id
      WHERE i.id = @invoice_id
        AND r.owner_id = @owner_id
    `);

  return result.recordset[0];
}

export async function getInvoiceByRoomAndMonth(roomId, month) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("month", sql.NVarChar(7), month)
    .query(`
      SELECT 
        i.*,
        r.room_name,
        u.name AS tenant_name,
        u.phone AS tenant_phone
      FROM invoices i
      JOIN rooms r ON i.room_id = r.id
      JOIN users u ON i.tenant_id = u.id
      WHERE i.room_id = @room_id
        AND i.month = @month
    `);

  return result.recordset[0] || null;
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

export async function updateInvoiceById(invoiceId, data) {
  const pool = await poolPromise;

  // Get tenant_id and month before update
  const invoiceInfo = await pool.request()
    .input("invoice_id", sql.Int, invoiceId)
    .query(`
      SELECT tenant_id, month, total_amount
      FROM invoices
      WHERE id = @invoice_id
    `);

  if (invoiceInfo.recordset.length === 0) {
    throw new Error("Hóa đơn không tồn tại");
  }

  const { tenant_id, month } = invoiceInfo.recordset[0];

  await pool.request()
    .input("invoice_id", sql.Int, invoiceId)
    .input("room_price", sql.Decimal(12,2), data.room_price)
    .input("electric_used", sql.Int, data.electric_used)
    .input("water_used", sql.Int, data.water_used)
    .input("electric_cost", sql.Decimal(12,2), data.electric_cost)
    .input("water_cost", sql.Decimal(12,2), data.water_cost)
    .input("total_amount", sql.Decimal(12,2), data.total_amount)
    .query(`
      UPDATE invoices
      SET room_price = @room_price,
          electric_used = @electric_used,
          water_used = @water_used,
          electric_cost = @electric_cost,
          water_cost = @water_cost,
          total_amount = @total_amount
      WHERE id = @invoice_id
    `);

  // 🔥 TỰ ĐỘNG TẠO THÔNG BÁO KHI CẬP NHẬT HÓA ĐƠN
  try {
    const formattedMoney = new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(data.total_amount);

    await createNotification({
      user_id: tenant_id,
      title: "Hóa đơn đã cập nhật",
      content: `Hóa đơn tháng ${month} đã được cập nhật. Tổng tiền mới: ${formattedMoney}.`
    });

    console.log(`🔔 Đã lưu thông báo cập nhật hóa đơn cho tenant: ${tenant_id}`);
  } catch (error) {
    console.error("❌ Lỗi tự động tạo thông báo cập nhật:", error);
  }
}

export async function updateMeterReading(roomId, month, data) {
  const pool = await poolPromise;

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("month", sql.NVarChar(7), month)
    .input("electric_old", sql.Int, data.electric_old)
    .input("electric_new", sql.Int, data.electric_new)
    .input("water_old", sql.Int, data.water_old)
    .input("water_new", sql.Int, data.water_new)
    .query(`
      UPDATE meter_readings
      SET electric_old = @electric_old,
          electric_new = @electric_new,
          water_old = @water_old,
          water_new = @water_new
      WHERE room_id = @room_id
        AND month = @month
    `);
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

/* =========================
   TENANT - GET ALL INVOICES
========================= */
export async function getInvoicesByTenantId(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenant_id", sql.Int, tenantId)
    .query(`
      SELECT *
      FROM invoices
      WHERE tenant_id = @tenant_id
      ORDER BY created_at DESC
    `);

  return result.recordset;
}

/* =========================
   TENANT - GET LATEST
========================= */
export async function getLatestInvoiceByTenantId(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenant_id", sql.Int, tenantId)
    .query(`
      SELECT TOP 1 *
      FROM invoices
      WHERE tenant_id = @tenant_id
      ORDER BY created_at DESC
    `);

  return result.recordset[0];
}

export async function getInvoiceDetailByTenantId(tenantId, invoiceId) {
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

export async function getTenantStatisticsRepo(tenantId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("tenant_id", sql.Int, tenantId)
    .query(`
      SELECT 
        month,
        electric_used,
        water_used,
        total_amount,
        status
      FROM invoices
      WHERE tenant_id = @tenant_id
      ORDER BY month ASC
    `);

  return result.recordset;
}