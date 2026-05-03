import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

import {
  findUserByEmailOrPhone,
  createUser,
  updateUserPassword
} from "../repositories/userRepository.js";

import { sendMail } from "../utils/mail.js";

import {
  saveOtp,
  findOtp,
  deleteOtp
} from "../repositories/otpRepository.js";

/**
 * LOGIN
 */
export async function loginService(identifier, password) {
  const user = await findUserByEmailOrPhone(identifier);
  if (!user) throw new Error("Tài khoản không tồn tại");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Sai mật khẩu");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
}

/**
 * GOOGLE LOGIN
 */
export async function googleLoginService(token, role = "OWNER") {
  // Google token verification
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await findUserByEmailOrPhone(email);

  if (!user) {
    // Create new user if not exists
    const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    // Validate role
    const validRole = ["OWNER", "TENANT", "ADMIN"].includes(role) ? role : "OWNER";
    
    await createUser({
      name: name || "Google User",
      email,
      phone: "GG-" + Date.now().toString().slice(-8), // Dummy phone to avoid NOT NULL constraints
      password: hashedPassword,
      role: validRole
    });
    
    user = await findUserByEmailOrPhone(email);
  }

  const jwtToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token: jwtToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
}

/**
 * REGISTER
 */
export async function registerService(data) {
  const { name, email, phone, password, role } = data;

  const existed =
    (email && (await findUserByEmailOrPhone(email))) ||
    (phone && (await findUserByEmailOrPhone(phone)));

  if (existed) {
    throw new Error("Tài khoản đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await createUser({
    name,
    email,
    phone,
    password: hashedPassword,
    role
  });
}

/**
 * 📩 GỬI OTP
 */
export async function forgotPasswordService(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await saveOtp(email, otp);

  await sendMail(email, "Mã OTP", `OTP của bạn là: ${otp}`);

  return {
    message: "Đã gửi OTP"
  };
}

/**
 * 🔄 RESET PASSWORD (🔥 FIX CHUẨN)
 */
export async function resetPasswordService({ email, otp, newPassword }) {

  const record = await findOtp(email);

  if (!record || String(record.otp) !== String(otp)) {
    throw new Error("OTP không hợp lệ");
  }

  const user = await findUserByEmailOrPhone(email);
  if (!user) throw new Error("User không tồn tại");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUserPassword(user.id, hashedPassword);

  await deleteOtp(email);

  return {
    message: "Đổi mật khẩu thành công"
  };
}