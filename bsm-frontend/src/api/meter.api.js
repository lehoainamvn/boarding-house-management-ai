import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_METER_URL = `${API_BASE_URL}/meters`;
const API_ROOM_URL = `${API_BASE_URL}/rooms`;

export async function getMeterReadingByRoomAndMonth(roomId, month) {
  const res = await fetch(`${API_ROOM_URL}/${roomId}/meter-readings?month=${month}`, {
    headers: getAuthHeader()
  });
  if (res.status === 404) return null;
  return handleResponse(res, "Lỗi lấy chỉ số điện nước");
}

export async function getMeterHistory(params) {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const query = new URLSearchParams(cleanParams).toString();
  // Đúng: /api/meters?...
  const res = await fetch(`${API_METER_URL}?${query}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy lịch sử điện nước");
}

export async function updateMeter(data) {
  // data thường chứa room_id, nên endpoint đúng là:
  const res = await fetch(`${API_ROOM_URL}/${data.room_id}/meter-readings`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật chỉ số");
}
