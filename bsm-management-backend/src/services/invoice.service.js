import {
  createInvoiceRepo,
  getInvoicesByMonth,
  getInvoiceById,
  markInvoicePaid,
  getInvoicesByTenantId,
  getLatestInvoiceByTenantId,
  getInvoiceDetailByTenantId 
} from "../repositories/invoice.repo.js";
import { createNotification } from "./notification.service.js"; // 👉 Import hàm tạo thông báo
import { poolPromise } from "../config/db.js";
/* =========================
   CREATE
========================= */
export async function createInvoiceService(data) {
  if (!data.room_id || !data.month) {
    throw new Error("Thiếu dữ liệu hóa đơn");
  }
  

  await createInvoiceRepo(data);
}
export function getTenantInvoiceDetailService(tenantId, invoiceId) {
  return getInvoiceDetailByTenantId(tenantId, invoiceId);
}
/* =========================
   LIST BY MONTH + HOUSE
========================= */
export function getInvoicesByMonthService(ownerId, month, houseId) {
  return getInvoicesByMonth(ownerId, month, houseId);
}

/* =========================
   DETAIL
========================= */
export function getInvoiceDetailService(ownerId, invoiceId) {
  return getInvoiceById(ownerId, invoiceId);
}

/* =========================
   MARK PAID
========================= */
export async function markInvoicePaidService(ownerId, invoiceId) {
  const success = await markInvoicePaid(ownerId, invoiceId);
  if (!success) {
    throw new Error("Không thể cập nhật hóa đơn");
  }
  
  // 👉 SỬA KHÚC NÀY:
  try {
    const pool = await poolPromise;
    const invoiceRes = await pool.request()
      .input("invoice_id", sql.Int, invoiceId)
      .query(`SELECT tenant_id, month FROM invoices WHERE id = @invoice_id`);

    if (invoiceRes.recordset.length > 0) {
      const { tenant_id, month } = invoiceRes.recordset[0];
      
      // 👉 BẮT BUỘC PHẢI THÊM await Ở ĐÂY
      await createNotification({
        user_id: tenant_id,
        title: "Thanh toán thành công",
        content: `Chủ trọ đã xác nhận bạn đã thanh toán thành công hóa đơn tháng ${month}.`
      });
    }
  } catch (err) {
    console.error("Lỗi gửi thông báo thanh toán:", err);
  }
}
export function getTenantInvoicesService(tenantId) {
  return getInvoicesByTenantId(tenantId);
}

export function getTenantLatestInvoiceService(tenantId) {
  return getLatestInvoiceByTenantId(tenantId);
}