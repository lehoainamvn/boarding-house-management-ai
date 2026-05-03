import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { chatWithAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", verifyToken, chatWithAI);

export default router;