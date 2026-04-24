import { useState, useEffect, useCallback } from "react";
import { getSettings } from "../api/settings.api";

export function useSettings() {
  const [settings, setSettings] = useState({
    default_room_price: 0,
    default_electric_price: 0,
    default_water_price: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      if (!data) return;

      setSettings((prev) => ({
        ...prev,
        default_room_price: data.default_room_price ?? prev.default_room_price,
        default_electric_price: data.default_electric_price ?? prev.default_electric_price,
        default_water_price: data.default_water_price ?? prev.default_water_price,
      }));
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, refreshSettings: fetchSettings };
}
