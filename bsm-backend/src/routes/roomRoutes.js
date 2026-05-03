import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  getRoomsByHouse,
  getRoomDetailController,
  updateRoom,
  createRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { assignTenantToRoomController } from "../controllers/tenantController.js";

const router = express.Router();

// Danh sách phòng
router.get("/", verifyToken, getRoomsByHouse);

// Thêm phòng
router.post("/", verifyToken, createRoom);

// Chi tiết phòng
router.get("/:id", verifyToken, getRoomDetailController);

// Update phòng
router.put("/:id", verifyToken, updateRoom);

// Xóa phòng
router.delete("/:id", verifyToken, deleteRoom);

// Gán người thuê
router.post("/:id/assign-tenant", verifyToken, assignTenantToRoomController);

export default router;
