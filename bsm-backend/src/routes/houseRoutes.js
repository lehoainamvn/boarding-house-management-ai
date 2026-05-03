import express from "express";
import {
  getMyHouses,
  createHouse,
  updateHouse,   // ✅ THÊM
  deleteHouse,   // ✅ THÊM
} from "../controllers/houseController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getMyHouses);
router.post("/", verifyToken, createHouse);
router.put("/:id", verifyToken, updateHouse);     // ✅ OK
router.delete("/:id", verifyToken, deleteHouse);  // ✅ OK

export default router;
