import express from "express";
import * as paymentController from "../controllers/vnpay.controller.js";
const router = express.Router();

// Client gọi cái này để lấy link đi VNPAY
router.post("/create-url", paymentController.createPaymentUrl);

// VNPAY gọi cái này để thông báo kết quả (IPN)
router.get("/vnpay-ipn", paymentController.vnpayIPN);
router.get("/vnpay-return", paymentController.vnpayReturn);
export default router;