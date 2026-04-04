import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", verifyToken, getSettings);
router.put("/", verifyToken, updateSettings);

export default router;