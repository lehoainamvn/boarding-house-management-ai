import sql, { poolPromise } from "../config/db.js";

export async function findUserByEmailOrPhone(identifier) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("identifier", sql.NVarChar, identifier)
    .query(`
      SELECT TOP 1 *
      FROM users
      WHERE email = @identifier OR phone = @identifier
    `);

  return result.recordset[0];
}
/**
 * Tạo user mới
 */
export async function createUser(user) {
  const pool = await poolPromise;

  await pool
    .request()
    .input("name", sql.NVarChar, user.name)
    .input("email", sql.NVarChar, user.email)
    .input("phone", sql.NVarChar, user.phone)
    .input("password", sql.NVarChar, user.password)
    .input("role", sql.NVarChar, user.role)
    .query(`
      INSERT INTO users (name, email, phone, password, role)
      VALUES (@name, @email, @phone, @password, @role)
    `);
}
export async function getUserPasswordById(userId) {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("id", sql.Int, userId)
    .query(`
      SELECT password
      FROM users
      WHERE id = @id
    `);

  return result.recordset[0];
}

export async function updateUserPassword(userId, hashedPassword) {
  const pool = await poolPromise;

  await pool.request()
    .input("id", sql.Int, userId)
    .input("password", sql.NVarChar, hashedPassword)
    .query(`
      UPDATE users
      SET password = @password
      WHERE id = @id
    `);
}
