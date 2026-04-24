import { API_BASE_URL } from "../config";
import { handleResponse } from "./api.helper";

const API_AUTH_URL = `${API_BASE_URL}/auth`;

export const login = async ({ phone, password }) => {
  const res = await fetch(`${API_AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: phone, password })
  });
  return handleResponse(res, "Đăng nhập thất bại");
};

export const googleLoginApi = async (credential) => {
  const res = await fetch(`${API_AUTH_URL}/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential })
  });
  return handleResponse(res, "Đăng nhập Google thất bại");
};

export async function registerApi(user) {
  const res = await fetch(`${API_AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  return handleResponse(res, "Đăng ký thất bại");
}

export async function forgotPasswordApi(email) {
  const res = await fetch(`${API_AUTH_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return handleResponse(res, "Gửi OTP thất bại");
}

export async function resetPasswordApi({ email, otp, newPassword }) {
  const res = await fetch(`${API_AUTH_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword })
  });
  return handleResponse(res, "Đổi mật khẩu thất bại");
}