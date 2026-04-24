import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_MESSAGE_URL = `${API_BASE_URL}/messages`;

export async function getMessageRooms() {
  const res = await fetch(`${API_MESSAGE_URL}/rooms`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách phòng chat");
}

export async function getMessagesByRoom(roomId) {
  const res = await fetch(`${API_MESSAGE_URL}/${roomId}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy tin nhắn");
}

export async function sendMessageApi(data) {
  const res = await fetch(API_MESSAGE_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi gửi tin nhắn");
}
