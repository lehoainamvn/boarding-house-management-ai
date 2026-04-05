// src/api/meter.api.js
const API_URL = "http://localhost:5000/api/meters";

function getAuthHeader() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  };
}

export async function getMeterHistory(params) {
  // Chỉ gửi những field có giá trị (không gửi rỗng)
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const query = new URLSearchParams(cleanParams).toString();

  const res = await fetch(`${API_URL}?${query}`, {
    headers: getAuthHeader()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function getMeterReadingByRoomAndMonth(roomId, month) {
  const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/meter-readings?month=${encodeURIComponent(month)}`, {
    headers: getAuthHeader()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi lấy chỉ số điện nước");
  return data;
}
