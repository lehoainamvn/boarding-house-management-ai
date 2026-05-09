/**
 * Business Advisor Service
 * Phân tích kinh doanh và đưa ra tư vấn cho chủ trọ
 */

import Groq from "groq-sdk";
import dotenv from "dotenv";
import { poolPromise } from "../config/db.js";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Phân tích tình hình kinh doanh tổng thể
 * @param {number} userId - ID chủ trọ
 * @returns {Promise<Object>} - Phân tích và khuyến nghị
 */
export async function analyzeBusinessHealth(userId) {
  try {
    const pool = await poolPromise;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = getPreviousMonth(currentMonth);

    // 1. Lấy dữ liệu tổng hợp
    const revenueQuery = await pool.request()
      .input("userId", userId)
      .input("currentMonth", currentMonth)
      .input("lastMonth", lastMonth)
      .query(`
        SELECT 
          h.name AS house_name,
          -- Doanh thu tháng này
          ISNULL(SUM(CASE WHEN i.month = @currentMonth AND i.status = 'PAID' THEN i.total_amount ELSE 0 END), 0) AS current_revenue,
          -- Doanh thu tháng trước
          ISNULL(SUM(CASE WHEN i.month = @lastMonth AND i.status = 'PAID' THEN i.total_amount ELSE 0 END), 0) AS last_revenue,
          -- Tổng số phòng
          COUNT(DISTINCT r.id) AS total_rooms,
          -- Phòng đang thuê
          COUNT(DISTINCT CASE WHEN r.status = 'OCCUPIED' THEN r.id END) AS occupied_rooms,
          -- Hóa đơn chưa thanh toán tháng này
          COUNT(DISTINCT CASE WHEN i.month = @currentMonth AND i.status = 'UNPAID' THEN i.id END) AS unpaid_invoices,
          -- Tổng tiền nợ
          ISNULL(SUM(CASE WHEN i.status = 'UNPAID' THEN i.total_amount ELSE 0 END), 0) AS total_debt
        FROM houses h
        LEFT JOIN rooms r ON h.id = r.house_id
        LEFT JOIN invoices i ON r.id = i.room_id
        WHERE h.owner_id = @userId
        GROUP BY h.name
      `);

    const data = revenueQuery.recordset;

    // 2. Tính toán các chỉ số
    const analysis = calculateBusinessMetrics(data);

    // 3. Nhận diện vấn đề
    const issues = identifyIssues(analysis);

    // 4. Đưa ra khuyến nghị bằng AI
    const recommendations = await generateRecommendations(analysis, issues);

    return {
      analysis,
      issues,
      recommendations,
      data
    };

  } catch (error) {
    console.error("[Business Advisor] Error:", error);
    throw error;
  }
}

/**
 * Tính toán các chỉ số kinh doanh
 */
function calculateBusinessMetrics(data) {
  const totals = data.reduce((acc, house) => {
    acc.totalRevenue += house.current_revenue;
    acc.lastRevenue += house.last_revenue;
    acc.totalRooms += house.total_rooms;
    acc.occupiedRooms += house.occupied_rooms;
    acc.unpaidInvoices += house.unpaid_invoices;
    acc.totalDebt += house.total_debt;
    return acc;
  }, {
    totalRevenue: 0,
    lastRevenue: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    unpaidInvoices: 0,
    totalDebt: 0
  });

  // Tính các chỉ số
  const occupancyRate = totals.totalRooms > 0 
    ? (totals.occupiedRooms / totals.totalRooms * 100).toFixed(1)
    : 0;

  const revenueGrowth = totals.lastRevenue > 0
    ? ((totals.totalRevenue - totals.lastRevenue) / totals.lastRevenue * 100).toFixed(1)
    : 0;

  const debtRatio = totals.totalRevenue > 0
    ? (totals.totalDebt / totals.totalRevenue * 100).toFixed(1)
    : 0;

  return {
    totalRevenue: totals.totalRevenue,
    lastRevenue: totals.lastRevenue,
    revenueGrowth: parseFloat(revenueGrowth),
    totalRooms: totals.totalRooms,
    occupiedRooms: totals.occupiedRooms,
    emptyRooms: totals.totalRooms - totals.occupiedRooms,
    occupancyRate: parseFloat(occupancyRate),
    unpaidInvoices: totals.unpaidInvoices,
    totalDebt: totals.totalDebt,
    debtRatio: parseFloat(debtRatio),
    houses: data
  };
}

/**
 * Nhận diện các vấn đề cần cải thiện
 */
