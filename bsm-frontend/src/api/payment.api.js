import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_PAYMENT_URL = `${API_BASE_URL}/payment`;

export async function createPaymentUrl(amount, invoiceId) {
  const res = await fetch(`${API_PAYMENT_URL}/create-url`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ amount, invoiceId })
  });
  return handleResponse(res, "Không thể tạo liên kết thanh toán");
}

export async function verifyVnpayReturn(searchParams) {
  const res = await fetch(`${API_PAYMENT_URL}/vnpay-return?${searchParams.toString()}`, {
    headers: getAuthHeader()
  });
  return handleResponse(res, "Lỗi xác thực thanh toán");
}
