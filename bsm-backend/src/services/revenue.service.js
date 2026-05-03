import {
  getRevenueRepo,
  getRevenueSummaryRepo,
  getRoomRevenueByMonth,
  getRevenueByRoomRepo
} from "../repositories/revenueRepository.js";

/* =========================
   DOANH THU THEO THÁNG / NĂM
========================= */
export function getRevenueService(ownerId, year, month, houseId) {
  return getRevenueRepo(ownerId, year, month, houseId);
}

/* =========================
   TỔNG QUAN (KPI)
========================= */
export function getRevenueSummaryService(ownerId, year, houseId) {
  return getRevenueSummaryRepo(ownerId, year, houseId);
}

/* =========================
   DOANH THU PHÒNG THEO THÁNG
========================= */
export function getRoomRevenueService(ownerId, year, month) {
  return getRoomRevenueByMonth(ownerId, year, month);
}

/* =========================
   DOANH THU THEO PHÒNG + NHÀ
========================= */
export function getRevenueByRoomService(ownerId, year, month, houseId) {
  return getRevenueByRoomRepo(ownerId, year, month, houseId);
}