function identifyIssues(analysis) {
  const issues = [];

  // 1. Tỷ lệ lấp đầy thấp
  if (analysis.occupancyRate < 70) {
    issues.push({
      type: "LOW_OCCUPANCY",
      severity: "HIGH",
      title: "Tỷ lệ lấp đầy thấp",
      description: `Tỷ lệ lấp đầy chỉ đạt ${analysis.occupancyRate}%, thấp hơn mức trung bình ngành (70-85%)`,
      impact: "Doanh thu không tối ưu, nhiều phòng trống"
    });
  } else if (analysis.occupancyRate < 85) {
    issues.push({
      type: "MEDIUM_OCCUPANCY",
      severity: "MEDIUM",
      title: "Tỷ lệ lấp đầy trung bình",
      description: `Tỷ lệ lấp đầu đạt ${analysis.occupancyRate}%, còn có thể cải thiện`,
      impact: "Vẫn còn tiềm năng tăng doanh thu"
    });
  }

  // 2. Doanh thu giảm
  if (analysis.revenueGrowth < -10) {
    issues.push({
      type: "REVENUE_DECLINE",
      severity: "HIGH",
      title: "Doanh thu giảm mạnh",
      description: `Doanh thu giảm ${Math.abs(analysis.revenueGrowth)}% so với tháng trước`,
      impact: "Cần hành động ngay để cải thiện tình hình"
    });
  } else if (analysis.revenueGrowth < 0) {
    issues.push({
      type: "REVENUE_DECLINE",
      severity: "MEDIUM",
      title: "Doanh thu giảm nhẹ",
      description: `Doanh thu giảm ${Math.abs(analysis.revenueGrowth)}% so với tháng trước`,
      impact: "Cần theo dõi và có biện pháp điều chỉnh"
    });
  }

  // 3. Nợ cao
  if (analysis.debtRatio > 30) {
    issues.push({
      type: "HIGH_DEBT",
      severity: "HIGH",
      title: "Tỷ lệ nợ cao",
      description: `${analysis.unpaidInvoices} hóa đơn chưa thanh toán, chiếm ${analysis.debtRatio}% doanh thu`,
      impact: "Ảnh hưởng đến dòng tiền, cần thu hồi công nợ"
    });
  } else if (analysis.debtRatio > 15) {
    issues.push({
      type: "MEDIUM_DEBT",
      severity: "MEDIUM",
      title: "Có công nợ cần theo dõi",
      description: `${analysis.unpaidInvoices} hóa đơn chưa thanh toán, chiếm ${analysis.debtRatio}% doanh thu`,
      impact: "Nên nhắc nhở khách thanh toán"
    });
  }

  // 4. Nhiều phòng trống
  if (analysis.emptyRooms > analysis.totalRooms * 0.3) {
    issues.push({
      type: "MANY_EMPTY_ROOMS",
      severity: "HIGH",
      title: "Nhiều phòng trống",
      description: `${analysis.emptyRooms}/${analysis.totalRooms} phòng đang trống`,
      impact: "Cần tăng cường marketing và tìm khách mới"
    });
  }

  return issues;
}

/**
 * Tạo khuyến nghị bằng AI
 */
async function generateRecommendations(analysis, issues) {
  try {
    const systemPrompt = `
Bạn là chuyên gia tư vấn kinh doanh nhà trọ với 10+ năm kinh nghiệm.

NHIỆM VỤ: Phân tích tình hình kinh doanh và đưa ra khuyến nghị cụ thể, khả thi.

DỮ LIỆU KINH DOANH:
- Doanh thu tháng này: ${analysis.totalRevenue.toLocaleString()} VNĐ
- Doanh thu tháng trước: ${analysis.lastRevenue.toLocaleString()} VNĐ
- Tăng trưởng: ${analysis.revenueGrowth}%
- Tỷ lệ lấp đầy: ${analysis.occupancyRate}%
- Phòng trống: ${analysis.emptyRooms}/${analysis.totalRooms}
- Hóa đơn chưa thanh toán: ${analysis.unpaidInvoices}
- Tổng nợ: ${analysis.totalDebt.toLocaleString()} VNĐ
- Tỷ lệ nợ: ${analysis.debtRatio}%

VẤN ĐỀ NHẬN DIỆN:
${issues.map(issue => `- [${issue.severity}] ${issue.title}: ${issue.description}`).join('\n')}

YÊU CẦU:
1. Đánh giá tổng quan tình hình (1-2 câu)
2. Đưa ra 3-5 khuyến nghị CỤ THỂ, KHẢ THI
3. Mỗi khuyến nghị phải có:
   - Hành động cụ thể
   - Lý do
   - Kết quả mong đợi
4. Ưu tiên các vấn đề HIGH severity

PHONG CÁCH:
- Chuyên nghiệp nhưng dễ hiểu
- Tập trung vào giải pháp thực tế
- Không dùng thuật ngữ phức tạp

OUTPUT FORMAT:
Trả về JSON:
{
  "overview": "Đánh giá tổng quan",
  "recommendations": [
    {
      "priority": "HIGH/MEDIUM/LOW",
      "title": "Tiêu đề ngắn gọn",
      "action": "Hành động cụ thể cần làm",
      "reason": "Tại sao cần làm",
      "expected_result": "Kết quả mong đợi",
      "timeframe": "Thời gian thực hiện"
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hãy phân tích và đưa ra khuyến nghị." }
      ]
    });

    const response = completion.choices[0].message.content.trim();
    
    // Parse JSON
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      // Fallback nếu không parse được
      return {
        overview: response,
        recommendations: []
      };
    }

  } catch (error) {
    console.error("[Business Advisor] Generate Recommendations Error:", error);
    return {
      overview: "Không thể tạo khuyến nghị lúc này.",
      recommendations: []
    };
  }
}

/**
 * Helper: Lấy tháng trước
 */
function getPreviousMonth(currentMonth) {
  const [year, month] = currentMonth.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * So sánh giá trọ với thị trường (sẽ tích hợp web search)
 * @param {string} location - Địa chỉ/khu vực
 * @param {number} currentPrice - Giá hiện tại
 * @returns {Promise<Object>} - Phân tích giá thị trường
 */
export async function compareMarketPrice(location, currentPrice) {
  // TODO: Tích hợp web search để tìm giá thị trường
  // Hiện tại trả về mock data
  return {
    currentPrice,
    marketAverage: currentPrice * 1.1,
    recommendation: "Giá của bạn thấp hơn thị trường 10%, có thể tăng giá để tối ưu doanh thu."
  };
}
