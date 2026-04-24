import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_REVENUE_URL = `${API_BASE_URL}/revenue`;

/**
 * Lấy doanh thu (biểu đồ hoặc bảng)
 * Hỗ trợ nhận object { year, month, houseId }
 */
export async function getRevenue(params = {}) {
  const { year, month, houseId } = params;
  const urlParams = new URLSearchParams();
  if (year) urlParams.append("year", year);
  if (month) urlParams.append("month", month);
  if (houseId) urlParams.append("houseId", houseId);

  const res = await fetch(`${API_REVENUE_URL}?${urlParams.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy doanh thu");
}

/**
 * Lấy tổng hợp doanh thu (KPI cards)
 */
export async function getRevenueSummary(year, houseId) {
  const urlParams = new URLSearchParams();
  if (year) urlParams.append("year", year);
  if (houseId) urlParams.append("houseId", houseId);

  const res = await fetch(`${API_REVENUE_URL}/summary?${urlParams.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy tổng hợp doanh thu");
}

/**
 * Lấy doanh thu theo từng phòng
 */
export async function getRevenueByRoom(year, month, houseId) {
  const urlParams = new URLSearchParams();
  if (year) urlParams.append("year", year);
  if (month) urlParams.append("month", month);
  if (houseId) urlParams.append("houseId", houseId);

  const res = await fetch(`${API_REVENUE_URL}/by-room?${urlParams.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy doanh thu theo phòng");
}

/**
 * Lấy chi tiết doanh thu phòng
 */
export async function getRoomRevenue(year, month, houseId) {
  const urlParams = new URLSearchParams();
  if (year) urlParams.append("year", year);
  if (month) urlParams.append("month", month);
  if (houseId) urlParams.append("houseId", houseId);

  const res = await fetch(`${API_REVENUE_URL}/rooms?${urlParams.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy chi tiết doanh thu phòng");
}
