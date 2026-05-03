import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/", authMiddleware, getClients);
router.post("/", authMiddleware, createClient);
router.put("/:id", authMiddleware, updateClient);
router.delete("/:id", authMiddleware, deleteClient);

export default router;
