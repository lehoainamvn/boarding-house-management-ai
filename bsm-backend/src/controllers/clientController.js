import {
  getAllClientsService,
  getAllClientsWithStatusService,
  createClientService,
  updateClientService,
  deleteClientService
} from "../services/client.service.js";

/* ===== GET ===== */
export async function getClients(req, res) {
  try {
    const ownerId = req.user.id;
    const clients = await getAllClientsWithStatusService(ownerId);
    res.json(clients);
  } catch (e) {
    res.status(500).json({ message: "Lỗi server" });
  }
}

/* ===== POST ===== */
export async function createClient(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }
    await createClientService({ name, email, phone, password });
    res.status(201).json({ message: "Đã tạo khách thuê" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
}

/* ===== PUT ===== */
export async function updateClient(req, res) {
  try {
    await updateClientService(req.params.id, req.body);
    res.json({ message: "Đã cập nhật" });
  } catch {
    res.status(500).json({ message: "Lỗi server" });
  }
}

export async function deleteClient(req, res) {
  try {
    await deleteClientService(req.params.id);
    res.json({ message: "Đã xóa khách thuê" });
  } catch (err) {
    if (err.message === "CLIENT_IS_RENTING") {
      return res.status(400).json({
        message: "Không thể xóa khách đang thuê phòng"
      });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
}