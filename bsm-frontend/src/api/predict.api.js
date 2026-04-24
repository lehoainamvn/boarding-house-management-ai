import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

export async function predictRevenue(houseId, months, simOccupancy) {
  const params = new URLSearchParams();
  if (houseId) params.append("house", houseId);
  if (months) params.append("months", months);
  if (simOccupancy) params.append("simOccupancy", simOccupancy);

  const res = await fetch(`${API_BASE_URL}/predict-revenue?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi phân tích dự báo");
}
