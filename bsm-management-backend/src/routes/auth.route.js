import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  googleLogin
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/register", register);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;