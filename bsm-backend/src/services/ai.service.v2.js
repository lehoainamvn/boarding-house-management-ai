/**
 * BSM AI Assistant - Service chính
 * Xử lý luồng chat theo kiến trúc mới:
 * User Question → Intent Classifier → Context Manager → SQL Generator → Execute SQL → Response Generator → Suggestion Engine
 */

import { poolPromise } from "../config/db.js";
import { classifyIntent } from "./intentClassifier.service.js";
import { manageContext } from "./contextManager.service.js";
import { generateSecureSQL } from "./sqlGenerator.service.v2.js";
import { generateResponse } from "./responseGenerator.service.js";
import { generateSuggestions } from "./suggestionEngine.service.js";
import { saveChatMessage, getChatHistory } from "./chatMemory.service.js";
import { analyzeBusinessHealth } from "./businessAdvisor.service.js";
import { searchMarketPrice, searchGeneral, searchManagementTips } from "./webSearch.service.js";

/**
 * Xử lý chat với AI - Entry point chính
 * @param {number} userId - ID của chủ trọ
 * @param {string} question - Câu hỏi của người dùng
 * @returns {Promise<Object>} - { intent, response, sql, suggestions, context }
 */
export async function processAiChat(userId, question) {
  try {
    const pool = await poolPromise;

    // 1. Lưu tin nhắn user
    await saveChatMessage(userId, "user", question);

    // 2. Lấy lịch sử hội thoại (10 tin nhắn gần nhất)
    const history = await getChatHistory(userId, 10);

    // 3. Lấy thông tin user
    const userResult = await pool.request()
      .input("id", userId)
      .query(`SELECT name, email, phone FROM users WHERE id = @id`);
    const userInfo = userResult.recordset[0];

    // 4. Lấy danh sách nhà của chủ trọ
    const housesResult = await pool.request()
      .input("ownerId", userId)
      .query(`SELECT id, name, address FROM houses WHERE owner_id = @ownerId ORDER BY name`);
    const houses = housesResult.recordset;

    // 5. Phân loại Intent
    const intentResult = await classifyIntent(question, history);
    const intent = intentResult.intent; // CHAT | DATABASE | AMBIGUOUS

    console.log(`[AI Service] Intent: ${intent}`);

    // 6. Quản lý Context (nhớ nhà, thời gian, chủ đề)
    const context = manageContext(question, history, houses);

    console.log(`[AI Service] Context:`, context);

    // 7. Xử lý theo Intent
    let response = "";
    let sql = null;
    let suggestions = [];
    let data = [];

    switch (intent) {
      case "CHAT":
        // Xử lý chat thông thường (chào hỏi, hỏi thông tin cá nhân, tâm sự)
        response = await handleChatIntent(question, userInfo, houses);
        
        // Xử lý các request đặc biệt
        if (response === "BUSINESS_ANALYSIS_REQUEST") {
          // Phân tích kinh doanh
          const businessAnalysis = await analyzeBusinessHealth(userId);
          response = formatBusinessAnalysis(businessAnalysis);
          suggestions = [
            "Xem chi tiết từng nhà",
            "Tips cải thiện occupancy"
          ];
        } else if (response === "MARKET_PRICE_REQUEST") {
          // Tìm kiếm giá thị trường
          const location = extractLocation(question, houses);
          const marketData = await searchMarketPrice(location, "phòng trọ");
          response = formatMarketPrice(marketData);
          suggestions = [
            "So sánh với giá hiện tại",
            "Tips tăng giá"
          ];
        } else if (response === "TIPS_REQUEST") {
          // Tìm kiếm tips
          const topic = extractTipsTopic(question);
          const tips = await searchManagementTips(topic);
          response = formatTips(tips, topic);
          suggestions = [
            "Tips khác",
            "Phân tích kinh doanh"
          ];
        } else if (response === "GENERAL_QUESTION") {
          // ✨ Trả lời MỌI câu hỏi bằng AI (như ChatGPT)
          response = await searchGeneral(question);
          suggestions = [
            "Hỏi thêm",
            "Doanh thu tháng này"
          ];
        } else {
          suggestions = generateSuggestions(intent, question, data, context);
        }
        break;

      case "AMBIGUOUS":
        // Câu hỏi mơ hồ - cần làm rõ
        response = await handleAmbiguousIntent(question, houses, context);
        suggestions = generateSuggestions(intent, question, data, context);
        break;

      case "DATABASE":
        // Truy vấn database
        const dbResult = await handleDatabaseIntent(
          userId,
          question,
          history,
          context,
          houses
        );
        response = dbResult.response;
        sql = dbResult.sql;
        data = dbResult.data;
        suggestions = generateSuggestions(intent, question, data, context);
        break;

      default:
        response = "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể diễn đạt lại được không?";
        suggestions = ["Doanh thu tháng này", "Phòng trống"];
    }

    // 8. Lưu phản hồi của assistant
    await saveChatMessage(userId, "assistant", response);

    // 9. Trả về kết quả theo format chuẩn
    return {
      intent,
      response,
      sql,
      suggestions,
      context
    };

  } catch (error) {
    console.error("[AI Service] Error:", error);
    
    // Lưu lỗi vào chat history
    const errorResponse = "⚠️ Hệ thống đang gặp sự cố tạm thời, anh vui lòng thử lại sau.";
    await saveChatMessage(userId, "assistant", errorResponse);

    return {
      intent: "ERROR",
      response: errorResponse,
      sql: null,
      suggestions: ["Thử lại", "Doanh thu tháng này"],
      context: {}
    };
  }
}

