import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createInvoice,
  getInvoicesByMonth,
  getInvoiceDetail,
  getInvoiceByRoomAndMonth,
  updateInvoice,
  markInvoicePaid,
  getTenantInvoices,
  getTenantLatestInvoice,
  getTenantInvoiceDetail
} from "../controllers/invoiceController.js";


const router = express.Router();

/* =========================
   CREATE INVOICE
========================= */
router.post("/invoices", authMiddleware, createInvoice);
router.get("/invoices", authMiddleware, getInvoicesByMonth);
router.get("/invoices/room/:roomId", authMiddleware, getInvoiceByRoomAndMonth);
router.put("/invoices/:id", authMiddleware, updateInvoice);
router.get("/invoices/:id", authMiddleware, getInvoiceDetail);
router.put("/invoices/:id/pay", authMiddleware, markInvoicePaid);
router.get("/invoices/latest", authMiddleware, getTenantLatestInvoice);
router.get("/invoices/:id/detail", authMiddleware, getTenantInvoiceDetail);
export default router;

