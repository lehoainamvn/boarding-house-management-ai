import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getHouses, deleteHouse as deleteHouseApi } from "../api/house.api";


export function useHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouseId, setSelectedHouseId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHouses();
      setHouses(data);
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách nhà trọ");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHouse = async (houseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhà trọ này?")) return false;
    try {
      await deleteHouseApi(houseId);
      toast.success("Xóa nhà trọ thành công");
      await fetchHouses();
      return true;
    } catch (err) {
      toast.error(err.message || "Xóa nhà thất bại");
      return false;
    }
  };

  const changeHouse = (id) => {
    setSelectedHouseId(id);
    localStorage.setItem("selectedHouseId", id);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("houseId", id);
      return next;
    });
  };

  // Sync selectedHouseId with URL and LocalStorage
  useEffect(() => {
    const urlHouseId = searchParams.get("houseId");
    const savedHouseId = localStorage.getItem("selectedHouseId");

    if (urlHouseId && urlHouseId !== selectedHouseId) {
      setSelectedHouseId(urlHouseId);
      localStorage.setItem("selectedHouseId", urlHouseId);
    } else if (!urlHouseId && savedHouseId) {
      setSelectedHouseId(savedHouseId);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("houseId", savedHouseId);
        return next;
      });
    }
  }, [searchParams, setSearchParams, selectedHouseId]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return {
    houses,
    loading,
    selectedHouseId,
    changeHouse,
    deleteHouse,
    refreshHouses: fetchHouses,
  };
}
