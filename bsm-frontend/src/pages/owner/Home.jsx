import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Home as HomeIcon, MapPin, ArrowRight, Plus } from "lucide-react";

import CreateHouseModal from "../../components/modals/CreateHouseModal";

const API_URL = "http://localhost:5000/api/houses";

export default function Home() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyHouses();
  }, []);

  async function fetchMyHouses() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHouses(data);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách nhà trọ");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHouse(houseId) {
    if (!window.confirm("Bạn có chắc muốn xóa nhà trọ này?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/${houseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Xóa nhà trọ thành công");
      fetchMyHouses();
    } catch (err) {
      toast.error(err.message || "Xóa nhà thất bại");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Nhà trọ của bạn
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý danh sách các tòa nhà và theo dõi tỷ lệ lấp đầy phòng
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHouse(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus size={16} />
          Thêm nhà trọ
        </button>
      </div>

      {/* TRẠNG THÁI TRỐNG */}
      {houses.length === 0 && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <HomeIcon size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Chưa có nhà trọ nào
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Tạo nhà trọ đầu tiên của bạn để bắt đầu quản lý các phòng và hóa đơn.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            Tạo nhà trọ mới
          </button>
        </div>
      )}

      {/* DANH SÁCH DẠNG LƯỚI */}
      {houses.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => {
            const percent =
              house.total_rooms > 0
                ? Math.round((house.created_rooms / house.total_rooms) * 100)
                : 0;

            const isFull = percent === 100;

            return (
              <div
                key={house.id}
                className="group relative bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* NÚT HÀNH ĐỘNG ẨN MỜ (Chỉ hiện rõ khi hover vào Card) */}
                  <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingHouse(house);
                        setShowModal(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteHouse(house.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* THÔNG TIN NHÀ */}
                  <h3 className="font-bold text-slate-800 text-lg mb-1 pr-16 truncate">
                    {house.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-slate-500 mb-5">
                    <MapPin size={13} className="flex-shrink-0" />
                    <p className="text-xs truncate">{house.address}</p>
                  </div>

                  {/* THANH TIẾN ĐỘ THIẾT KẾ LẠI */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>Phòng đã tạo</span>
                      <span className="text-slate-500">
                        {house.created_rooms}/{house.total_rooms}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull 
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                            : "bg-gradient-to-r from-indigo-600 to-indigo-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      isFull
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isFull ? "bg-emerald-500" : "bg-indigo-500"}`} />
                    {isFull ? "Đủ phòng" : `Mới tạo ${percent}%`}
                  </span>

                  <button
                    onClick={() => navigate(`/rooms?houseId=${house.id}`)}
                    className="flex items-center gap-1 text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors group/btn"
                  >
                    Vào quản lý
                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL GIỮ NGUYÊN PROPS CỦA BẠN */}
      {showModal && (
        <CreateHouseModal
          house={editingHouse}
          existingHouses={houses}
          excludeId={editingHouse?.id}
          onClose={() => {
            setShowModal(false);
            setEditingHouse(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingHouse(null);
            fetchMyHouses();
            toast.success(
              editingHouse ? "Cập nhật nhà trọ thành công" : "Tạo nhà trọ thành công"
            );
          }}
        />
      )}
    </div>
  );
}