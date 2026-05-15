import axios from "axios";
import { getAuthHeader } from "./apiHelper";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/house-rules`;

export const getHouseRules = async (houseId) => {
  const response = await axios.get(`${API_URL}/house/${houseId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createHouseRule = async (houseId, data) => {
  const response = await axios.post(`${API_URL}/house/${houseId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateHouseRule = async (ruleId, data) => {
  const response = await axios.put(`${API_URL}/${ruleId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteHouseRule = async (ruleId) => {
  const response = await axios.delete(`${API_URL}/${ruleId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getHouseRulesForTenant = async () => {
  const response = await axios.get(`${API_URL}/tenant`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
