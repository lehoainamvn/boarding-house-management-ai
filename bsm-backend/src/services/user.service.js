import bcrypt from "bcryptjs";
import {
  getUserPasswordById,
  updateUserPassword
} from "../repositories/userRepository.js";

export async function changePasswordService(
  userId,
  oldPassword,
  newPassword
) {
  const user = await getUserPasswordById(userId);

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const isMatch = await bcrypt.compare(
    oldPassword,
    user.password
  );

  if (!isMatch) {
    throw new Error("Mật khẩu cũ không đúng");
  }

  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới tối thiểu 6 ký tự");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, hashed);
}
