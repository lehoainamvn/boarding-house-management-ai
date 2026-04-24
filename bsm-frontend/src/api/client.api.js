import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_CLIENT_URL = `${API_BASE_URL}/clients`;

export async function getTenants() {
  const res = await fetch(API_CLIENT_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách khách thuê");
}

export async function getTenantById(id) {
  const res = await fetch(`${API_CLIENT_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy thông tin khách thuê");
}

export async function createTenant(data) {
  const res = await fetch(API_CLIENT_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi tạo khách thuê");
}

export async function updateTenant(id, data) {
  const res = await fetch(`${API_CLIENT_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật khách thuê");
}

export async function deleteTenant(id) {
  const res = await fetch(`${API_CLIENT_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa khách thuê");
}
