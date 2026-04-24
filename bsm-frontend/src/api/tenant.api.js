import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_TENANT_URL = `${API_BASE_URL}/tenants`;

/* ================= PORTAL (TENANT ROLE) ================= */

export async function getTenantDashboard() {
  const res = await fetch(`${API_TENANT_URL}/dashboard`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi tải dashboard");
}

export async function getTenantInvoices() {
  const res = await fetch(`${API_TENANT_URL}/invoices`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi tải hóa đơn");
}

export async function getTenantStatistics() {
  const res = await fetch(`${API_TENANT_URL}/statistics`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi tải thống kê");
}

export async function getTenantInvoiceDetail(id) {
  const res = await fetch(`${API_TENANT_URL}/invoices/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi tải chi tiết hóa đơn");
}

/* ================= MANAGEMENT (OWNER ROLE) ================= */

export async function findTenantByEmail(email) {
  const res = await fetch(`${API_TENANT_URL}/find-by-email?email=${email}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Không tìm thấy người thuê");
}

export async function assignTenantToRoom(roomId, data) {
  const res = await fetch(`${API_TENANT_URL}/rooms/${roomId}/assign-tenant`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  return handleResponse(res, "Gán người thuê thất bại");
}

export async function removeTenantFromRoom(roomId) {
  const res = await fetch(`${API_TENANT_URL}/rooms/${roomId}/remove-tenant`, {
    method: "POST",
    headers: getAuthHeader()
  });
  return handleResponse(res, "Trả phòng thất bại");
}
