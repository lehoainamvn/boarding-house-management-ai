/**
 * Chat Memory Service
 * Quản lý lịch sử hội thoại
 */

import { poolPromise } from "../config/db.js";

/**
 * Lưu tin nhắn vào database
 * @param {number} userId - ID người dùng
 * @param {string} role - "user" hoặc "assistant"
 * @param {string} message - Nội dung tin nhắn
 */
export async function saveChatMessage(userId, role, message) {
  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input("user", userId)
      .input("role", role)
      .input("msg", message)
      .query(`
        INSERT INTO ChatMessages(user_id, role, message)
        VALUES(@user, @role, @msg)
      `);
  } catch (error) {
    console.error("[Chat Memory] Save Error:", error);
    throw error;
  }
}

/**
 * Lấy lịch sử hội thoại
 * @param {number} userId - ID người dùng
 * @param {number} limit - Số lượng tin nhắn (mặc định 10)
 * @returns {Promise<Array>} - Mảng tin nhắn { role, message }
 */
export async function getChatHistory(userId, limit = 10) {
  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input("user", userId)
      .input("limit", limit)
      .query(`
        SELECT TOP (@limit) role, message
        FROM ChatMessages
        WHERE user_id = @user
        ORDER BY id DESC
      `);

    // Đảo ngược để có thứ tự từ cũ đến mới
    return result.recordset.reverse();
  } catch (error) {
    console.error("[Chat Memory] Get History Error:", error);
    return [];
  }
}

/**
 * Xóa lịch sử hội thoại (nếu cần)
 * @param {number} userId - ID người dùng
 */
export async function clearChatHistory(userId) {
  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input("user", userId)
      .query(`
        DELETE FROM ChatMessages
        WHERE user_id = @user
      `);
  } catch (error) {
    console.error("[Chat Memory] Clear Error:", error);
    throw error;
  }
}

// Backward compatibility
export const saveMessage = saveChatMessage;
export const getHistory = getChatHistory;