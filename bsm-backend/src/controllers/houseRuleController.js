import * as houseRuleService from "../services/houseRule.service.js";

export async function getHouseRules(req, res) {
  try {
    const ownerId = req.user.id;
    const { houseId } = req.params;
    const rules = await houseRuleService.getHouseRulesService(ownerId, houseId);
    res.json(rules);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

export async function createHouseRule(req, res) {
  try {
    const ownerId = req.user.id;
    const { houseId } = req.params;
    const { title, content } = req.body;
    
    const ruleId = await houseRuleService.createHouseRuleService(ownerId, houseId, { title, content });
    res.status(201).json({ message: "Thêm nội quy thành công", id: ruleId });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

export async function updateHouseRule(req, res) {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { title, content } = req.body;
    
    await houseRuleService.updateHouseRuleService(ownerId, id, { title, content });
    res.json({ message: "Cập nhật nội quy thành công" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

export async function deleteHouseRule(req, res) {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    
    await houseRuleService.deleteHouseRuleService(ownerId, id);
    res.json({ message: "Xóa nội quy thành công" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

export async function getHouseRulesForTenant(req, res) {
  try {
    const tenantId = req.user.id;
    const rules = await houseRuleService.getHouseRulesForTenantService(tenantId);
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
