
import {
  getMyHousesService,
  createHouseService,
  updateHouseService,
  deleteHouseService,
} from "../services/house.service.js";

export async function getMyHouses(req, res) {
  try {
    const ownerId = req.user.id;
    const houses = await getMyHousesService(ownerId);
    res.json(houses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createHouse(req, res) {
  try {
    const ownerId = req.user.id; // từ JWT middleware
    const { name, address, totalRooms } = req.body;

    if (!name || !address || !totalRooms) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const houseId = await createHouseService(ownerId, {
      name,
      address,
      totalRooms
    });

    res.json({
      message: "Tạo nhà trọ thành công",
      houseId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
/* ================= UPDATE ================= */
export async function updateHouse(req, res) {
  try {
    const ownerId = req.user.id;
    const houseId = req.params.id;
    const { name, address, totalRooms } = req.body;

    await updateHouseService(ownerId, houseId, {
      name,
      address,
      totalRooms,
    });

    res.json({ message: "Cập nhật nhà thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/* ================= DELETE ================= */
export async function deleteHouse(req, res) {
  try {
    const ownerId = req.user.id;
    const houseId = req.params.id;

    await deleteHouseService(ownerId, houseId);

    res.json({ message: "Xóa nhà thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}