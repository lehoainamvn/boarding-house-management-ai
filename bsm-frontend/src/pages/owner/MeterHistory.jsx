import { useEffect, useState, useRef } from "react";
import { getMeterHistory } from "../../api/meter.api";
import { getRoomsByHouse } from "../../api/room.api";
import { Activity, Calendar, Home, BedDouble, Zap, Droplet, Search, Moon, ChevronDown } from "lucide-react";

import CustomDropdown from "../../components/common/CustomDropdown";
import { useHouses } from "../../hooks/useHouses";

// ==========================================
// COMPONENT CHÍNH: MeterHistory
// ==========================================
export default function MeterHistory() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(Number(localStorage.getItem("meter_year")) || currentYear);
  const [month, setMonth] = useState(localStorage.getItem("meter_month") || "");
  const [houseId, setHouseId] = useState(localStorage.getItem("meter_house") || "");
  const [roomId, setRoomId] = useState(localStorage.getItem("meter_room") || "");

  const { houses } = useHouses();
  const [rooms, setRooms] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    localStorage.setItem("meter_year", year);
    localStorage.setItem("meter_month", month);
    localStorage.setItem("meter_house", houseId);
    localStorage.setItem("meter_room", roomId);
  }, [year, month, houseId, roomId]);

  useEffect(() => {
    if (!houseId) {
      setRooms([]);
      setRoomId("");
      return;
    }
    getRoomsByHouse(houseId).then(setRooms);
  }, [houseId]);

  async function fetchData() {
    setLoading(true);
    const res = await getMeterHistory({ year, month, houseId });
    setData(res);
    setSearched(true);
    setLoading(false);
  }

  const filteredData = roomId ? data.filter((i) => i.room_id === Number(roomId)) : data;

  // Options cho Dropdowns
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 3 + i;
    return { value: y, label: String(y) };
  });

  const monthOptions = [
    { value: "", label: "Tất cả tháng" },
    ...Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0");
      return { value: m, label: `Tháng ${m}` };
    })
  ];

  const houseOptions = [
    { value: "", label: "Tất cả nhà" },
    ...houses.map((h) => ({ value: h.id, label: h.name }))
  ];

  const roomOptions = [
    { value: "", label: "Tất cả phòng" },
    ...rooms.map((r) => ({ value: r.id, label: r.room_name }))
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch sử điện nước</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi và tra cứu chỉ số sử dụng điện, nước định kỳ của các phòng
          </p>
        </div>

        {/* BỘ LỌC ĐÃ LÀM MỚI (FILTER) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            
            {/* NĂM */}
            <CustomDropdown 
              label="Năm" 
              icon={Calendar} 
              value={year} 
              onChange={(val) => setYear(+val)} 
              options={yearOptions} 
            />

            {/* THÁNG */}
            <CustomDropdown 
              label="Tháng" 
              icon={Moon} 
              value={month} 
              onChange={setMonth} 
              options={monthOptions} 
            />

            {/* NHÀ */}
            <CustomDropdown 
              label="Khu vực / Nhà" 
              icon={Home} 
              value={houseId} 
              onChange={setHouseId} 
              options={houseOptions} 
            />

            {/* PHÒNG (Sẽ bị khóa nếu chưa chọn nhà) */}
            <CustomDropdown 
              label="Phòng" 
              icon={BedDouble} 
              value={roomId} 
              onChange={setRoomId} 
              options={roomOptions} 
              disabled={!houseId} 
            />

            {/* NÚT TRA CỨU */}
            <button
              onClick={fetchData}
              className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <Search size={18} strokeWidth={2.5} />
              Tra cứu
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
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
              
              {!loading && searched && (
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

          {loading && (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mx-auto mb-3"/>
              <p className="text-sm text-slate-500 font-medium">Đang truy xuất lịch sử...</p>
            </div>
          )}

          {!loading && searched && filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Không tìm thấy hóa đơn nào</h3>
              <p className="text-sm text-slate-400">Hãy thử thay đổi điều kiện lọc ở trên</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="py-20 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Chưa có dữ liệu</h3>
              <p className="text-sm text-slate-400">Nhấn nút "Tra cứu" để xem lịch sử hóa đơn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}