import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", verifyToken, chatWithAI);

export default router;