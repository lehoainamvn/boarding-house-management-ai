import bcrypt from "bcryptjs";
import sql, { poolPromise } from "../config/db.js";

const run = async () => {
  const pool = await poolPromise;

  const users = await pool.request().query(`
    SELECT id, password FROM users WHERE password NOT LIKE '$2%'
  `);

  for (const u of users.recordset) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool
      .request()
      .input("id", sql.Int, u.id)
      .input("password", sql.NVarChar, hash)
      .query("UPDATE users SET password=@password WHERE id=@id");
  }

  console.log("✅ Hash xong toàn bộ user cũ");
  process.exit();
};

run();
