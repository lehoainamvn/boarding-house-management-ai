import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", verifyToken, getSettings);
router.put("/", verifyToken, updateSettings);

export default router;