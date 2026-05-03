import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  getMessages,
  sendMessage,
  getOwnerRooms,
  getTenantRoom
} from "../controllers/messageController.js";

const router = express.Router();

/* ✅ TENANT: LẤY PHÒNG (ĐẶT LÊN TRÊN) */
router.get("/my-room", verifyToken, getTenantRoom);

/* OWNER: DANH SÁCH PHÒNG */
router.get("/rooms", verifyToken, getOwnerRooms);

/* LẤY TIN NHẮN */
router.get("/:roomId", verifyToken, getMessages);

/* GỬI */
router.post("/", verifyToken, sendMessage);

export default router;