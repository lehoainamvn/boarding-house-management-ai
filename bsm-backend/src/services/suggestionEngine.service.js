/**
 * Suggestion Engine Service
 * Tạo gợi ý câu hỏi tiếp theo thông minh
 */

/**
 * Generate suggestions dựa trên intent, câu hỏi, dữ liệu và context
 * @param {string} intent - CHAT | DATABASE | AMBIGUOUS
 * @param {string} question - Câu hỏi hiện tại
 * @param {Array} data - Dữ liệu từ database
 * @param {Object} context - Context
 * @returns {Array<string>} - Mảng 2 gợi ý
 */
export function generateSuggestions(intent, question, data = [], context = {}) {
  const questionLower = question.toLowerCase();

  // 1. Suggestions cho CHAT
  if (intent === "CHAT") {
    return [
      "Doanh thu tháng này",
      "Phòng trống"
    ];
  }

  // 2. Suggestions cho AMBIGUOUS
  if (intent === "AMBIGUOUS") {
    if (context.house) {
      return [
        `Xem ${context.house}`,
        "Doanh thu tháng này"
      ];
    }
    return [
      "Xem tất cả nhà",
      "Doanh thu tháng này"
    ];
  }

  // 3. Suggestions cho DATABASE - dựa trên topic và dữ liệu
  
  // 3.1. Topic: REVENUE (Doanh thu)
  if (context.topic === "revenue" || questionLower.includes("doanh thu")) {
    if (data.length > 0) {
      return [
        "So sánh tháng trước",
        "Ai chưa đóng tiền"
      ];
    }
    return [
      "Xem tháng trước",
      "Phòng trống"
    ];
  }

  // 3.2. Topic: INVOICE (Hóa đơn)
  if (context.topic === "invoice" || questionLower.includes("hóa đơn") || questionLower.includes("thanh toán")) {
    if (data.length > 0) {
      // Kiểm tra có hóa đơn chưa thanh toán không
      const hasUnpaid = data.some(row => 
        row.TrangThai === "UNPAID" || 
        row.status === "UNPAID" ||
        String(row.TrangThai).toLowerCase().includes("chưa")
      );
      
      if (hasUnpaid) {
        return [
          "Xem chi tiết khách nợ",
          "Doanh thu tháng này"
        ];
      }
      return [
        "Xem tháng trước",
        "Doanh thu tháng này"
      ];
    }
    return [
      "Xem tháng trước",
      "Phòng trống"
    ];
  }

  // 3.3. Topic: ROOM (Phòng)
  if (context.topic === "room" || questionLower.includes("phòng")) {
    if (data.length > 0) {
      // Kiểm tra có phòng trống không
      const hasEmpty = data.some(row => 
        row.TrangThai === "Trống" || 
        row.status === "Trống" ||
        String(row.TrangThai).toLowerCase().includes("trống")
      );
      
      if (hasEmpty) {
        return [
          "Xem giá thuê",
          "Doanh thu tháng này"
        ];
      }
      return [
        "Xem khách thuê",
        "Doanh thu tháng này"
      ];
    }
    return [
      "Thêm phòng mới",
      "Doanh thu tháng này"
    ];
  }

  // 3.4. Topic: TENANT (Khách thuê)
  if (context.topic === "tenant" || questionLower.includes("khách") || questionLower.includes("thuê")) {
    if (data.length > 0) {
      return [
        "Xem hóa đơn",
        "Ai chưa đóng tiền"
      ];
    }
    return [
      "Phòng trống",
      "Doanh thu tháng này"
    ];
  }

  // 3.5. Topic: METER (Điện nước)
  if (context.topic === "meter" || questionLower.includes("điện") || questionLower.includes("nước")) {
    if (data.length > 0) {
      return [
        "So sánh tháng trước",
        "Xem hóa đơn"
      ];
    }
    return [
      "Xem tháng trước",
      "Doanh thu tháng này"
    ];
  }

  // 4. Suggestions mặc định dựa trên keywords
  
  // Doanh thu
  if (questionLower.includes("doanh thu") || questionLower.includes("tiền")) {
    return [
      "So sánh tháng trước",
      "Ai chưa đóng tiền"
    ];
  }

  // Phòng
  if (questionLower.includes("phòng")) {
    return [
      "Phòng trống",
      "Xem giá thuê"
    ];
  }

  // Khách thuê
  if (questionLower.includes("khách") || questionLower.includes("thuê")) {
    return [
      "Xem hóa đơn",
      "Thông tin liên hệ"
    ];
  }

  // Hóa đơn
  if (questionLower.includes("hóa đơn") || questionLower.includes("thanh toán") || questionLower.includes("nợ")) {
    return [
      "Ai chưa đóng tiền",
      "Doanh thu tháng này"
    ];
  }

  // Điện nước
  if (questionLower.includes("điện") || questionLower.includes("nước")) {
    return [
      "Xem chỉ số",
      "So sánh tháng trước"
    ];
  }

  // So sánh
  if (questionLower.includes("so sánh") || questionLower.includes("tháng trước")) {
    return [
      "Dự báo doanh thu",
      "Xem chi tiết"
    ];
  }

  // Chi tiết
  if (questionLower.includes("chi tiết") || questionLower.includes("xem thêm")) {
    return [
      "So sánh tháng trước",
      "Doanh thu tháng này"
    ];
  }

  // 5. Suggestions mặc định cuối cùng
  return [
    "Doanh thu tháng này",
    "Phòng trống"
  ];
}
