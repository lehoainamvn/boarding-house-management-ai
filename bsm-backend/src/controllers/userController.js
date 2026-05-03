// src/controllers/user.controller.js
import bcrypt from "bcryptjs";

import {
  getUserPasswordById,
  updateUserPassword
} from "../repositories/userRepository.js";

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const user = await getUserPasswordById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, hashed);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
