import sql from "mssql";
import { poolPromise } from "../config/db.js";

/**
 * 🔐 LƯU OTP
 */
export async function saveOtp(email, otp) {
  const pool = await poolPromise;

  await pool.request()
    .input("email", sql.NVarChar, email)
    .input("otp", sql.NVarChar, otp)
    .query(`
      INSERT INTO Otps (email, otp)
      VALUES (@email, @otp)
    `);
}

/**
 * 📩 LẤY OTP MỚI NHẤT
 */
export async function findOtp(email) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      SELECT TOP 1 *
      FROM Otps
      WHERE email = @email
      ORDER BY created_at DESC
    `);

  return result.recordset[0];
}

/**
 * ❌ XOÁ OTP
 */
export async function deleteOtp(email) {
  const pool = await poolPromise;

  await pool.request()
    .input("email", sql.NVarChar, email)
    .query(`
      DELETE FROM Otps
      WHERE email = @email
    `);
}