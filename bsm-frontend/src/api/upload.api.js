import { API_BASE_URL } from "../config";
import { getAuthHeader, handleResponse } from "./api.helper";

const API_UPLOAD_URL = `${API_BASE_URL}/upload`;

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(API_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader().Authorization
    },
    body: formData
  });
  return handleResponse(res, "Lỗi tải ảnh lên");
}
