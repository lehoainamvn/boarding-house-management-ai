import {
  createInvoiceService,
  getInvoicesByMonthService,
  getInvoiceDetailService,
  getInvoiceByRoomAndMonthService,
  updateInvoiceService,
  markInvoicePaidService,
  getTenantInvoicesService,
  getTenantLatestInvoiceService,
  getTenantInvoiceDetailService
} from "../services/invoice.service.js";

export async function getTenantInvoiceDetail(req, res) {
  try {
    const tenantId = req.user.id;
    const invoiceId = Number(req.params.id);

    const invoice = await getTenantInvoiceDetailService(
      tenantId,
      invoiceId
    );

    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function markInvoicePaid(req, res) {
  try {
    const ownerId = req.user.id;
    const invoiceId = Number(req.params.id);

    await markInvoicePaidService(ownerId, invoiceId);
    res.json({ message: "Đã đánh dấu thanh toán" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
/* =========================
   CREATE INVOICE
========================= */
export async function createInvoice(req, res) {
  try {
    await createInvoiceService(req.body);
    res.json({ message: "Lưu hóa đơn thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   GET INVOICES BY MONTH
========================= */
export async function getInvoicesByMonth(req, res) {
  try {
    const ownerId = req.user.id;
    const { month, houseId } = req.query;

    const data = await getInvoicesByMonthService(
      ownerId,
      month ? month : null,
      houseId ? Number(houseId) : null
    );

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message || "Lỗi lấy hóa đơn" });
  }
}

export async function getInvoiceByRoomAndMonth(req, res) {
  try {
    const roomId = Number(req.params.roomId);
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Thiếu thông tin tháng" });
    }

    const invoice = await getInvoiceByRoomAndMonthService(roomId, month);
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message || "Lỗi tải hóa đơn" });
  }
}

export async function updateInvoice(req, res) {
  try {
    const invoiceId = Number(req.params.id);
    const data = req.body;

    await updateInvoiceService(invoiceId, data);
    res.json({ message: "Cập nhật hóa đơn thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Lỗi cập nhật hóa đơn" });
  }
}


/* =========================
   GET INVOICE DETAIL
========================= */
export async function getInvoiceDetail(req, res) {
  try {
    const ownerId = req.user.id;
    const invoiceId = Number(req.params.id);

    const invoice = await getInvoiceDetailService(ownerId, invoiceId);
    res.json(invoice);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}
/* =========================
   TENANT - GET ALL
========================= */
export async function getTenantInvoices(req, res) {
  try {
    const tenantId = req.user.id;
    const data = await getTenantInvoicesService(tenantId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   TENANT - GET LATEST
========================= */
export async function getTenantLatestInvoice(req, res) {
  try {
    const tenantId = req.user.id;
    const invoice = await getTenantLatestInvoiceService(tenantId);
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}