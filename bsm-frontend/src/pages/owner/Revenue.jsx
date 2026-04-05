import { useEffect, useState, useRef } from "react";
import {
  getRevenue,
  getRevenueSummary,
  getRevenueByRoom
} from "../../api/revenue.api";
import { getHouses } from "../../api/house.api";

import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import { Download, TrendingUp, Home, Calendar, Users, DoorOpen, ChevronDown, Moon, FileText, ArrowUpRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ==========================================
// COMPONENT: Custom Dropdown đồng bộ
// ==========================================
function CustomDropdown({ label, icon: Icon, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          className={`w-full h-11 flex items-center justify-between pl-10 pr-3.5 text-sm font-semibold text-slate-700 bg-slate-50/70 border rounded-2xl transition-all ${
            isOpen 
              ? "border-indigo-500 bg-white ring-4 ring-indigo-500/5" 
              : "border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 bg-slate-50/70"
          }`}
        >
          <Icon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? "text-indigo-600" : "text-slate-400"}`} />
          <span className="truncate pr-2">{selectedLabel}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-sm rounded-xl cursor-pointer transition-colors mb-0.5 last:mb-0 ${
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
// COMPONENT: Mini Donut
// ==========================================
function MiniDonut({ value, total, color }) {
  return (
    <div className="h-14 w-14 relative flex items-center justify-center">
      <Doughnut
        data={{
          datasets: [
            {
              data: [value, Math.max(total - value, 0)],
              backgroundColor: [color, "#f1f5f9"],
              borderWidth: 0,
              borderRadius: 3,
            }
          ]
        }}
        options={{
          cutout: "75%",
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          maintainAspectRatio: false
        }}
      />
      <span className="absolute text-[11px] font-bold" style={{ color }}>
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </span>
    </div>
  );
}

// ==========================================
// COMPONENT: Thẻ KPI
// ==========================================
function StatCard({ title, value, total, color, icon: Icon, suffix = "" }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl transition-colors" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800">
            {value.toLocaleString("vi-VN")}{suffix}
          </p>
        </div>
      </div>
      
      <div className="transition-transform group-hover:scale-105">
        <MiniDonut value={value} total={total} color={color} />
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT CHÍNH: Revenue
// ==========================================
export default function Revenue() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");
  const [houseId, setHouseId] = useState("");

  const [houses, setHouses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [showEmptyRooms, setShowEmptyRooms] = useState(false);
  const [showUnpaidInvoices, setShowUnpaidInvoices] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getHouses().then(setHouses).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchChartRevenue();
  }, [year, houseId]);

  useEffect(() => {
    fetchTableRevenue();
  }, [year, month, houseId]);

  async function fetchSummary() {
    try {
      const res = await getRevenueSummary(year, houseId);
      setSummary(res);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchChartRevenue() {
    try {
      setLoading(true);
      const res = await getRevenue({ year, houseId });
      setRawData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTableRevenue() {
    try {
      setLoading(true);
      const res = await getRevenue({ year, month, houseId });
      setTableData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const chartValues = months.map((m) => {
    const found = rawData.find((i) => i.period === m);
    return found ? Number(found.total_revenue) : 0;
  });

  const totalYearRevenue = chartValues.reduce((s, v) => s + v, 0);

  const chartData = {
    labels: months.map((m) => `Thg ${m}`),
    datasets: [
      {
        label: "Doanh thu",
        data: chartValues,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(79, 70, 229, 0.9)");
          gradient.addColorStop(1, "rgba(79, 70, 229, 0.1)");
          return gradient;
        },
        hoverBackgroundColor: "rgba(79, 70, 229, 1)",
        borderRadius: 8,
        barThickness: 24,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 12, weight: "bold", family: "sans-serif" },
        bodyFont: { size: 12, family: "sans-serif" },
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Doanh thu: ${context.parsed.y.toLocaleString("vi-VN")} đ`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "#f1f5f9", drawBorder: false }
      },
      x: {
        ticks: { color: "#64748b", font: { size: 11, weight: "600" } },
        grid: { display: false }
      }
    }
  };

  async function exportExcel() {
    if (!month) return alert("Vui lòng chọn tháng để xuất file cụ thể!");

    const roomData = await getRevenueByRoom(year, month, houseId);
    let total = 0;

    const wsData = [
      ["BÁO CÁO DOANH THU PHÒNG"],
      [`Năm ${year} - Tháng ${month}`],
      [],
      ["Phòng", "Doanh thu (đ)"]
    ];

    roomData.forEach((r) => {
      const value = Number(r.total_revenue || 0);
      total += value;
      wsData.push([r.room_name || "Trống", value]);
    });

    wsData.push([], ["TỔNG DOANH THU", total]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doanh thu");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `DoanhThu_${year}_${month}.xlsx`);
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - 3 + i;
    return { value: y, label: `Năm ${y}` };
  });

  const monthOptions = [
    { value: "", label: "Tất cả tháng" },
    ...months.map((m) => ({ value: m, label: `Tháng ${m}` }))
  ];

  const houseOptions = [
    { value: "", label: "Tất cả khu nhà" },
    ...houses.map((h) => ({ value: h.id, label: h.name }))
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Thống kê & Doanh thu</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Báo cáo tổng quan hoạt động kinh doanh và dòng tiền
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportExcel}
              disabled={!month}
              className={`h-11 flex items-center justify-center gap-2 px-5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
                !month 
                  ? "bg-white text-slate-300 cursor-not-allowed border border-slate-100" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 hover:shadow-emerald-500/20"
              }`}
            >
              <Download size={16} strokeWidth={2.5} />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-end">
            
            <CustomDropdown 
              label="Năm phân tích" 
              icon={Calendar} 
              value={year} 
              onChange={(val) => setYear(+val)} 
              options={yearOptions} 
            />

            <CustomDropdown 
              label="Khu vực / Nhà" 
              icon={Home} 
              value={houseId} 
              onChange={setHouseId} 
              options={houseOptions} 
            />

            <CustomDropdown 
              label="Tháng" 
              icon={Moon} 
              value={month} 
              onChange={setMonth} 
              options={monthOptions} 
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm pt-1">
            <label className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${showEmptyRooms ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"}`}>
              <input
                type="checkbox"
                className="accent-indigo-600 h-4 w-4 rounded"
                checked={showEmptyRooms}
                onChange={() => setShowEmptyRooms(!showEmptyRooms)}
              />
              Bật xem phòng trống
            </label>

            <label className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${showUnpaidInvoices ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"}`}>
              <input
                type="checkbox"
                className="accent-indigo-600 h-4 w-4 rounded"
                checked={showUnpaidInvoices}
                onChange={() => setShowUnpaidInvoices(!showUnpaidInvoices)}
              />
              Hóa đơn chưa thanh toán
            </label>
          </div>
        </div>

        {/* KPI GRID */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            <StatCard
              title="Khách thuê"
              value={summary.totalTenants}
              total={summary.totalRooms || 1}
              color="#10b981"
              icon={Users}
            />

            <StatCard
              title="Nhà trọ"
              value={summary.totalHouses}
              total={summary.totalHouses || 1}
              color="#0ea5e9"
              icon={Home}
            />

            <StatCard
              title="Phòng trọ"
              value={summary.totalRooms}
              total={summary.totalRooms || 1}
              color="#f59e0b"
              icon={DoorOpen}
            />

            {showEmptyRooms && (
              <StatCard
                title="Phòng trống"
                value={summary.emptyRooms || 0}
                total={summary.totalRooms || 1}
                color="#ef4444"
                icon={DoorOpen}
              />
            )}

            {showUnpaidInvoices && (
              <StatCard
                title="Hóa đơn nợ"
                value={summary.unpaidInvoices || 0}
                total={summary.totalInvoices || 1}
                color="#8b5cf6"
                icon={FileText}
              />
            )}

            {/* THẺ TỔNG DOANH THU */}
            <div className="bg-slate-900 border border-slate-800 rounded-[1.5rem] shadow-sm p-5 flex flex-col justify-between text-white lg:col-span-2 xl:col-span-1 h-full min-h-[120px] group hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Tổng doanh thu ({year})</p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {totalYearRevenue.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 group-hover:bg-slate-700 transition-colors">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Dòng tiền thực tế phát sinh trong năm
              </p>
            </div>
          </div>
        )}

        {/* CHART & TABLE GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* ĐỒ THỊ DOANH THU */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" /> Xu hướng doanh thu
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Biểu đồ phân bổ dòng tiền theo từng tháng</p>
            </div>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* BẢNG DỮ LIỆU */}
          <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Chi tiết định kỳ</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Bảng kê khai số lượng và số tiền</p>
            </div>

            <div className="overflow-auto max-h-[340px] flex-1 custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="py-3 px-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</th>
                    <th className="py-3 px-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số HĐ</th>
                    <th className="py-3 px-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tableData.map((i) => (
                    <tr key={i.period} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-700">Tháng {i.period}</td>
                      <td className="py-3.5 px-3 text-center text-slate-500 font-medium">{i.total_invoices}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-indigo-600">
                        {Number(i.total_revenue).toLocaleString("vi-VN")} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {!loading && tableData.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <FileText size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium">Không có dữ liệu hiển thị</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}