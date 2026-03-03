import { useEffect, useState } from "react";
import { getMeterHistory } from "../../api/meter.api";
import { getHouses } from "../../api/house.api";
import { getRoomsByHouse } from "../../api/room.api"; // cần có API này

export default function MeterHistory() {
  const currentYear = new Date().getFullYear();

  /* ================= LOAD FILTER ================= */
  const [year, setYear] = useState(
    Number(localStorage.getItem("meter_year")) || currentYear
  );

  const [month, setMonth] = useState(
    localStorage.getItem("meter_month") || ""
  );

  const [houseId, setHouseId] = useState(
    localStorage.getItem("meter_house") || ""
  );

  const [roomId, setRoomId] = useState(
    localStorage.getItem("meter_room") || ""
  );

  const [houses, setHouses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [data, setData] = useState([]);

  /* ================= SAVE FILTER ================= */
  useEffect(() => {
    localStorage.setItem("meter_year", year);
    localStorage.setItem("meter_month", month);
    localStorage.setItem("meter_house", houseId);
    localStorage.setItem("meter_room", roomId);
  }, [year, month, houseId, roomId]);

  /* ================= LOAD HOUSES ================= */
  useEffect(() => {
    getHouses().then(setHouses);
  }, []);

  /* ================= LOAD ROOMS WHEN HOUSE CHANGE ================= */
  useEffect(() => {
    if (!houseId) {
      setRooms([]);
      setRoomId("");
      return;
    }

    getRoomsByHouse(houseId).then(setRooms);
  }, [houseId]);

  /* ================= FETCH ================= */
  async function fetchData() {
    const res = await getMeterHistory({
      year,
      month,
      houseId
    });

    setData(res);
  }

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER ROOM ================= */
  const filteredData = roomId
    ? data.filter((i) => i.room_id === Number(roomId))
    : data;

  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        <h1 className="text-3xl font-extrabold text-slate-800">
          Lịch sử điện nước
        </h1>

        {/* FILTER */}
        <div className="bg-white rounded-3xl shadow-md p-6 flex flex-wrap gap-4 items-end">

          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-4 py-2 rounded-xl"
          >
            {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
              .map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
          </select>

          {/* MONTH */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-4 py-2 rounded-xl"
          >
            <option value="">Tất cả tháng</option>
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          {/* HOUSE */}
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="border px-4 py-2 rounded-xl"
          >
            <option value="">Tất cả nhà</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* ROOM */}
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={!houseId}
            className="border px-4 py-2 rounded-xl"
          >
            <option value="">Tất cả phòng</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="bg-indigo-600 hover:bg-indigo-700
                       text-white px-6 py-2 rounded-xl font-semibold"
          >
            Lọc
          </button>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Nhà</th>
                <th className="p-4 text-left">Phòng</th>
                <th className="p-4 text-center">Tháng</th>
                <th className="p-4 text-right">Điện dùng</th>
                <th className="p-4 text-center">Nước</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((i, idx) => (
                <tr key={idx} className="border-t hover:bg-slate-50">
                  <td className="p-4">{i.house_name}</td>
                  <td className="p-4">{i.room_name}</td>
                  <td className="p-4 text-center">{i.month}</td>
                  <td className="p-4 text-right font-semibold text-indigo-600">
                    {i.electric_used ?? "—"}
                  </td>
                  <td className="p-4 text-center">
                    {i.water_used ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              Không có dữ liệu
            </div>
          )}
        </div>

      </div>
    </div>
  );
}