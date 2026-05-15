import sql, { poolPromise } from "../config/db.js";

export async function getHouseRulesRepo(houseId) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("house_id", sql.Int, houseId)
    .query("SELECT * FROM house_rules WHERE house_id = @house_id ORDER BY created_at DESC");
  return result.recordset;
}

export async function getRuleByIdRepo(ruleId) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, ruleId)
    .query("SELECT * FROM house_rules WHERE id = @id");
  return result.recordset[0];
}

export async function createHouseRuleRepo(houseId, data) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("house_id", sql.Int, houseId)
    .input("title", sql.NVarChar, data.title)
    .input("content", sql.NVarChar, data.content)
    .query(`
      INSERT INTO house_rules (house_id, title, content)
      OUTPUT INSERTED.id
      VALUES (@house_id, @title, @content)
    `);
  return result.recordset[0].id;
}

export async function updateHouseRuleRepo(ruleId, data) {
  const pool = await poolPromise;
  await pool
    .request()
    .input("id", sql.Int, ruleId)
    .input("title", sql.NVarChar, data.title)
    .input("content", sql.NVarChar, data.content)
    .query(`
      UPDATE house_rules 
      SET title = @title, content = @content 
      WHERE id = @id
    `);
}

export async function deleteHouseRuleRepo(ruleId) {
  const pool = await poolPromise;
  await pool
    .request()
    .input("id", sql.Int, ruleId)
    .query("DELETE FROM house_rules WHERE id = @id");
}
