// src/api/invoice.api.js
const API_URL = "http://localhost:5000/api/invoices";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getInvoicesByMonth(month, houseId) {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (houseId) params.append("houseId", houseId);

  const res = await fetch(
    `${API_URL}?${params.toString()}`,
    { headers: getAuthHeader() }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Lỗi lấy danh sách hóa đơn");
  }

  return data;
}

export async function getInvoiceById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tải hóa đơn");
  return data;
}

export async function getInvoiceByRoomAndMonth(roomId, month) {
  const res = await fetch(`${API_URL}/room/${roomId}?month=${encodeURIComponent(month)}`, {
    headers: getAuthHeader()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tải hóa đơn");
  return data;
}

export async function updateInvoice(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi cập nhật hóa đơn");
  return data;
}

export async function markInvoicePaid(id) {
  const res = await fetch(`${API_URL}/${id}/pay`, {
    method: "PUT",
    headers: getAuthHeader()
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Không thể cập nhật hóa đơn");
  }

  return data;
}
