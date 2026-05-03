import {
  getAllClients,
  getAllClientsWithStatus,
  createClient,
  updateClient,
  deleteClient
} from "../repositories/clientRepository.js";
import bcrypt from "bcryptjs";

export async function getAllClientsService() {
  return await getAllClients();
}

export async function getAllClientsWithStatusService(ownerId) {
  return await getAllClientsWithStatus(ownerId);
}

export async function createClientService(data) {
  const { name, email, phone, password } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  await createClient({ name, email, phone, password: hashedPassword });
}

export async function updateClientService(id, data) {
  await updateClient(id, data);
}
export async function deleteClientService(id) {
  // 👈 GỌI ĐÚNG HÀM REPO
  await deleteClient(id);
}