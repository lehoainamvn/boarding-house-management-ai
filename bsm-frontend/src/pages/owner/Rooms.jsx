import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  BedDouble,
  Trash2,
  Wallet,
  Eye,
  Zap,
  Droplet,
  Home,
  ChevronDown,
  Calculator
} from "lucide-react";
import { useHouses } from "../../hooks/useHouses";
import { useSettings } from "../../hooks/useSettings";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

import { getRoomsByHouse, createRoom, deleteRoom } from "../../api/room.api";
import AddButton from "../../components/common/AddButton";

const API_HOUSES = "http://localhost:5000/api/houses";
const PAGE_SIZE = 8;

export default function Rooms() {
  const { houses, selectedHouseId, changeHouse } = useHouses();
  const { settings } = useSettings();

  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { visibleItems: visibleRooms, loaderRef, hasMore, resetPagination, page } = useInfiniteScroll(allRooms, PAGE_SIZE);

  useEffect(() => {
    if (!selectedHouseId) return;

    async function fetchRooms() {
      setLoading(true);
      const data = await getRoomsByHouse(selectedHouseId);
      setAllRooms(data);
      resetPagination();
      setLoading(false);
    }
    fetchRooms();
  }, [selectedHouseId, resetPagination]);

  function handleChangeHouse(e) {
    changeHouse(e.target.value);
  }

  async function handleAddRoom() {
    if (!selectedHouseId) return toast.error("Vui lòng chọn nhà trọ trước");

    const houseId = Number(selectedHouseId);

    try {
      await createRoom({
        house_id: houseId,
        room_name: `Phòng ${allRooms.length + 1}`,
        room_price: settings.default_room_price,
        electric_price: settings.default_electric_price,
        water_price: settings.default_water_price,
      });

      const data = await getRoomsByHouse(houseId);
      setAllRooms(data);
      toast.success("Đã tạo phòng thành công");
    } catch (err) {
      toast.error(err.message || "Tạo phòng thất bại");
    }
  }

  async function handleDeleteRoom(id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn phòng này?")) return;

    try {
      await deleteRoom(id);
      const data = await getRoomsByHouse(selectedHouseId);
      setAllRooms(data);
      toast.success("Đã xóa phòng thành công");
    } catch (err) {
      toast.error(err.message || "Xóa phòng thất bại");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý phòng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem danh sách, đơn giá và tính trạng thái phòng thuê
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* CUSTOM SELECT HOUSE */}
          <div className="relative min-w-[200px]">
            <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedHouseId || ""}
              onChange={handleChangeHouse}
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white appearance-none font-medium text-slate-700 shadow-sm"
            >
              <option value="" disabled>Chọn nhà trọ</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* SỬ DỤNG ADD BUTTON TẠI ĐÂY */}
          <AddButton onClick={handleAddRoom} label="Thêm phòng" />
        </div>
      </div>

      {/* HIỆU ỨNG LOADING TRONG KHI TẢI PHÒNG */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* KHÔNG CÓ PHÒNG */}
      {!loading && visibleRooms.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
          <BedDouble size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm font-medium mb-4">Chưa có phòng nào trong nhà này.</p>
          
          {/* SỬ DỤNG ADD BUTTON Ở ĐÂY CHO TRẠNG THÁI RỖNG */}
          <div className="inline-flex justify-center">
            <AddButton onClick={handleAddRoom} label="Tạo nhanh phòng mới" />
          </div>
        </div>
      )}

      {/* ROOM LIST */}
      {!loading && visibleRooms.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleRooms.map((room) => {
            const isOccupied = room.status === "OCCUPIED";
            
            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* CARD HEADER */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
                      <div className={`p-1.5 rounded-lg ${isOccupied ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"}`}>
                        <BedDouble size={18} />
                      </div>
                      {room.room_name}
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                      ${
                        isOccupied
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOccupied ? "bg-rose-500" : "bg-emerald-500"}`} />
                      {isOccupied ? "Đã thuê" : "Còn trống"}
                    </span>
                  </div>

                  {/* CHỈ SỐ GIÁ KHÔNG GIAN SẮC MÀU */}
                  <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
                    <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-50">
                      <Wallet className="mx-auto mb-1 text-indigo-600" size={16} />
                      <p className="text-[11px] text-slate-500 font-medium mb-0.5">Giá phòng</p>
                      <p className="font-bold text-indigo-700 text-xs">
                        {(room.room_price || 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl p-3 text-center border border-amber-50">
                      <Zap className="mx-auto mb-1 text-amber-500" size={16} />
                      <p className="text-[11px] text-slate-500 font-medium mb-0.5">Giá điện</p>
                      <p className="font-bold text-amber-700 text-xs">
                        {(room.electric_price || 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>

                    <div className="bg-sky-50/50 rounded-xl p-3 text-center border border-sky-50">
                      <Droplet className="mx-auto mb-1 text-sky-500" size={16} />
                      <p className="text-[11px] text-slate-500 font-medium mb-0.5">Giá nước</p>
                      <p className="font-bold text-sky-700 text-xs">
                        {(room.water_price || 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>
                </div>

                {/* THAO TÁC NẰM GỌN GÀNG DƯỚI CÙNG */}
                <div className="flex gap-2.5 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Eye size={14} />
                    Chi tiết
                  </button>

                  <button
                    onClick={() => navigate("/room-bill", { state: { room } })}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Calculator size={14} />
                    Tính tiền
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="w-10 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                    title="Xóa phòng"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INFINITE SCROLL LOADER */}
      {hasMore && (
        <div ref={loaderRef} className="h-20 flex justify-center items-center">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-500" />
            <span className="text-xs font-medium">Đang tải thêm phòng...</span>
          </div>
        </div>
      )}
    </div>
  );
}