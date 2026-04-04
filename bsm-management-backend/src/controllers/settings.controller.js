import { getSettingsByOwner, updateSettingsRepo } from "../repositories/settings.repo.js";

export async function getSettings(req, res) {
  try {
    const ownerId = req.user.id;
    const settings = await getSettingsByOwner(ownerId);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const ownerId = req.user.id;
    await updateSettingsRepo(ownerId, req.body);
    res.json({ message: "Cập nhật cài đặt thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}