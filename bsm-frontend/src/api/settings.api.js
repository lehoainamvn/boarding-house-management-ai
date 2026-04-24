import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_SETTINGS_URL = `${API_BASE_URL}/settings`;

export async function getSettings() {
  const res = await fetch(API_SETTINGS_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy cài đặt");
}

export async function updateSettings(data) {
  const res = await fetch(API_SETTINGS_URL, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật cài đặt");
}
