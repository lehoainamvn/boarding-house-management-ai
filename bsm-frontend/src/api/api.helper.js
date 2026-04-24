import { API_BASE_URL } from "../config";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const handleResponse = async (res, defaultError = "Lỗi hệ thống") => {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!res.ok) {
    throw new Error(data.message || defaultError);
  }
  
  return data;
};
