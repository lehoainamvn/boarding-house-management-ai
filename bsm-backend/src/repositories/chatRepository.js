import db from "../config/db.js";

export async function saveMessage(userId, role, message) {

  await db.query(
    `
    INSERT INTO ChatMessages (user_id, role, message)
    VALUES (?, ?, ?)
    `,
    [userId, role, message]
  );

}

export async function getHistory(userId) {

  const [rows] = await db.query(
    `
    SELECT role, message
    FROM ChatMessages
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
    `,
    [userId]
  );

  return rows.map(m => ({
    role: m.role,
    parts: [{ text: m.message }]
  }));

}