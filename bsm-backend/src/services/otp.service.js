import sql from "mssql";
import { transporter, sendOtpEmail } from "../config/mail.js";

export const createOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const pool = await sql.connect();

  await pool.request()
    .input("email", sql.NVarChar, email)
    .input("otp", sql.NVarChar, otp)
    .input("expires", sql.DateTime, new Date(Date.now() + 5 * 60 * 1000))
    .query(`
      INSERT INTO otps (email, otp, expires_at)
      VALUES (@email, @otp, @expires)
    `);

  // 🔥 GỬI MAIL Ở ĐÂY
  await sendOtpEmail(email, otp);
};
export const verifyOtp = async (email, otp) => {
  const pool = await sql.connect();

  const result = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      SELECT TOP 1 * FROM otps
      WHERE email = @email
      ORDER BY created_at DESC
    `);

  const record = result.recordset[0];

  if (!record) throw new Error("Không tìm thấy OTP");

  if (record.otp !== otp) throw new Error("OTP sai");

  if (new Date() > record.expires_at) {
    throw new Error("OTP hết hạn");
  }

  return true;
};