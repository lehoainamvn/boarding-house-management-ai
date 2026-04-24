import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_HOUSE_URL = `${API_BASE_URL}/houses`;

export async function getHouses() {
  const res = await fetch(API_HOUSE_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách nhà trọ");
}

export async function createHouse(data) {
  const res = await fetch(API_HOUSE_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi tạo nhà trọ");
}

export async function updateHouse(id, data) {
  const res = await fetch(`${API_HOUSE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật nhà trọ");
}

export async function deleteHouse(id) {
  const res = await fetch(`${API_HOUSE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa nhà trọ");
}
