import {
  getProfileService,
  updateProfileService
} from "../services/profile.service.js";

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getProfileService(userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    await updateProfileService(userId, { name, phone });
    res.json({ message: "Cập nhật thông tin thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
