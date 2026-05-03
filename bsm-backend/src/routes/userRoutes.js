// src/routes/user.routes.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { changePassword } from "../controllers/userController.js";

const router = express.Router();

router.put("/change-password", verifyToken, changePassword);

export default router;
