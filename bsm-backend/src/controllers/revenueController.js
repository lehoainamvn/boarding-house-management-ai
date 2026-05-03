import { getRevenueService,
    getRevenueSummaryService,
    getRoomRevenueService,
    getRevenueByRoomService
 } from "../services/revenue.service.js";

export async function getRevenue(req, res) {
  const { year, month, houseId } = req.query;
  const ownerId = req.user.id;

  const data = await getRevenueService(
    ownerId,
    Number(year),
    month ? Number(month) : null,
    houseId ? Number(houseId) : null
  );

  res.json(data);
}

export async function getRevenueSummary(req, res) {
  const { year, houseId } = req.query;
  const ownerId = req.user.id;

  const data = await getRevenueSummaryService(
    ownerId,
    Number(year),
    houseId ? Number(houseId) : null
  );

  res.json(data);
}

export async function getRoomRevenue(req, res) {
  try {
    const ownerId = req.user.id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Thiếu year hoặc month" });
    }

    const data = await getRoomRevenueService(
      ownerId,
      Number(year),
      Number(month)
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export async function getRevenueByRoom(req, res) {
  try {
    const ownerId = req.user.id;
    const { year, month, houseId } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Thiếu year hoặc month" });
    }

    const data = await getRevenueByRoomService(
      ownerId,
      Number(year),
      Number(month),
      houseId ? Number(houseId) : null
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
