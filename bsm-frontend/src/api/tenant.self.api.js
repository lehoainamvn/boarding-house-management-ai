const API_URL = "http://localhost:5000/api/tenant";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getTenantDashboard() {
  const res = await fetch(`${API_URL}/dashboard`, {
    headers: getAuthHeader()
  });

  if (!res.ok) {
    throw new Error("Không thể tải dữ liệu");
  }

  return res.json();
}