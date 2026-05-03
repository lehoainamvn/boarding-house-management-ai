import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  inputMeter,
  getMeterHistory,
  getMeterReadingByRoomAndMonth
} from "../controllers/meterController.js";

const router = express.Router();

/**
 * Nhập chỉ số điện nước cho phòng
 * POST /api/rooms/:id/meter-readings
 */
router.post(
  "/rooms/:id/meter-readings",
  verifyToken,
  inputMeter
);

router.get(
  "/rooms/:id/meter-readings",
  verifyToken,
  getMeterReadingByRoomAndMonth
);

/**
 * Lịch sử điện nước
 * GET /api/meters
 */
router.get(
  "/meters",
  verifyToken,
  getMeterHistory
);

export default router;
