import {
  assignTenantService,
  findTenantByEmailService,
  removeTenantFromRoomService,
  getTenantDashboardService,
  getTenantInvoiceDetailService,
  getTenantStatisticsService
} from "../services/tenant.service.js";



export async function getTenantStatisticsController(req, res) {
  try {
    const tenantId = req.user.id;

    const data = await getTenantStatisticsService(tenantId);

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
/* =========================
   DASHBOARD TENANT
========================= */
export async function getTenantDashboardController(req, res) {
  try {
    const tenantId = req.user.id;

    const data = await getTenantDashboardService(tenantId);

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
/* =========================
   TÌM NGƯỜI THUÊ THEO EMAIL
========================= */
export async function findTenantByEmailController(req, res) {
  try {
    const { email } = req.query;
    const tenant = await findTenantByEmailService(email);
    res.json(tenant);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

/* =========================
   GÁN NGƯỜI THUÊ VÀO PHÒNG
========================= */
export async function assignTenantToRoomController(req, res) {
  try {
    const roomId = req.params.id;
    await assignTenantService(roomId, req.body);
    res.json({ message: "Gán người thuê thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* =========================
   TRẢ PHÒNG
========================= */
export async function removeTenantFromRoomController(req, res) {
  try {
    const ownerId = req.user.id;
    const roomId = req.params.id;

    await removeTenantFromRoomService(ownerId, roomId);

    res.json({ message: "Trả phòng thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
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