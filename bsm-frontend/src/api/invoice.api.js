import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_INVOICE_URL = `${API_BASE_URL}/invoices`;

export async function getInvoicesByMonth(month, houseId) {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (houseId) params.append("houseId", houseId);

  const res = await fetch(`${API_INVOICE_URL}?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy danh sách hóa đơn");
}

export async function getInvoiceByRoomAndMonth(roomId, month) {
  const res = await fetch(`${API_INVOICE_URL}/room/${roomId}?month=${month}`, {
    headers: getAuthHeader()
  });
  // Trả về null nếu 404 (không có hóa đơn) thay vì throw error to đùng
  if (res.status === 404) return null;
  return handleResponse(res, "Lỗi lấy thông tin hóa đơn phòng");
}

export async function getInvoiceById(id) {
  const res = await fetch(`${API_INVOICE_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi lấy chi tiết hóa đơn");
}

export async function createInvoice(data) {
  const res = await fetch(API_INVOICE_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi tạo hóa đơn");
}

export async function updateInvoice(id, data) {
  const res = await fetch(`${API_INVOICE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Lỗi cập nhật hóa đơn");
}

export async function updateInvoiceStatus(id, status) {
  const res = await fetch(`${API_INVOICE_URL}/${id}/status`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ status })
  });
  return handleResponse(res, "Lỗi cập nhật trạng thái");
}

export async function deleteInvoice(id) {
  const res = await fetch(`${API_INVOICE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xóa hóa đơn");
}
