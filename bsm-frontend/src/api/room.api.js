import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_ROOM_URL = `${API_BASE_URL}/rooms`;

export async function getRoomsByHouse(houseId) {
  const url = houseId ? `${API_ROOM_URL}?houseId=${houseId}` : API_ROOM_URL;
  const res = await fetch(url, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách phòng");
}

export async function createRoom(data) {
  const res = await fetch(API_ROOM_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi tạo phòng");
}

export async function deleteRoom(id) {
  const res = await fetch(`${API_ROOM_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa phòng");
}

export async function updateRoom(id, data) {
  const res = await fetch(`${API_ROOM_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật phòng");
}

export async function getRoomById(id) {
  const res = await fetch(`${API_ROOM_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy thông tin phòng");
}
