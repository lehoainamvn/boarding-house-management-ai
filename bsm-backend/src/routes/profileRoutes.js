// src/routes/profile.routes.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile
} from "../controllers/profileController.js";

const router = express.Router();

/**
 * GET /api/profile
 */
router.get("/", verifyToken, getProfile);

/**
 * PUT /api/profile
 */
router.put("/", verifyToken, updateProfile);

export default router;
