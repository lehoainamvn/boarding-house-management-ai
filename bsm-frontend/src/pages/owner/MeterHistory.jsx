import { useEffect, useState } from "react";
import { getMeterHistory } from "../../api/meter.api";
import { getHouses } from "../../api/house.api";
import { getRoomsByHouse } from "../../api/room.api";
import { Activity, Filter, Calendar, Home, BedDouble, Zap, Droplet, Search } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const res = await getMeterHistory({
      year,
      month,
      houseId
    });

    setData(res);
    setLoading(false);
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
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Lịch sử điện nước
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi và tra cứu chỉ số sử dụng điện, nước định kỳ của các phòng
          </p>
        </div>

        {/* BỘ LỌC THÔNG MINH (FILTER) */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            
            {/* NĂM */}
            <div className="relative min-w-[120px]">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all"
              >
                {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
                  .map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
              </select>
            </div>

            {/* THÁNG */}
            <div className="relative min-w-[140px]">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all"
              >
                <option value="">Tất cả tháng</option>
                {months.map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* NHÀ */}
            <div className="relative min-w-[180px]">
              <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all"
              >
                <option value="">Tất cả nhà</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* PHÒNG */}
            <div className="relative min-w-[160px]">
              <BedDouble size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={!houseId}
                className={`w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all ${!houseId ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
              >
                <option value="">Tất cả phòng</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.room_name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex-shrink-0"
          >
            <Search size={16} />
            Tra cứu
          </button>
        </div>

        {/* BẢNG DỮ LIỆU (SMART TABLE) */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng</th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Kỳ hóa đơn</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Điện tiêu thụ</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Nước tiêu thụ</th>
                </tr>
              </thead>
              
              {!loading && (
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((i, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <BedDouble size={14} className="text-slate-400" />
                          {i.room_name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600 font-medium">
                        Tháng {i.month}
                      </td>
                      
                      {/* Số điện */}
                      <td className="py-4 px-6 text-right">
                        {i.electric_used != null ? (
                          <div className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs">
                            <Zap size={12} className="text-amber-500" />
                            {i.electric_used.toLocaleString("vi-VN")} kWh
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      
                      {/* Số nước */}
                      <td className="py-4 px-6 text-right">
                        {i.water_used != null ? (
                          <div className="inline-flex items-center gap-1 font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg text-xs">
                            <Droplet size={12} className="text-sky-500" />
                            {i.water_used.toLocaleString("vi-VN")} m³
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* HIỆU ỨNG LOADING GIỮA BẢNG */}
          {loading && (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mx-auto mb-3"/>
              <p className="text-sm text-slate-500 font-medium">Đang truy xuất lịch sử...</p>
            </div>
          )}

          {/* TRẠNG THÁI TRỐNG HOÀN TOÀN */}
          {!loading && filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Không tìm thấy dữ liệu</h3>
              <p className="text-sm text-slate-400">Hãy thử thay đổi điều kiện lọc ở trên</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}