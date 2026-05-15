import sql, { poolPromise } from "../config/db.js";
import * as houseRuleRepo from "../repositories/houseRuleRepository.js";
import { getHouseById } from "../repositories/houseRepository.js";
import { getTenantsInHouseRepo } from "../repositories/tenantRepository.js";
import { createNotification } from "./notification.service.js";

async function verifyOwnership(ownerId, houseId) {
  const house = await getHouseById(ownerId, houseId);
  if (!house) {
    throw new Error("Bạn không có quyền truy cập nhà này hoặc nhà không tồn tại.");
  }
  return house;
}

export async function getHouseRulesService(ownerId, houseId) {
  await verifyOwnership(ownerId, houseId);
  return await houseRuleRepo.getHouseRulesRepo(houseId);
}

export async function createHouseRuleService(ownerId, houseId, data) {
  await verifyOwnership(ownerId, houseId);
  if (!data.title || !data.content) {
    throw new Error("Tiêu đề và nội dung không được để trống.");
  }
  const ruleId = await houseRuleRepo.createHouseRuleRepo(houseId, data);
  
  // Notify tenants
  const tenants = await getTenantsInHouseRepo(houseId);
  const house = await getHouseById(ownerId, houseId);
  for (const t of tenants) {
    await createNotification({
      user_id: t.id,
      title: "Nội quy mới",
      content: `Nhà ${house.name} vừa cập nhật nội quy mới: ${data.title}`
    });
  }
  
  return ruleId;
}

export async function updateHouseRuleService(ownerId, ruleId, data) {
  const rule = await houseRuleRepo.getRuleByIdRepo(ruleId);
  if (!rule) {
    throw new Error("Nội quy không tồn tại.");
  }
  
  await verifyOwnership(ownerId, rule.house_id);
  
  if (!data.title || !data.content) {
    throw new Error("Tiêu đề và nội dung không được để trống.");
  }
  
  const result = await houseRuleRepo.updateHouseRuleRepo(ruleId, data);

  // Notify tenants
  const tenants = await getTenantsInHouseRepo(rule.house_id);
  const house = await getHouseById(ownerId, rule.house_id);
  for (const t of tenants) {
    await createNotification({
      user_id: t.id,
      title: "Cập nhật nội quy",
      content: `Nội quy "${data.title}" tại nhà ${house.name} đã được thay đổi.`
    });
  }

  return result;
}

export async function deleteHouseRuleService(ownerId, ruleId) {
  const rule = await houseRuleRepo.getRuleByIdRepo(ruleId);
  if (!rule) {
    throw new Error("Nội quy không tồn tại.");
  }
  
  await verifyOwnership(ownerId, rule.house_id);
  
  return await houseRuleRepo.deleteHouseRuleRepo(ruleId);
}

export async function getHouseRulesForTenantService(tenantId) {
  // Get tenant's current house
  const pool = await poolPromise;
  const result = await pool.request()
    .input("tenant_id", sql.Int, tenantId)
    .query(`
      SELECT TOP 1 r.house_id
      FROM tenant_rooms tr
      JOIN rooms r ON tr.room_id = r.id
      WHERE tr.tenant_id = @tenant_id AND tr.end_date IS NULL
    `);
    
  if (result.recordset.length === 0) {
    return [];
  }
  
  const houseId = result.recordset[0].house_id;
  return await houseRuleRepo.getHouseRulesRepo(houseId);
}
