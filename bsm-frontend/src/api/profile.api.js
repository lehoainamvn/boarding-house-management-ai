import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_PROFILE_URL = `${API_BASE_URL}/profile`;

export async function getProfile() {
  const res = await fetch(API_PROFILE_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy thông tin cá nhân");
}

export async function updateProfile(data) {
  const res = await fetch(API_PROFILE_URL, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật thông tin");
}

export async function changePassword(data) {
  const res = await fetch(`${API_PROFILE_URL}/change-password`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi đổi mật khẩu");
}
