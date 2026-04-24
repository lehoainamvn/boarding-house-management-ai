import { useState, useRef, useEffect } from "react";
import { Calendar, Home, CreditCard, Search, Moon, ChevronDown } from "lucide-react";

// ==========================================
// COMPONENT: Custom Dropdown xịn xò
// ==========================================
function CustomDropdown({ label, icon: Icon, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Xử lý tự động đóng khi click ra ngoài vùng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy text hiển thị của option đang được chọn
  const selectedLabel = options.find((opt) => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-11 flex items-center justify-between pl-10 pr-3.5 text-sm font-medium text-slate-700 bg-slate-50 border rounded-xl transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
            isOpen ? "border-indigo-500 bg-white" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <Icon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isOpen ? "text-indigo-500" : "text-slate-400"}`} />
          <span className="truncate pr-2">{selectedLabel}</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
        </button>

        {/* Khung chứa danh sách đổ xuống */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* max-h-60 giúp giới hạn chiều cao và hiện thanh cuộn nếu quá dài */}
            <ul className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    value === opt.value
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT CHÍNH: Invoice Filter
// ==========================================
export default function InvoiceFilter({ 
  year, setYear, 
  month, setMonth, 
  houseId, setHouseId, 
  statusFilter, setStatusFilter, 
  houses, 
  onFetch 
}) {
  const currentYear = new Date().getFullYear();

  // Tạo data cho các ô Dropdown
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

  const statusOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "PAID", label: "Đã thanh toán" }
  ];

  return (
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

        {/* TRẠNG THÁI */}
        <CustomDropdown 
          label="Trạng thái" 
          icon={CreditCard} 
          value={statusFilter} 
          onChange={setStatusFilter} 
          options={statusOptions} 
        />

        {/* NÚT LỌC */}
        <button
          onClick={onFetch}
          className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
        >
          <Search size={18} strokeWidth={2.5} />
          Lọc kết quả
        </button>
      </div>
    </div>
  );
}