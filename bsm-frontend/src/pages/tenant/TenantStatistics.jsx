import { useEffect, useState } from "react";
import { getTenantStatistics } from "../../api/tenantStatistics.api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Zap, Droplets, ArrowUpRight, ArrowDownRight, BarChart2 } from "lucide-react";

// Đăng ký thêm Filler để làm hiệu ứng Gradient đổ bóng dưới đường line
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function TenantStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getTenantStatistics();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // SKELETON LOADING CAO CẤP
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-100 rounded-2xl border border-slate-100"></div>
          <div className="h-32 bg-slate-100 rounded-2xl border border-slate-100"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 rounded-2xl border border-slate-100"></div>
          <div className="h-80 bg-slate-100 rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
         <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
           <BarChart2 size={28} />
         </div>
         <h3 className="text-lg font-bold text-slate-800">Không có dữ liệu thống kê</h3>
         <p className="text-slate-500 text-sm mt-1 max-w-sm">
           Dữ liệu tiêu thụ điện nước sẽ được tổng hợp tự động sau khi có chu kỳ hóa đơn đầu tiên.
         </p>
      </div>
    );
  }

  // HÀM TẠO OPTIONS CHO CHART ĐỒNG BỘ
  const getChartOptions = (label) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ẩn legend mặc định vì đã có tiêu đề custom bên ngoài
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Tiêu thụ: ${context.parsed.y} ${label}`,
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' }, color: '#64748b' }
      },
      y: {
        border: { dash: [4, 4] },
        grid: { color: '#e2e8f0' },
        ticks: { font: { size: 11 }, color: '#64748b', stepSize: 10 }
      }
    }
  });

  // DATA BIỂU ĐỒ ĐIỆN (CÓ HIỆU ỨNG GRADIENT)
  const electricData = {
    labels: stats.electric.map((e) => `Tháng ${e.month}`),
    datasets: [
      {
        label: "Điện (kWh)",
        data: stats.electric.map((e) => e.used),
        borderColor: "#f97316",
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#f97316",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.15)");
          gradient.addColorStop(1, "rgba(249, 115, 22, 0)");
          return gradient;
        },
      },
    ],
  };

  // DATA BIỂU ĐỒ NƯỚC (CÓ HIỆU ỨNG GRADIENT)
  const waterData = {
    labels: stats.water.map((w) => `Tháng ${w.month}`),
    datasets: [
      {
        label: "Nước (m³)",
        data: stats.water.map((w) => w.used),
        borderColor: "#0ea5e9",
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0ea5e9",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(14, 165, 233, 0.15)");
          gradient.addColorStop(1, "rgba(14, 165, 233, 0)");
          return gradient;
        },
      },
    ],
  };

  const electricChange = calculateChange(stats.electric);
  const waterChange = calculateChange(stats.water);

  const currentElectric = stats.electric[stats.electric.length - 1]?.used || 0;
  const currentWater = stats.water[stats.water.length - 1]?.used || 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Thống kê điện nước
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">
          Theo dõi trực quan mức độ tiêu thụ tài nguyên của phòng
        </p>
      </div>

      {/* CHANGE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <StatCard
          title="Điện tiêu thụ tháng này"
          value={currentElectric}
          unit="kWh"
          change={electricChange}
          icon={Zap}
          color="orange"
        />

        <StatCard
          title="Nước tiêu thụ tháng này"
          value={currentWater}
          unit="m³"
          change={waterChange}
          icon={Droplets}
          color="blue"
        />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <Zap size={16} />
            </div>
            <h3 className="font-bold text-slate-800">Chu kỳ sử dụng điện</h3>
          </div>
          <div className="h-64">
            <Line data={electricData} options={getChartOptions('kWh')} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Droplets size={16} />
            </div>
            <h3 className="font-bold text-slate-800">Chu kỳ sử dụng nước</h3>
          </div>
          <div className="h-64">
            <Line data={waterData} options={getChartOptions('m³')} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* COMPONENT CARD CAO CẤP */
function StatCard({ title, value, unit, change, icon: Icon, color }) {
  const isIncrease = parseFloat(change) > 0;
  const isZero = parseFloat(change) === 0;

  const colorStyles = {
    orange: { bg: 'bg-orange-50', text: 'text-orange-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
  };

  const style = colorStyles[color] || colorStyles.orange;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
            <span className="text-slate-400 font-bold text-sm">{unit}</span>
          </div>
        </div>
        <div className={`p-2.5 ${style.bg} ${style.text} rounded-xl`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">So với tháng trước</span>
        
        {isZero ? (
          <span className="text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-full">
            Không đổi (0%)
          </span>
        ) : (
          <span 
            className={`font-bold flex items-center gap-0.5 px-2.5 py-1 rounded-full ${
              isIncrease 
                ? "text-rose-600 bg-rose-50" 
                : "text-emerald-600 bg-emerald-50"
            }`}
          >
            {isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isIncrease ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

/* TÍNH % TĂNG GIẢM */
function calculateChange(data) {
  if (data.length < 2) return "0.0";

  const last = data[data.length - 1].used;
  const prev = data[data.length - 2].used;

  if (prev === 0) return "0.0";

  return (((last - prev) / prev) * 100).toFixed(1);
}