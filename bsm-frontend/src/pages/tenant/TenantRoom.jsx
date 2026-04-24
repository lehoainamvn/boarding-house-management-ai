import { useEffect, useState } from "react";
import { getTenantDashboard } from "../../api/tenant.api";
import { 
  Building2, 
  DoorClosed, 
  Zap, 
  Droplets, 
  Users, 
  Banknote,
  MapPin,
  Home
} from "lucide-react";

export default function TenantRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await getTenantDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // SKELETON LOADING CAO CẤP
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-slate-100 rounded-2xl border border-slate-100"></div>
          <div className="h-44 bg-slate-100 rounded-2xl border border-slate-100"></div>
        </div>
        <div className="h-44 bg-slate-100 rounded-2xl border border-slate-100"></div>
      </div>
    );
  }

  if (!data || !data.room) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Home size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Chưa được gán phòng</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          Tài khoản của bạn hiện chưa được liên kết với phòng trọ nào. Vui lòng liên hệ với chủ trọ để được cập nhật.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ===== PAGE HEADER ===== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Phòng của tôi
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">
          Thông tin chi tiết nơi ở và biểu phí dịch vụ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ===== HOUSE INFO ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 size={18} />
            </div>
            <h3 className="font-bold text-slate-800">
              Thông tin nhà trọ
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            <Info label="Tên nhà trọ" value={data.house.name} icon={Building2} />
            <div className="border-t border-slate-50 pt-4">
              <Info label="Địa chỉ" value={data.house.address} icon={MapPin} />
            </div>
          </div>
        </div>

        {/* ===== ROOM INFO ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DoorClosed size={18} />
            </div>
            <h3 className="font-bold text-slate-800">
              Thông tin phòng
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <Info label="Tên phòng" value={data.room.name} icon={DoorClosed} />
            
            <Info 
              label="Trạng thái" 
              value={
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
                    data.room.status === "OCCUPIED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    data.room.status === "OCCUPIED" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
                  }`}></span>
                  {data.room.status === "OCCUPIED" ? "Đang ở" : "Trống"}
                </div>
              } 
            />
            
            <div className="col-span-2 border-t border-slate-50 pt-4 grid grid-cols-2 gap-4">
              <Info label="Giá phòng" value={formatMoney(data.room.price)} icon={Banknote} />
              <Info label="Số người đang ở" value={`${data.room.people_count} người`} icon={Users} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== UTILITY CONFIG ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Zap size={18} />
          </div>
          <h3 className="font-bold text-slate-800">
            Cấu hình đơn giá dịch vụ
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-orange-500 rounded-lg shadow-sm border border-slate-100">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Giá điện</p>
                <p className="font-bold text-slate-800 mt-0.5">{formatMoney(data.room.electric_price)} <span className="text-slate-400 font-medium">/ kWh</span></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-blue-500 rounded-lg shadow-sm border border-slate-100">
                <Droplets size={16} />
              </div>
              
              {data.room.water_type === "METER" ? (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Giá nước (Theo khối)</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatMoney(data.room.water_price)} <span className="text-slate-400 font-medium">/ m³</span></p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Giá nước (Cố định)</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatMoney(data.room.water_price_per_person)} <span className="text-slate-400 font-medium">/ người</span></p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

/* ===== COMPONENT INFO CAO CẤP ===== */
function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
        <div className="font-bold text-slate-700 mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ===== FORMAT MONEY ===== */
function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}