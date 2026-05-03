import {
  getMyHousesRepo,
  createHouse,
  createRooms,
  updateHouseRepo,
  deleteHouseRepo,
  
} from "../repositories/houseRepository.js";

export async function getMyHousesService(ownerId) {
  return await getMyHousesRepo(ownerId);
}

export async function createHouseService(ownerId, data) {
  const houseId = await createHouse(ownerId, data);
  await createRooms(houseId, ownerId, data.totalRooms);
  return houseId;
}

export async function updateHouseService(ownerId, houseId, data) {
  const houses = await getMyHousesRepo(ownerId);
  const house = houses.find((h) => h.id == houseId);

  if (!house) {
    throw new Error("Nhà không tồn tại");
  }

  if (data.totalRooms < house.created_rooms) {
    throw new Error(
      `Không thể giảm số phòng nhỏ hơn ${house.created_rooms} (đã tạo)`
    );
  }

  return await updateHouseRepo(ownerId, houseId, data);
}
export async function deleteHouseService(ownerId, houseId) {
  return await deleteHouseRepo(ownerId, houseId);
}
