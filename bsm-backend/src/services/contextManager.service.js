/**
 * Context Manager Service
 * Quản lý ngữ cảnh hội thoại: nhà nào, thời gian nào, chủ đề gì
 */

/**
 * Quản lý context từ câu hỏi và lịch sử
 * @param {string} question - Câu hỏi hiện tại
 * @param {Array} history - Lịch sử hội thoại
 * @param {Array} houses - Danh sách nhà của chủ trọ
 * @returns {Object} - { house, month, topic, previousData }
 */
export function manageContext(question, history = [], houses = []) {
  const context = {
    house: null,        // Tên nhà đang được nhắc tới
    houseId: null,      // ID nhà
    month: null,        // Tháng đang được nhắc tới (YYYY-MM)
    topic: null,        // Chủ đề: revenue, room, invoice, tenant, meter
    previousData: null  // Dữ liệu từ câu hỏi trước (nếu có)
  };

  const questionLower = question.toLowerCase();

  // 1. Xác định HOUSE từ câu hỏi hiện tại
  for (const house of houses) {
    const houseName = house.name.toLowerCase();
    if (questionLower.includes(houseName)) {
      context.house = house.name;
      context.houseId = house.id;
      break;
    }
  }

  // 2. Nếu không tìm thấy nhà trong câu hỏi, tìm trong lịch sử (3 tin nhắn gần nhất)
  if (!context.house && history.length > 0) {
    const recentHistory = history.slice(-6); // 3 cặp user-assistant
    
    for (let i = recentHistory.length - 1; i >= 0; i--) {
      const msg = recentHistory[i].message.toLowerCase();
      
      for (const house of houses) {
        const houseName = house.name.toLowerCase();
        if (msg.includes(houseName)) {
          context.house = house.name;
          context.houseId = house.id;
          break;
        }
      }
      
      if (context.house) break;
    }
  }

  // 3. Xác định MONTH/TIME
  context.month = extractTimeContext(question, history);

  // 4. Xác định TOPIC
  context.topic = extractTopic(question, history);

  // 5. Kiểm tra từ tham chiếu (đó, này, chi tiết, xem thêm)
  const referenceWords = ["đó", "này", "kia", "chi tiết", "xem thêm", "thông tin thêm", "nói thêm", "của họ", "của anh ấy", "của chị ấy"];
  const hasReference = referenceWords.some(word => questionLower.includes(word));
  
  if (hasReference && history.length > 0) {
    // Lấy dữ liệu từ câu hỏi trước
    context.previousData = extractPreviousContext(history);
  }

  return context;
}

/**
 * Trích xuất thời gian từ câu hỏi
 */
function extractTimeContext(question, history) {
  const questionLower = question.toLowerCase();
  const now = new Date();
  
  // Tháng này
  if (questionLower.includes("tháng này") || questionLower.includes("tháng hiện tại")) {
    return formatMonth(now);
  }
  
  // Tháng trước
  if (questionLower.includes("tháng trước")) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return formatMonth(lastMonth);
  }
  
  // Tháng sau
  if (questionLower.includes("tháng sau") || questionLower.includes("tháng tới")) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return formatMonth(nextMonth);
  }
  
  // Quý này
  if (questionLower.includes("quý này")) {
    const quarter = Math.floor(now.getMonth() / 3);
    return `Q${quarter + 1}-${now.getFullYear()}`;
  }
  
  // Năm nay
  if (questionLower.includes("năm nay") || questionLower.includes("năm hiện tại")) {
    return `${now.getFullYear()}`;
  }
  
  // Tháng cụ thể: "tháng 3", "tháng 12"
  const monthMatch = questionLower.match(/tháng\s+(\d{1,2})/);
  if (monthMatch) {
    const month = parseInt(monthMatch[1]);
    if (month >= 1 && month <= 12) {
      return `${now.getFullYear()}-${String(month).padStart(2, '0')}`;
    }
  }
  
  // Năm cụ thể: "năm 2024", "2024"
  const yearMatch = questionLower.match(/năm\s+(\d{4})|(\d{4})/);
  if (yearMatch) {
    const year = yearMatch[1] || yearMatch[2];
    return year;
  }
  
  // Nếu không tìm thấy, tìm trong lịch sử
  if (history.length > 0) {
    const recentHistory = history.slice(-4);
    for (let i = recentHistory.length - 1; i >= 0; i--) {
      const msg = recentHistory[i].message.toLowerCase();
      
      if (msg.includes("tháng này")) return formatMonth(now);
      if (msg.includes("tháng trước")) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return formatMonth(lastMonth);
      }
      
      const monthMatch = msg.match(/tháng\s+(\d{1,2})/);
      if (monthMatch) {
        const month = parseInt(monthMatch[1]);
        if (month >= 1 && month <= 12) {
          return `${now.getFullYear()}-${String(month).padStart(2, '0')}`;
        }
      }
    }
  }
  
  // Mặc định: tháng hiện tại
  return formatMonth(now);
}

/**
 * Trích xuất chủ đề từ câu hỏi
 */
function extractTopic(question, history) {
  const questionLower = question.toLowerCase();
  
  // Revenue/Doanh thu
  if (questionLower.includes("doanh thu") || 
      questionLower.includes("tiền thu") ||
      questionLower.includes("thu nhập") ||
      questionLower.includes("revenue")) {
    return "revenue";
  }
  
  // Invoice/Hóa đơn
  if (questionLower.includes("hóa đơn") || 
      questionLower.includes("thanh toán") ||
      questionLower.includes("đóng tiền") ||
      questionLower.includes("nợ") ||
      questionLower.includes("chưa đóng") ||
      questionLower.includes("invoice")) {
    return "invoice";
  }
  
  // Room/Phòng
  if (questionLower.includes("phòng") || 
      questionLower.includes("room") ||
      questionLower.includes("trống") ||
      questionLower.includes("đang thuê")) {
    return "room";
  }
  
  // Tenant/Khách thuê
  if (questionLower.includes("khách") || 
      questionLower.includes("thuê") ||
      questionLower.includes("tenant") ||
      questionLower.includes("người thuê")) {
    return "tenant";
  }
  
  // Meter/Điện nước
  if (questionLower.includes("điện") || 
      questionLower.includes("nước") ||
      questionLower.includes("meter") ||
      questionLower.includes("chỉ số")) {
    return "meter";
  }
  
  // Tìm trong lịch sử
  if (history.length > 0) {
    const recentHistory = history.slice(-4);
    for (let i = recentHistory.length - 1; i >= 0; i--) {
      const msg = recentHistory[i].message.toLowerCase();
      
      if (msg.includes("doanh thu")) return "revenue";
      if (msg.includes("hóa đơn") || msg.includes("thanh toán")) return "invoice";
      if (msg.includes("phòng")) return "room";
      if (msg.includes("khách") || msg.includes("thuê")) return "tenant";
      if (msg.includes("điện") || msg.includes("nước")) return "meter";
    }
  }
  
  return null;
}

/**
 * Trích xuất context từ câu hỏi trước
 */
function extractPreviousContext(history) {
  if (history.length < 2) return null;
  
  // Lấy 2 tin nhắn gần nhất (user + assistant)
  const recent = history.slice(-2);
  
  return {
    userQuestion: recent[0]?.message || "",
    assistantResponse: recent[1]?.message || ""
  };
}

/**
 * Format tháng thành YYYY-MM
 */
function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
