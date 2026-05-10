import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { getSettings, updateSettings } from "../../api/settingsApi";
import { getHouses } from "../../api/houseApi";
import { 
  Save, 
  Zap, 
  Droplet, 
  Calendar, 
  Settings as SettingsIcon, 
  Home, 
  CircleDollarSign,
  AlertCircle,
  RefreshCw,
  Building2
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    billing_day: 5,
    default_electric_price: 0,
    default_water_price: 0,
    default_room_price: 0,
    apply_to_all: false,
    selected_house_id: null
  });

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    async function fetchData() {
      try {
        const [settingsData, housesData] = await Promise.all([
          getSettings(),
          getHouses()
        ]);
        setSettings(prev => ({ ...prev, ...settingsData, apply_to_all: false, selected_house_id: null }));
        setHouses(housesData);
      } catch (error) {
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Close day picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDayPicker && !e.target.closest('.day-picker-container')) {
        setShowDayPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDayPicker]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "selected_house_id" ? (value === "" ? null : Number(value)) : Number(value))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await toast.promise(
        updateSettings(settings),
        {
          loading: "Đang lưu cấu hình...",
          success: "Đã cập nhật cài đặt hệ thống",
          error: "Không thể lưu cài đặt"
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Đang đồng bộ dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
      
      {/* KHỐI CSS ĐỂ ẨN MŨI TÊN TĂNG GIẢM CỦA INPUT NUMBER */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                <SettingsIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cấu hình hệ thống</h1>
                <p className="text-slate-500 text-sm">Tùy chỉnh các thông số mặc định và lịch trình tự động</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100/80 px-4 py-2.5 rounded-2xl">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-[12px] font-bold text-amber-700">Các thay đổi sẽ ảnh hưởng đến việc tạo phòng mới</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD 1: LỊCH TRÌNH */}
            <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Calendar size={80} />
              </div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" /> Thời gian
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Ngày chốt hóa đơn</label>
                <div className="relative day-picker-container">
                  <input
                    type="text"
                    name="billing_day"
                    value={settings.billing_day}
                    readOnly
                    onClick={() => setShowDayPicker(!showDayPicker)}
                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800 cursor-pointer"
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  
                  {/* Day Picker Dropdown */}
                  {showDayPicker && (
                    <div className="absolute z-[100] mt-2 w-full bg-white border-2 border-indigo-200 rounded-2xl shadow-2xl p-4">
                      <div className="text-xs font-bold text-slate-500 mb-2 text-center">Chọn ngày trong tháng</div>
                      <div className="grid grid-cols-7 gap-1.5 max-h-[280px] overflow-y-auto">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setSettings(prev => ({ ...prev, billing_day: day }));
                              setShowDayPicker(false);
                            }}
                            className={`
                              p-2.5 rounded-xl text-sm font-bold transition-all
                              ${settings.billing_day === day 
                                ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                                : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105'}
                            `}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  Hệ thống sẽ gửi thông báo nhắc nhở ghi điện nước vào ngày này mỗi tháng.
                </p>
              </div>
            </div>

            {/* CARD 2: CHI PHÍ MẶC ĐỊNH */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <CircleDollarSign size={16} className="text-emerald-500" /> Định mức chi phí mặc định
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* GIÁ PHÒNG */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Home size={14} className="text-purple-500" /> Giá thuê phòng
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="default_room_price"
                      value={settings.default_room_price}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      onInput={(e) => {
                        if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                          e.target.value = e.target.value.replace(/^0+/, '');
                        }
                      }}
                      placeholder="0"
                      className="w-full pl-4 pr-14 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                  </div>
                </div>

                {/* GIÁ ĐIỆN */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> Chỉ số điện (kWh)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="default_electric_price"
                      value={settings.default_electric_price}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      onInput={(e) => {
                        if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                          e.target.value = e.target.value.replace(/^0+/, '');
                        }
                      }}
                      placeholder="0"
                      className="w-full pl-4 pr-14 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                  </div>
                </div>

                {/* GIÁ NƯỚC */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Droplet size={14} className="text-sky-500" /> Chỉ số nước (Khối)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="default_water_price"
                      value={settings.default_water_price}
                      onChange={handleChange}
                      onFocus={(e) => e.target.select()}
                      onInput={(e) => {
                        if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                          e.target.value = e.target.value.replace(/^0+/, '');
                        }
                      }}
                      placeholder="0"
                      className="w-full pl-4 pr-14 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="bg-slate-50/70 rounded-2xl p-4 flex items-center border border-dashed border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">
                    ✨ Các giá trị này sẽ tự động điền khi bạn thêm phòng mới, giúp thao tác nhanh hơn và đồng bộ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BULK UPDATE SECTION */}
          <div className={`
            p-5 rounded-[2rem] transition-all duration-300 border-2
            ${settings.apply_to_all 
              ? 'bg-indigo-50 border-indigo-200 shadow-md shadow-indigo-100' 
              : 'bg-white border-transparent shadow-sm border-slate-200/60 hover:shadow-md'}
          `}>
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="mt-1">
                <input
                  type="checkbox"
                  name="apply_to_all"
                  checked={settings.apply_to_all}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Cập nhật hàng loạt cho phòng hiện có <RefreshCw size={14} className={settings.apply_to_all ? 'animate-spin' : ''} />
                </span>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Kích hoạt tùy chọn này để áp dụng ngay lập tức các mức giá trên cho các phòng đang hoạt động.
                </p>
                
                {settings.apply_to_all && (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Building2 size={14} className="text-indigo-500" /> Chọn nhà trọ cần cập nhật
                    </label>
                    <select
                      name="selected_house_id"
                      value={settings.selected_house_id || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    >
                      <option value="">Tất cả nhà trọ</option>
                      {houses.map(house => (
                        <option key={house.id} value={house.id}>
                          {house.name} ({house.address})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-indigo-600 font-medium">
                      {settings.selected_house_id 
                        ? `✓ Chỉ cập nhật giá cho phòng trong nhà trọ đã chọn` 
                        : `⚠️ Sẽ cập nhật giá cho TẤT CẢ phòng trong tất cả nhà trọ`}
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="group relative px-10 py-4 bg-slate-900 overflow-hidden rounded-2xl font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center gap-2">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                <span>{saving ? "Đang xử lý..." : "Lưu thay đổi"}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}