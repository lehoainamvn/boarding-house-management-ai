import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_USER_URL = `${API_BASE_URL}/users`;

export async function getUsers() {
  const res = await fetch(API_USER_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách người dùng");
}

export async function getUserById(id) {
  const res = await fetch(`${API_USER_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy thông tin người dùng");
}

export async function changePassword(data) {
  const res = await fetch(`${API_USER_URL}/change-password`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi đổi mật khẩu");
}
