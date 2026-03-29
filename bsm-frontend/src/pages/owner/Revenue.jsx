import { useEffect, useState } from "react";
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

import { Download, TrendingUp, Home, Calendar, Filter, FileText, Users, DoorOpen } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ================= MINI DONUT (ĐO LƯỜNG TỶ LỆ) ================= */
function MiniDonut({ value, total, color }) {
  return (
    <div className="h-20 w-20 mx-auto relative flex items-center justify-center">
      <Doughnut
        data={{
          datasets: [
            {
              data: [value, Math.max(total - value, 0)],
              backgroundColor: [color, "#f1f5f9"],
              borderWidth: 0,
              borderRadius: 4,
            }
          ]
        }}
        options={{
          cutout: "75%",
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          maintainAspectRatio: false
        }}
      />
      <span className="absolute text-xs font-bold" style={{ color }}>
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </span>
    </div>
  );
}

/* ================= THẺ KPI NÂNG CẤP ================= */
function StatCard({ title, value, total, color, icon: Icon, suffix = "" }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {value.toLocaleString("vi-VN")}{suffix}
          </p>
        </div>
        {Icon && (
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      
      <div className="pt-3 border-t border-slate-50 mt-auto">
        <MiniDonut value={value} total={total} color={color} />
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
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

  /* ===== LOAD HOUSES ===== */
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

  /* ===== CHART ===== */
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const chartValues = months.map((m) => {
    const found = rawData.find((i) => i.period === m);
    return found ? Number(found.total_revenue) : 0;
  });

  const totalYearRevenue = chartValues.reduce((s, v) => s + v, 0);

  const chartData = {
    labels: months.map((m) => `Tháng ${m}`),
    datasets: [
      {
        label: "Doanh thu (đ)",
        data: chartValues,
        backgroundColor: "rgba(99, 102, 241, 0.85)",
        hoverBackgroundColor: "rgba(99, 102, 241, 1)",
        borderRadius: 6,
        barThickness: 28,
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
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "#f1f5f9" }
      },
      x: {
        ticks: { color: "#64748b", font: { size: 11, weight: "500" } },
        grid: { display: false }
      }
    }
  };

  /* ===== EXPORT EXCEL ===== */
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Thống kê doanh thu
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo tổng quan hoạt động kinh doanh và dòng tiền
          </p>
        </div>

        {/* FILTER + OPTIONS */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-wrap gap-4 items-center">
            {/* NĂM */}
            <div className="relative min-w-[120px]">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={year} 
                onChange={(e) => setYear(+e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all"
              >
                {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
                  .map(y => <option key={y} value={y}>{y}</option>)}
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
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* THÁNG */}
            <div className="relative min-w-[140px]">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-700 shadow-sm transition-all"
              >
                <option value="">Tất cả tháng</option>
                {months.map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportExcel}
              disabled={!month}
              className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                !month 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Download size={16} />
              Xuất Excel
            </button>
          </div>

          {/* CHECKBOX OPTIONS */}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${showEmptyRooms ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" : "bg-white border-slate-200 text-slate-600"}`}>
              <input
                type="checkbox"
                className="accent-indigo-600 h-4 w-4"
                checked={showEmptyRooms}
                onChange={() => setShowEmptyRooms(!showEmptyRooms)}
              />
              Bật xem phòng trống
            </label>

            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${showUnpaidInvoices ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" : "bg-white border-slate-200 text-slate-600"}`}>
              <input
                type="checkbox"
                className="accent-indigo-600 h-4 w-4"
                checked={showUnpaidInvoices}
                onChange={() => setShowUnpaidInvoices(!showUnpaidInvoices)}
              />
              Hóa đơn chưa thanh toán
            </label>
          </div>
        </div>

        {/* KPI GRID AUTO-RESPONSIVE */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

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

            {/* THẺ TỔNG DOANH THU TO NHẤT */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-600 rounded-2xl shadow-sm p-6 flex flex-col justify-between text-white lg:col-span-2 xl:col-span-1 h-full min-h-[160px]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-indigo-100" />
                  <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Doanh thu năm {year}</p>
                </div>
                <p className="text-3xl font-extrabold mt-2">
                  {totalYearRevenue.toLocaleString("vi-VN")} đ
                </p>
              </div>
              <p className="text-xs text-indigo-100/80 mt-auto">
                Dữ liệu được cập nhật theo thời gian thực
              </p>
            </div>
          </div>
        )}

        {/* CHART & TABLE GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* ĐỒ THỊ DOANH THU (CHIẾM 2 PHẦN) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-800">Biểu đồ doanh thu</h3>
              <p className="text-xs text-slate-500">Phân bổ dòng tiền theo từng tháng</p>
            </div>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* BẢNG DỮ LIỆU (CHIẾM 1 PHẦN) */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Chi tiết định kỳ</h3>
              <p className="text-xs text-slate-500">Bảng kê khai số lượng và số tiền</p>
            </div>

            <div className="overflow-auto max-h-80 flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Số HĐ</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableData.map((i) => (
                    <tr key={i.period} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-700">Tháng {i.period}</td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">{i.total_invoices}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600">
                        {Number(i.total_revenue).toLocaleString("vi-VN")} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {!loading && tableData.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  <TrendingUp size={36} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">Không có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}