/**
 * Xử lý Intent: CHAT
 */
async function handleChatIntent(question, userInfo, houses) {
  const questionLower = question.toLowerCase().trim();

  // Chào hỏi
  const greetings = ["hi", "hello", "xin chào", "chào bạn", "chào", "chào ai", "hey"];
  if (greetings.some(g => questionLower === g || questionLower.startsWith(g + " "))) {
    return `Xin chào 👋 Mình là BSM AI Assistant - trợ lý AI thông minh dành riêng cho hệ thống quản lý nhà trọ của anh/chị.\n\nMình có thể giúp anh/chị:\n• Phân tích doanh thu\n• Kiểm tra phòng trống\n• Theo dõi hóa đơn\n• Tra cứu khách thuê\n• **Tư vấn kinh doanh** 💡\n• **Phân tích thị trường** 📊\n• **Đưa ra khuyến nghị cải thiện** 🎯\n\nAnh/chị cần xem thông tin gì ạ?`;
  }

  // Hỏi thông tin cá nhân
  const personalQuestions = [
    "tôi tên gì", "tên tôi", "thông tin của tôi", "thông tin cá nhân",
    "số điện thoại của tôi", "email của tôi", "tôi là ai", "sdt của tôi"
  ];
  if (personalQuestions.some(pq => questionLower.includes(pq))) {
    return `👤 **Thông tin cá nhân**\n\n• Tên: ${userInfo.name}\n• Email: ${userInfo.email}\n• Số điện thoại: ${userInfo.phone}`;
  }

  // Hỏi về AI
  const aiQuestions = ["bạn là ai", "ai là bạn", "giới thiệu", "bạn làm gì"];
  if (aiQuestions.some(aq => questionLower.includes(aq))) {
    return `Mình là **BSM AI Assistant** - trợ lý AI được thiết kế đặc biệt để hỗ trợ quản lý nhà trọ.\n\nMình có thể giúp anh/chị:\n✅ Truy vấn dữ liệu nhanh chóng\n✅ Phân tích doanh thu chi tiết\n✅ Kiểm tra tình trạng phòng\n✅ Theo dõi hóa đơn thanh toán\n✅ Quản lý thông tin khách thuê\n✅ **Phân tích tình hình kinh doanh** 📊\n✅ **Tư vấn giá trọ thị trường** 💰\n✅ **Đưa ra khuyến nghị cải thiện** 💡\n✅ **Tìm kiếm thông tin ngoài** 🔍\n\nMình luôn sẵn sàng hỗ trợ 24/7! 🚀`;
  }

  // Cảm ơn
  if (questionLower.includes("cảm ơn") || questionLower.includes("thank")) {
    return "Dạ không có gì ạ! Mình luôn sẵn sàng hỗ trợ anh/chị. 😊";
  }

  // Tạm biệt
  if (questionLower.includes("tạm biệt") || questionLower.includes("bye") || questionLower === "bb") {
    return "Tạm biệt anh/chị! Chúc anh/chị một ngày tốt lành. Hẹn gặp lại! 👋";
  }

  // Yêu cầu phân tích kinh doanh
  const businessAnalysisKeywords = [
    "phân tích kinh doanh", "tình hình kinh doanh", "đánh giá kinh doanh",
    "tư vấn", "khuyến nghị", "cải thiện", "vấn đề", "insight"
  ];
  if (businessAnalysisKeywords.some(kw => questionLower.includes(kw))) {
    return "BUSINESS_ANALYSIS_REQUEST";
  }

  // Hỏi về giá thị trường
  const marketPriceKeywords = [
    "giá thị trường", "giá trọ", "giá phòng", "thị trường",
    "so sánh giá", "giá hiện tại"
  ];
  if (marketPriceKeywords.some(kw => questionLower.includes(kw))) {
    return "MARKET_PRICE_REQUEST";
  }

  // Hỏi tips/mẹo
  const tipsKeywords = ["tips", "mẹo", "cách", "làm sao", "làm thế nào"];
  if (tipsKeywords.some(kw => questionLower.includes(kw))) {
    return "TIPS_REQUEST";
  }

  // ✨ MỌI câu hỏi khác - trả lời bằng AI (như ChatGPT)
  return "GENERAL_QUESTION";
}

