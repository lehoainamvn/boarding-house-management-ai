import express from "express";
import * as houseRuleController from "../controllers/houseRuleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/house/:houseId", verifyToken, houseRuleController.getHouseRules);
router.get("/tenant", verifyToken, houseRuleController.getHouseRulesForTenant);
router.post("/house/:houseId", verifyToken, houseRuleController.createHouseRule);
router.put("/:id", verifyToken, houseRuleController.updateHouseRule);
router.delete("/:id", verifyToken, houseRuleController.deleteHouseRule);

export default router;
