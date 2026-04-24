import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_NOTIFICATION_URL = `${API_BASE_URL}/notifications`;

export const getNotifications = async () => {
  const res = await fetch(API_NOTIFICATION_URL, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy thông báo");
};

export const markAsRead = async (id) => {
  const res = await fetch(`${API_NOTIFICATION_URL}/${id}/read`, {
    method: "PUT",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi cập nhật trạng thái đọc");
};

export const markAllAsReadApi = async () => {
  const res = await fetch(`${API_NOTIFICATION_URL}/read-all`, {
    method: "PUT",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi cập nhật trạng thái đọc");
};

export const deleteNotificationApi = async (id) => {
  const res = await fetch(`${API_NOTIFICATION_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa thông báo");
};

export const clearAllNotificationsApi = async () => {
  const res = await fetch(`${API_NOTIFICATION_URL}/clear-all`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa tất cả thông báo");
};