/**
 * Xử lý Intent: AMBIGUOUS
 */
async function handleAmbiguousIntent(question, houses, context) {
  if (houses.length === 0) {
    return "Dạ Quản lý, hiện tại chưa có nhà trọ nào trong hệ thống. Anh/chị vui lòng thêm nhà trọ trước nhé.";
  }

  if (houses.length === 1) {
    // Chỉ có 1 nhà thì không cần hỏi, nhưng thông báo cho user biết
    return `Dạ, hệ thống hiện có 1 nhà trọ: **${houses[0].name}**. Anh/chị muốn xem thông tin gì về nhà này ạ?`;
  }

  // Có nhiều nhà - yêu cầu chọn
  const houseList = houses.map((h, i) => `${i + 1}. **${h.name}**`).join("\n");
  return `Dạ Quản lý, hệ thống có **${houses.length} nhà trọ**:\n\n${houseList}\n\nAnh/chị muốn xem thông tin của nhà nào ạ?`;
}

/**
 * Xử lý Intent: DATABASE
 */
async function handleDatabaseIntent(userId, question, history, context, houses) {
  try {
    const pool = await poolPromise;

    // 1. Generate SQL với context
    const sql = await generateSecureSQL(userId, question, history, context, houses);
    
    console.log(`[AI Service] Generated SQL:`, sql);

    // 2. Validate và execute SQL
    if (!sql || sql.trim() === "") {
      throw new Error("Không thể tạo câu truy vấn SQL");
    }

    const result = await pool.request().query(sql);
    const data = result.recordset || [];

    console.log(`[AI Service] Query returned ${data.length} rows`);

    // 3. Generate response từ dữ liệu
    const response = await generateResponse(question, data, context);

    return {
      response,
      sql,
      data
    };

  } catch (error) {
    console.error("[AI Service] Database Intent Error:", error);
    
    return {
      response: "⚠️ Xin lỗi, mình gặp khó khăn khi truy vấn dữ liệu. Anh/chị có thể diễn đạt lại câu hỏi được không?",
      sql: null,
      data: []
    };
  }
}

/**
 * Format phân tích kinh doanh
 */
function formatBusinessAnalysis(analysis) {
  const { analysis: metrics, issues, recommendations } = analysis;
  
  let response = `📊 **PHÂN TÍCH TÌNH HÌNH KINH DOANH**\n\n`;
  
  // Tổng quan
  response += `**Tổng quan:**\n`;
  response += `• Doanh thu tháng này: ${metrics.totalRevenue.toLocaleString()} VNĐ\n`;
  response += `• Tăng trưởng: ${metrics.revenueGrowth > 0 ? '+' : ''}${metrics.revenueGrowth}%\n`;
  response += `• Tỷ lệ lấp đầy: ${metrics.occupancyRate}% (${metrics.occupiedRooms}/${metrics.totalRooms} phòng)\n`;
  response += `• Phòng trống: ${metrics.emptyRooms} phòng\n`;
  response += `• Hóa đơn chưa thanh toán: ${metrics.unpaidInvoices} (${metrics.totalDebt.toLocaleString()} VNĐ)\n\n`;
  
  // Vấn đề cần cải thiện
  if (issues.length > 0) {
    response += `⚠️ **Vấn đề cần cải thiện:**\n`;
    issues.forEach((issue, index) => {
      const icon = issue.severity === "HIGH" ? "🔴" : "🟡";
      response += `${icon} ${issue.title}\n`;
      response += `   ${issue.description}\n`;
      response += `   → ${issue.impact}\n\n`;
    });
  } else {
    response += `✅ **Tình hình tốt!** Không phát hiện vấn đề nghiêm trọng.\n\n`;
  }
  
  // Khuyến nghị
  if (recommendations.overview) {
    response += `💡 **Đánh giá:**\n${recommendations.overview}\n\n`;
  }
  
  if (recommendations.recommendations && recommendations.recommendations.length > 0) {
    response += `🎯 **Khuyến nghị:**\n`;
    recommendations.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === "HIGH" ? "🔥" : rec.priority === "MEDIUM" ? "⚡" : "💡";
      response += `${priorityIcon} **${rec.title}**\n`;
      response += `   • Hành động: ${rec.action}\n`;
      response += `   • Lý do: ${rec.reason}\n`;
      response += `   • Kết quả mong đợi: ${rec.expected_result}\n`;
      if (rec.timeframe) {
        response += `   • Thời gian: ${rec.timeframe}\n`;
      }
      response += `\n`;
    });
  }
  
  return response;
}

