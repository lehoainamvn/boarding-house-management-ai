import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  findTenantByEmailController,
  assignTenantToRoomController,
  removeTenantFromRoomController,
  getTenantDashboardController,
  getTenantStatisticsController
} from "../controllers/tenantController.js";
import { getTenantInvoiceDetail } from "../controllers/invoiceController.js";
import { getTenantInvoices } from "../controllers/invoiceController.js";

const router = express.Router();

// 🏠 dashboard tenant
router.get(
  "/dashboard",
  verifyToken,
  getTenantDashboardController
);

// 🧾 tenant invoices
router.get(
  "/invoices",
  verifyToken,
  getTenantInvoices
);

// 🔍 tìm người thuê theo email
router.get(
  "/find-by-email",
  verifyToken,
  findTenantByEmailController
);

// ➕ gán người thuê
router.post(
  "/rooms/:id/assign-tenant",
  verifyToken,
  assignTenantToRoomController
);

// 🚪 trả phòng
router.post(
  "/rooms/:id/remove-tenant",
  verifyToken,
  removeTenantFromRoomController
);
router.get(
  "/invoices/:id",
  verifyToken,
  getTenantInvoiceDetail
);
router.get(
  "/statistics",
  verifyToken,
  getTenantStatisticsController
);
export default router;