import { inputMeterAndCreateInvoice, getMeterHistoryService, getMeterReadingByRoomAndMonthService } from "../services/meter.service.js";

export async function getMeterHistory(req, res) {
  try {
    const ownerId = req.user.id;
    const { year, month, houseId } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Thiếu năm" });
    }

    const data = await getMeterHistoryService(
      ownerId,
      Number(year),
      month ? Number(month) : null,
      houseId ? Number(houseId) : null
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMeterReadingByRoomAndMonth(req, res) {
  try {
    const roomId = Number(req.params.id);
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Thiếu tháng" });
    }

    const data = await getMeterReadingByRoomAndMonthService(roomId, month);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function inputMeter(req, res) {
  try {
    const roomId = req.params.id;
    await inputMeterAndCreateInvoice(roomId, req.body);
    res.json({ message: "Đã nhập điện nước & tạo hóa đơn" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