/**
 * Format thông tin giá thị trường
 */
function formatMarketPrice(marketData) {
  let response = `💰 **THÔNG TIN GIÁ THỊ TRƯỜNG**\n\n`;
  
  response += `📍 **Khu vực:** ${marketData.location}\n`;
  response += `🏠 **Loại:** ${marketData.roomType}\n\n`;
  
  if (marketData.priceRange) {
    response += `**Mức giá trung bình:**\n`;
    response += `• Thấp nhất: ${marketData.priceRange.min.toLocaleString()} VNĐ/tháng\n`;
    response += `• Trung bình: ${marketData.priceRange.average.toLocaleString()} VNĐ/tháng\n`;
    response += `• Cao nhất: ${marketData.priceRange.max.toLocaleString()} VNĐ/tháng\n\n`;
  }
  
  if (marketData.byRoomType && marketData.byRoomType.length > 0) {
    response += `**Phân loại theo loại phòng:**\n`;
    marketData.byRoomType.forEach(room => {
      response += `• ${room.type} (${room.size}): ${room.priceRange}\n`;
    });
    response += `\n`;
  }
  
  if (marketData.factors && marketData.factors.length > 0) {
    response += `**Yếu tố ảnh hưởng giá:**\n`;
    marketData.factors.forEach(factor => {
      response += `• ${factor}\n`;
    });
    response += `\n`;
  }
  
  if (marketData.trend) {
    response += `📈 **Xu hướng:** ${marketData.trend}\n\n`;
  }
  
  if (marketData.recommendation) {
    response += `💡 **Khuyến nghị:** ${marketData.recommendation}\n`;
  }
  
  return response;
}

/**
 * Format tips
 */
function formatTips(tips, topic) {
  let response = `💡 **TIPS VỀ ${topic.toUpperCase()}**\n\n`;
  
  if (tips.length === 0) {
    response += `Xin lỗi, hiện tại mình chưa có tips cụ thể về chủ đề này. Anh/chị có thể hỏi về:\n`;
    response += `• Tăng tỷ lệ lấp đầy\n`;
    response += `• Giảm chi phí vận hành\n`;
    response += `• Thu hồi công nợ\n`;
    response += `• Marketing nhà trọ\n`;
    return response;
  }
  
  tips.forEach((tip, index) => {
    const difficultyIcon = tip.difficulty === "Dễ" ? "🟢" : tip.difficulty === "Trung bình" ? "🟡" : "🔴";
    response += `${index + 1}. **${tip.title}** ${difficultyIcon}\n`;
    response += `   ${tip.description}\n`;
    if (tip.example) {
      response += `   📌 Ví dụ: ${tip.example}\n`;
    }
    if (tip.impact) {
      response += `   ✨ Tác động: ${tip.impact}\n`;
    }
    response += `\n`;
  });
  
  return response;
}

/**
 * Trích xuất địa điểm từ câu hỏi
 */
function extractLocation(question, houses) {
  // Tìm trong danh sách nhà
  for (const house of houses) {
    if (question.toLowerCase().includes(house.name.toLowerCase())) {
      return house.address || "Việt Nam";
    }
  }
  
  // Tìm các từ khóa địa điểm
  const locationKeywords = [
    "quận 1", "quận 2", "quận 3", "quận 4", "quận 5",
    "tp.hcm", "hà nội", "đà nẵng", "cần thơ",
    "bình thạnh", "tân bình", "phú nhuận"
  ];
  
  for (const keyword of locationKeywords) {
    if (question.toLowerCase().includes(keyword)) {
      return keyword;
    }
  }
  
  return "Việt Nam";
}

/**
 * Trích xuất chủ đề tips từ câu hỏi
 */
function extractTipsTopic(question) {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes("lấp đầy") || questionLower.includes("occupancy")) {
    return "tăng tỷ lệ lấp đầy";
  }
  if (questionLower.includes("chi phí") || questionLower.includes("tiết kiệm")) {
    return "giảm chi phí vận hành";
  }
  if (questionLower.includes("nợ") || questionLower.includes("thu hồi")) {
    return "thu hồi công nợ";
  }
  if (questionLower.includes("marketing") || questionLower.includes("quảng cáo")) {
    return "marketing nhà trọ";
  }
  if (questionLower.includes("khách") || questionLower.includes("tenant")) {
    return "quản lý khách thuê";
  }
  
  return "quản lý nhà trọ";
}
