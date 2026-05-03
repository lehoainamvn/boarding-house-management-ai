import { poolPromise } from "../config/db.js";
import { detectIntent } from "./intent.service.js";
import { generateSQL } from "./sqlGenerator.service.js";
import { explainData } from "./explain.service.js";
import { validateSQL } from "../utils/sqlValidator.js";
import { askGroq } from "./groq.service.js";

// Lưu tin nhắn vào DB
export async function saveChatMessageService(userId, role, msg) {
  const pool = await poolPromise;
  await pool.request()
    .input("user", userId)
    .input("role", role)
    .input("msg", msg)
    .query(`
      INSERT INTO ChatMessages(user_id, role, message)
      VALUES(@user, @role, @msg)
    `);
}

// Xử lý AI chat logic
export async function processAiChatService(userId, question) {
  const pool = await poolPromise;

  // 1. Lưu tin nhắn của User
  await saveChatMessageService(userId, "user", question);

  // 2. Kiểm tra câu hỏi cá nhân và chào hỏi
  const personalQuestions = [
    "tôi tên gì",
    "thông tin của tôi",
    "thông tin cá nhân",
    "số điện thoại của tôi",
    "email của tôi",
    "tôi là ai"
  ];
  const questionLower = question.toLowerCase().trim();
  const greetings = ["hi", "hello", "xin chào", "chào bạn", "chào", "chào ai"];

  if (greetings.includes(questionLower)) {
    const answer = "Xin chào 👋 Mình là trợ lý AI quản lý nhà trọ của bạn. Mình có thể giúp bạn phân tích doanh thu, tìm phòng trống hoặc kiểm tra ai đang nợ tiền phòng. Bạn cần xem thông tin gì?";
    await saveChatMessageService(userId, "assistant", answer);

    return {
      answer,
      suggestions: ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"]
    };
  }

  if (personalQuestions.includes(questionLower)) {
    const result = await pool.request()
      .input("id", userId)
      .query(`SELECT name, email, phone FROM users WHERE id = @id`);

    const user = result.recordset[0];
    const answer = `👤 Tên: ${user.name}\n📧 Email: ${user.email}\n📱 SĐT: ${user.phone}`;

    await saveChatMessageService(userId, "assistant", answer);

    return {
      answer,
      suggestions: ["Doanh thu tháng này", "Phòng chưa thanh toán", "Xem thông tin phòng"]
    };
  }

  // 3. Phân loại Intent
  let intent = await detectIntent(question);
  intent = intent.toUpperCase();
  if (intent.includes("CHAT")) intent = "CHAT";
  if (intent.includes("DATABASE")) intent = "DATABASE";
  if (intent.includes("AMBIGUOUS")) intent = "AMBIGUOUS";

  console.log("Detected Intent:", intent);

  // 4a. Xử lý câu hỏi mơ hồ cần hỏi lại (hỏi "số phòng" mà k nói nhà nào)
  if (intent === "AMBIGUOUS") {
    // Lấy danh sách nhà của chủ trọ
    const housesResult = await pool.request()
      .input("ownerId", userId)
      .query(`SELECT id, name FROM houses WHERE owner_id = @ownerId ORDER BY name`);
    const houses = housesResult.recordset;

    let answer;
    let suggestions;

    if (houses.length === 0) {
      answer = "Dạ Quản lý, hiện tại chưa có nhà trọ nào trong hệ thống.";
      suggestions = ["Thêm nhà trọ", "Xem thông tin tài khoản"];
    } else if (houses.length === 1) {
      // Chỉ có 1 nhà thì tự hiểu luôn, chuyển sang DATABASE để xử lý
      intent = "DATABASE";
    } else {
      // Có nhiều nhà: hỏi lại người dùng muốn xem nhà nào
      const houseList = houses.map((h, i) => `${i + 1}. **${h.name}**`).join("\n");
      answer = `Dạ Quản lý, hệ thống có **${houses.length} nhà trọ**. Quản lý muốn xem của nhà nào ạ?\n\n${houseList}`;
      suggestions = houses.slice(0, 3).map(h => `Xem ${h.name}`);
    }

    if (intent === "AMBIGUOUS") { // Chỉ trả về sớm nếu VẪNN là AMBIGUOUS
      await saveChatMessageService(userId, "assistant", answer);
      return { answer, suggestions };
    }
  }

  // 4b. Xử lý CHAT bình thường
  if (intent === "CHAT") {
    const explain = await explainData(question, []);

    let answer = explain;
    let suggestions = ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"];

    if (explain.includes("[SUGGESTIONS]")) {
      const parts = explain.split("[SUGGESTIONS]");
      answer = parts[0].trim();
      suggestions = parts[1]
        .split("\n")
        .map(s => s.replace("-", "").trim())
        .filter(s => s.length > 0);
    }

    await saveChatMessageService(userId, "assistant", answer);
    return { answer, suggestions };
  }

  // 5. Xử lý nghiệp vụ DATABASE (TEXT-TO-SQL)
  const historyResult = await pool.request()
    .input("userId", userId)
    .query(`
      SELECT TOP 10 role, message 
      FROM ChatMessages 
      WHERE user_id = @userId 
      ORDER BY id DESC
    `);

  const conversationHistory = historyResult.recordset.reverse().map(item => ({
    role: item.role,
    content: item.message
  }));

  // Bổ sung ngữ cảnh về danh sách nhà vào lịch sử để SQL Generator biết
  const ownerHousesResult = await pool.request()
    .input("ownerId", userId)
    .query(`SELECT id, name FROM houses WHERE owner_id = @ownerId`);
  const houseContext = ownerHousesResult.recordset
    .map(h => `- Nhà "${h.name}" (id=${h.id})`)
    .join("\n");

  // Thêm context nhà vào đầu lịch sử (như system note)
  if (houseContext) {
    conversationHistory.unshift({
      role: "user",
      content: `[CONTEXT - Danh sách nhà của chủ trọ này:]\n${houseContext}\n[END CONTEXT]`
    });
  }

  let sqlQuery = await generateSQL(conversationHistory, userId);
  sqlQuery = sqlQuery.replace(/```sql/g, "").replace(/```/g, "").trim();
  console.log("AI Generated SQL:", sqlQuery);

  sqlQuery = validateSQL(sqlQuery);

  const result = await pool.request().query(sqlQuery);
  const data = result.recordset;


  // 6. Giải thích dữ liệu
  const explain = await explainData(question, data);

  let answer = explain;
  let suggestions = ["Doanh thu tháng này", "Phòng chưa thanh toán", "Tổng số phòng đang thuê"];

  // Fallback gợi ý thông minh dựa trên keyword nếu AI không trả về [SUGGESTIONS]
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes("doanh thu") || lowerQ.includes("tiền") || lowerQ.includes("hóa đơn")) {
    suggestions = ["Xem chi tiết hóa đơn", "Ai chưa đóng tiền", "Dự báo doanh thu"];
  } else if (lowerQ.includes("phòng")) {
    suggestions = ["Thêm phòng mới", "Phòng trống", "Cập nhật giá thuê"];
  } else if (lowerQ.includes("khách") || lowerQ.includes("thuê")) {
    suggestions = ["Thêm khách mới", "Gửi thông báo", "Xem hợp đồng"];
  }

  if (explain.includes("[SUGGESTIONS]")) {
    const parts = explain.split("[SUGGESTIONS]");
    answer = parts[0].trim();

    const rawSuggestions = parts[1]
      .split("\n")
      .map(s => s.replace(/^-/, "").trim())
      .filter(s => s.length > 2); // Loại bỏ gợi ý quá ngắn hoặc rác

    // Lọc trùng lặp bằng Set và giới hạn 2 gợi ý tốt nhất
    suggestions = [...new Set(rawSuggestions)].slice(0, 2);
  }

  await saveChatMessageService(userId, "assistant", answer);

  return { answer, suggestions };
}
