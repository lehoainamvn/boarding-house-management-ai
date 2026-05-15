import {
  findTenantByEmail,
  createTenant,
  assignTenantToRoom,
  getTenantDashboardRepo,
  getLatestInvoiceRepo,
  getTenantNotificationsRepo,
} from "../repositories/tenantRepository.js";

import { getInvoiceDetailByTenantId } 
from "../repositories/invoiceRepository.js";

import sql, { poolPromise } from "../config/db.js";

import { getTenantStatisticsRepo } 
from "../repositories/invoiceRepository.js";

export async function getTenantStatisticsService(tenantId) {
  const rows = await getTenantStatisticsRepo(tenantId);

  return {
    electric: rows.map(r => ({
      month: r.month,
      used: r.electric_used
    })),
    water: rows.map(r => ({
      month: r.month,
      used: r.water_used
    })),
    invoices: rows.map(r => ({
      month: r.month,
      amount: r.total_amount,
      status: r.status
    }))
  };
}
export function getTenantInvoiceDetailService(tenantId, invoiceId) {
  return getInvoiceDetailByTenantId(tenantId, invoiceId);
}
/* ===============================
   GÁN NGƯỜI THUÊ
================================ */
export async function assignTenantService(roomId, payload) {
  const pool = await poolPromise;

  // Kiểm tra phòng có trống không
  const room = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT status
      FROM rooms
      WHERE id = @room_id
    `);

  if (room.recordset.length === 0) {
    throw new Error("Phòng không tồn tại");
  }

  if (room.recordset[0].status !== 'EMPTY') {
    throw new Error("Phòng này đã có người thuê");
  }

  let tenantId;

  // ===== ĐÃ CÓ TÀI KHOẢN =====
  if (payload.tenantType === "EXISTING") {
    const tenant = await findTenantByEmail(payload.email);
    if (!tenant) {
      throw new Error("Không tìm thấy người thuê");
    }
    tenantId = tenant.id;

    // Kiểm tra tenant đã thuê phòng khác chưa
    const activeContract = await pool.request()
      .input("tenant_id", sql.Int, tenantId)
      .query(`
        SELECT COUNT(*) as count
        FROM tenant_rooms
        WHERE tenant_id = @tenant_id
          AND end_date IS NULL
      `);

    if (activeContract.recordset[0].count > 0) {
      throw new Error("Người thuê này đã thuê phòng khác");
    }
  }

  // ===== CHƯA CÓ TÀI KHOẢN =====
  if (payload.tenantType === "NEW") {
    if (!payload.name || !payload.email) {
      throw new Error("Thiếu thông tin người thuê");
    }

    // Kiểm tra email đã tồn tại - nếu có thì dùng người đó
    const existingTenant = await findTenantByEmail(payload.email);
    if (existingTenant) {
      tenantId = existingTenant.id;

      // Kiểm tra tenant đã thuê phòng khác chưa
      const activeContract = await pool.request()
        .input("tenant_id", sql.Int, tenantId)
        .query(`
          SELECT COUNT(*) as count
          FROM tenant_rooms
          WHERE tenant_id = @tenant_id
            AND end_date IS NULL
        `);

      if (activeContract.recordset[0].count > 0) {
        throw new Error("Người thuê này đã thuê phòng khác");
      }
    } else {
      // Email chưa tồn tại - tạo mới
      tenantId = await createTenant({
        name: payload.name,
        email: payload.email,
        phone: payload.phone
      });
    }
  }

  await assignTenantToRoom(roomId, tenantId, payload.start_date);

  // Cập nhật status phòng thành OCCUPIED
  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      UPDATE rooms
      SET status = 'OCCUPIED'
      WHERE id = @room_id
    `);
}

/* ===============================
   TÌM NGƯỜI THUÊ THEO EMAIL
================================ */
export async function findTenantByEmailService(email) {
  const tenant = await findTenantByEmail(email);
  if (!tenant) {
    throw new Error("Không tìm thấy người thuê");
  }
  return tenant;
}

/* ===============================
   TRẢ PHÒNG
================================ */
export async function removeTenantFromRoomService(ownerId, roomId) {
  const pool = await poolPromise;

  // Kiểm tra hóa đơn chưa thanh toán
  const unpaidInvoices = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT COUNT(*) as count
      FROM invoices
      WHERE room_id = @room_id
        AND status != 'PAID'
    `);

  if (unpaidInvoices.recordset[0].count > 0) {
    throw new Error("Không thể trả phòng vì còn hóa đơn chưa thanh toán");
  }

  const currentTenant = await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      SELECT TOP 1 *
      FROM tenant_rooms
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  if (currentTenant.recordset.length === 0) {
    throw new Error("Phòng này không có người thuê");
  }

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .query(`
      UPDATE tenant_rooms
      SET end_date = GETDATE()
      WHERE room_id = @room_id
        AND end_date IS NULL
    `);

  await pool.request()
    .input("room_id", sql.Int, roomId)
    .input("owner_id", sql.Int, ownerId)
    .query(`
      UPDATE rooms
      SET status = 'EMPTY'
      WHERE id = @room_id
        AND owner_id = @owner_id
    `);
}
/* ===============================
   DASHBOARD TENANT
================================ */
export async function getTenantDashboardService(tenantId) {
  const dashboard = await getTenantDashboardRepo(tenantId);

  if (!dashboard) {
    throw new Error("Tenant chưa được gán phòng");
  }

  const latestInvoice = await getLatestInvoiceRepo(tenantId);
  const notifications = await getTenantNotificationsRepo(tenantId);

  return {
    profile: {
      id: dashboard.tenant_id,
      name: dashboard.tenant_name,
      email: dashboard.email,
      phone: dashboard.phone
    },
    room: {
      id: dashboard.room_id,
      name: dashboard.room_name,
      price: dashboard.room_price,
      electric_price: dashboard.electric_price,
      water_type: dashboard.water_type,
      water_price: dashboard.water_price,
      water_price_per_person: dashboard.water_price_per_person,
      people_count: dashboard.people_count,
      status: dashboard.status,
      start_date: dashboard.start_date
    },
    house: {
      id: dashboard.house_id,
      name: dashboard.house_name,
      address: dashboard.address
    },
    latest_invoice: latestInvoice || null,
    notifications
  };
}