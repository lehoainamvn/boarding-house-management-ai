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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ================= MINI DONUT ================= */
function MiniDonut({ value, total, color }) {
  return (
    <div className="h-24 w-24 mx-auto">
      <Doughnut
        data={{
          datasets: [
            {
              data: [value, Math.max(total - value, 1)],
              backgroundColor: [color, "#e5e7eb"],
              borderWidth: 0
            }
          ]
        }}
        options={{
          cutout: "70%",
          plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }}
      />
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ title, value, total, color, suffix = "" }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl shadow-md p-6 text-center space-y-3">
      <p className="text-sm text-slate-500">{title}</p>
      <MiniDonut value={value} total={total} color={color} />
      <p className="text-2xl font-extrabold text-slate-800">
        {value.toLocaleString("vi-VN")} {suffix}
      </p>
    </div>
  );
}

/* ================= MAIN ================= */
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
        data: chartValues,
        backgroundColor: "#6366f1",
        borderRadius: 10
      }
    ]
  };

  /* ===== EXPORT EXCEL ===== */
  async function exportExcel() {
    if (!month) return alert("Vui lòng chọn tháng");

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        <h1 className="text-3xl font-extrabold text-slate-800">
          Thống kê doanh thu
        </h1>

        {/* FILTER + OPTIONS */}
        <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">

          <div className="flex flex-wrap gap-4 items-center">
            <select value={year} onChange={(e)=>setYear(+e.target.value)}
              className="border px-4 py-2 rounded-xl">
              {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
                .map(y => <option key={y}>{y}</option>)}
            </select>

            <select value={houseId} onChange={(e)=>setHouseId(e.target.value)}
              className="border px-4 py-2 rounded-xl">
              <option value="">Tất cả nhà</option>
              {houses.map(h=>(
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <select value={month} onChange={(e)=>setMonth(e.target.value)}
              className="border px-4 py-2 rounded-xl">
              <option value="">Tất cả tháng</option>
              {months.map(m=>(
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <button
              onClick={exportExcel}
              className="ml-auto bg-emerald-500 hover:bg-emerald-600
                         text-white px-6 py-2 rounded-xl font-semibold">
              ⬇ Xuất Excel
            </button>
          </div>

          {/* NEW OPTIONS */}
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showEmptyRooms}
                onChange={() => setShowEmptyRooms(!showEmptyRooms)}
              />
              Xem phòng trống
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showUnpaidInvoices}
                onChange={() => setShowUnpaidInvoices(!showUnpaidInvoices)}
              />
              Thống kê hóa đơn chưa thanh toán
            </label>
          </div>
        </div>

        {/* KPI */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

            <StatCard
              title="Khách thuê"
              value={summary.totalTenants}
              total={summary.totalRooms || 1}
              color="#22c55e"
            />

            <StatCard
              title="Nhà trọ"
              value={summary.totalHouses}
              total={summary.totalHouses || 1}
              color="#0ea5e9"
            />

            <StatCard
              title="Phòng trọ"
              value={summary.totalRooms}
              total={summary.totalRooms || 1}
              color="#f59e0b"
            />

            {showEmptyRooms && (
              <StatCard
                title="Phòng trống"
                value={summary.emptyRooms || 0}
                total={summary.totalRooms || 1}
                color="#ef4444"
              />
            )}

            {showUnpaidInvoices && (
              <StatCard
                title="Hóa đơn chưa thanh toán"
                value={summary.unpaidInvoices || 0}
                total={summary.totalInvoices || 1}
                color="#8b5cf6"
              />
            )}

            <div className="bg-white rounded-3xl shadow-md p-6 text-center">
              <p className="text-sm text-slate-500">Doanh thu năm</p>
              <p className="text-2xl font-extrabold text-indigo-600">
                {totalYearRevenue.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        )}

        {/* CHART */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <Bar data={chartData} />
        </div>
             {/* TABLE */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Thời gian</th>
                <th className="p-4 text-right">Số hóa đơn</th>
                <th className="p-4 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((i) => (
                <tr key={i.period} className="border-t hover:bg-slate-50">
                  <td className="p-4">{i.period}</td>
                  <td className="p-4 text-right">{i.total_invoices}</td>
                  <td className="p-4 text-right font-semibold text-indigo-600">
                    {Number(i.total_revenue).toLocaleString()} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && tableData.length === 0 && (
            <p className="p-6 text-slate-500 text-center">
              Không có dữ liệu
            </p>
          )}
        </div>
      </div>
    </div>
  );
}