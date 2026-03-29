import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Zap, Droplet, Home, Wrench, Save, ArrowLeft, Calculator } from "lucide-react";
import toast from "react-hot-toast";

export default function RoomBill() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const room = state?.room;

  /* ===== TIME ===== */
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  /* ===== STATE ===== */
  const [oldElectric, setOldElectric] = useState(0);
  const [newElectric, setNewElectric] = useState(0);

  const [oldWater, setOldWater] = useState(0);
  const [newWater, setNewWater] = useState(0);

  const [waterType, setWaterType] = useState(room?.water_type || "METER");
  const [peopleCount, setPeopleCount] = useState(room?.people_count || 1);
  const [serviceFee, setServiceFee] = useState(0);

  const [saving, setSaving] = useState(false);

  if (!room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md shadow-sm">
          <p className="mb-6 text-slate-500 font-medium">Không tìm thấy dữ liệu phòng để tính hóa đơn.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm text-sm"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  /* ===== CALC ===== */
  const electricUsed = Math.max(newElectric - oldElectric, 0);
  const electricCost = electricUsed * room.electric_price;

  const waterUsed =
    waterType === "METER"
      ? Math.max(newWater - oldWater, 0)
      : 0;

  const waterCost =
    waterType === "PERSON"
      ? peopleCount * (room.water_price_per_person || 0)
      : waterUsed * room.water_price;

  const total =
    room.room_price +
    electricCost +
    waterCost +
    Number(serviceFee);

  const money = (n) => n.toLocaleString("vi-VN") + " đ";

  /* ===== SAVE BILL ===== */
  async function handleSaveInvoice() {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.id,
          month: monthStr,

          electric_old: oldElectric,
          electric_new: newElectric,
          water_old: oldWater,
          water_new: newWater,

          room_price: room.room_price,
          electric_used: electricUsed,
          water_used: waterUsed,
          electric_cost: electricCost,
          water_cost: waterCost,
          total_amount: total,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lưu hóa đơn thất bại");
      }

      toast.success("Đã lưu hóa đơn thành công");
      navigate(-1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">
              Tính tiền phòng {room.room_name}
            </h1>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">
              Tháng {month}/{year}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Nhập các chỉ số tiêu thụ để tạo hóa đơn tháng
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      {/* GRID LAYOUT CHUYÊN NGHIỆP */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* CỘT TRÁI: KHU VỰC NHẬP DỮ LIỆU (Chiếm 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KHỐI ĐIỆN */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 flex items-center justify-center rounded-lg">
                  <Zap className="text-amber-500" size={18} />
                </div>
                <h2 className="font-bold text-slate-800">Chỉ số Điện</h2>
              </div>
              <span className="text-sm text-slate-500 font-medium">
                Đơn giá: {money(room.electric_price)}/kWh
              </span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Chỉ số cũ</label>
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) => setOldElectric(+e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Chỉ số mới</label>
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) => setNewElectric(+e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-3 rounded-lg flex justify-between items-center text-sm">
              <span className="text-slate-600">Tiêu thụ: <span className="font-semibold text-slate-800">{electricUsed}</span> kWh</span>
              <span className="font-bold text-amber-600">{money(electricCost)}</span>
            </div>
          </div>

          {/* KHỐI NƯỚC */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded-lg">
                  <Droplet className="text-blue-500" size={18} />
                </div>
                <h2 className="font-bold text-slate-800">Chỉ số Nước</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 font-medium">Cách tính:</span>
                <select
                  value={waterType}
                  onChange={(e) => setWaterType(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="METER">Theo đồng hồ</option>
                  <option value="PERSON">Theo người</option>
                </select>
              </div>
            </div>

            {waterType === "METER" ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Chỉ số cũ</label>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => setOldWater(+e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Chỉ số mới</label>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => setNewWater(+e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-lg flex justify-between items-center text-sm">
                  <span className="text-slate-600">Tiêu thụ: <span className="font-semibold text-slate-800">{waterUsed}</span> m³ (Đơn giá: {money(room.water_price)}/m³)</span>
                  <span className="font-bold text-blue-600">{money(waterCost)}</span>
                </div>
              </>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Số lượng người</label>
                  <input
                    type="number"
                    min={1}
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(+e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-lg flex justify-between items-center text-sm self-end h-[42px]">
                  <span className="text-slate-600">Đơn giá: {money(room.water_price_per_person)}/người</span>
                  <span className="font-bold text-blue-600">{money(waterCost)}</span>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI DỊCH VỤ PHÁT SINH */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center rounded-lg">
                <Wrench className="text-emerald-500" size={18} />
              </div>
              <h2 className="font-bold text-slate-800">Dịch vụ & Chi phí phát sinh</h2>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Tiền dịch vụ cộng thêm (đ)</label>
              <input
                type="number"
                placeholder="Ví dụ: tiền sửa chữa, vệ sinh thêm..."
                onChange={(e) => setServiceFee(+e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG HỢP HÓA ĐƠN (Chiếm 1/3 - Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden sticky top-6">
            
            {/* Header Hóa đơn */}
            <div className="bg-slate-800 text-white p-5">
              <div className="flex items-center gap-2">
                <Home size={18} className="opacity-80" />
                <h3 className="font-bold">Hóa đơn tóm tắt</h3>
              </div>
              <p className="text-xs opacity-60 mt-1">Phòng {room.room_name} • Tháng {month}/{year}</p>
            </div>

            {/* Chi tiết từng mục */}
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tiền phòng cố định</span>
                <span className="font-semibold text-slate-800">{money(room.room_price)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tiền điện ({electricUsed} kWh)</span>
                <span className="font-semibold text-slate-800">{money(electricCost)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Tiền nước {waterType === "METER" ? `(${waterUsed} m³)` : `(${peopleCount} người)`}
                </span>
                <span className="font-semibold text-slate-800">{money(waterCost)}</span>
              </div>

              {Number(serviceFee) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Chi phí phát sinh</span>
                  <span className="font-semibold text-slate-800">{money(Number(serviceFee))}</span>
                </div>
              )}

              {/* Tổng cộng */}
              <div className="border-t border-dashed border-slate-200 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-base">Tổng cộng</span>
                  <span className="text-xl font-black text-indigo-600">{money(total)}</span>
                </div>
              </div>

              {/* Nút thao tác */}
              <button
                onClick={handleSaveInvoice}
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-bold transition shadow-sm text-sm"
              >
                <Save size={16} />
                {saving ? "Đang xử lý..." : "Lưu hóa đơn"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}