import { useEffect, useState } from "react";
import { getTenantStatistics } from "../../api/tenantApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Zap, Droplets, TrendingUp, TrendingDown, Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
      // Giả lập delay nhẹ để thấy hiệu ứng skeleton đẹp
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const data = await getTenantStatistics();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // SKELETON LOADING UI HIỆN ĐẠI
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse w-full max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-white rounded-[2rem] border border-slate-100 shadow-sm"></div>
          <div className="h-40 bg-white rounded-[2rem] border border-slate-100 shadow-sm"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-sm"></div>
          <div className="h-[400px] bg-white rounded-[2rem] border border-slate-100 shadow-sm"></div>
        </div>
      </div>
    );
  }

  if (!stats || !stats.electric || !stats.water) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
         <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner">
           <Activity size={36} strokeWidth={1.5} />
         </div>
         <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Chưa có dữ liệu tiêu thụ</h3>
         <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
           Hệ thống đang chờ chu kỳ hóa đơn đầu tiên được tạo để tổng hợp và vẽ biểu đồ theo dõi cho phòng này.
         </p>
      </div>
    );
  }

  // CẤU HÌNH CHART ĐẸP MẮT (CHUYÊN NGHIỆP)
  const getChartOptions = (label) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)', // slate-900 with opacity
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 13, weight: '700' },
        bodyFont: { size: 13, weight: '500' },
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.parsed.y} ${label}`,
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 12, weight: '600' }, color: '#94a3b8', padding: 12 }
      },
      y: {
        border: { display: false },
        grid: { color: '#f1f5f9', drawTicks: false, borderDash: [5, 5] },
        ticks: { 
          font: { size: 12, weight: '500' }, 
          color: '#94a3b8', 
          padding: 16,
          // Đã xóa stepSize để tránh vỡ biểu đồ khi số quá lớn
        }
      }
    }
  });

  const createGradient = (ctx, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  const electricData = {
    labels: stats.electric.map((e) => `T${e.month}`),
    datasets: [
      {
        label: "Điện",
        data: stats.electric.map((e) => e.used),
        borderColor: "#f59e0b", // amber-500
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#f59e0b",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.5, // Làm cong mượt mà
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return createGradient(ctx, "rgba(245, 158, 11, 0.2)", "rgba(245, 158, 11, 0)");
        },
      },
    ],
  };

  const waterData = {
    labels: stats.water.map((w) => `T${w.month}`),
    datasets: [
      {
        label: "Nước",
        data: stats.water.map((w) => w.used),
        borderColor: "#0ea5e9", // sky-500
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0ea5e9",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.5,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return createGradient(ctx, "rgba(14, 165, 233, 0.2)", "rgba(14, 165, 233, 0)");
        },
      },
    ],
  };

  const invoiceData = {
    labels: stats.invoices.map((i) => `T${i.month.split('-')[1]}`),
    datasets: [
      {
        label: "Tổng tiền",
        data: stats.invoices.map((i) => i.amount),
        backgroundColor: stats.invoices.map((i) => 
          i.status === "PAID" ? "rgba(99, 102, 241, 0.8)" : "rgba(244, 63, 94, 0.8)"
        ),
        borderRadius: 12,
        hoverBackgroundColor: stats.invoices.map((i) => 
          i.status === "PAID" ? "rgba(99, 102, 241, 1)" : "rgba(244, 63, 94, 1)"
        ),
      },
    ],
  };

  const electricChange = calculateChange(stats.electric);
  const waterChange = calculateChange(stats.water);
  const currentElectric = stats.electric[stats.electric.length - 1]?.used || 0;
  const currentWater = stats.water[stats.water.length - 1]?.used || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Thống kê tiêu thụ
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1.5">
            Phân tích chỉ số điện nước theo thời gian thực
          </p>
        </div>
      </div>

      {/* STAT CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Điện năng tiêu thụ"
          subtitle="Tháng hiện tại"
          value={currentElectric}
          unit="kWh"
          change={electricChange}
          icon={Zap}
          theme="amber"
        />
        <StatCard
          title="Khối lượng nước"
          subtitle="Tháng hiện tại"
          value={currentWater}
          unit="m³"
          change={waterChange}
          icon={Droplets}
          theme="sky"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Biến động điện năng" 
          icon={Zap} 
          theme="amber"
          data={electricData} 
          options={getChartOptions('kWh')} 
        />
        <ChartCard 
          title="Biến động nguồn nước" 
          icon={Droplets} 
          theme="sky"
          data={waterData} 
          options={getChartOptions('m³')} 
        />
      </div>

      {/* INVOICE BAR CHART */}
      <div className="bg-white rounded-[2rem] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 p-7 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[1rem]">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Thống kê tiền phòng & thanh toán</h3>
              <p className="text-slate-400 text-xs font-medium">Màu xanh: Đã thanh toán | Màu đỏ: Chưa thanh toán</p>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full relative">
          <Bar 
            data={invoiceData} 
            options={{
              ...getChartOptions('VNĐ'),
              plugins: {
                ...getChartOptions('VNĐ').plugins,
                tooltip: {
                  ...getChartOptions('VNĐ').plugins.tooltip,
                  callbacks: {
                    label: (context) => ` ${context.parsed.y.toLocaleString('vi-VN')} VNĐ`,
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTS UI PHỤ TRỢ MANG PHONG CÁCH SAAS
========================================== */

function StatCard({ title, subtitle, value, unit, change, icon: Icon, theme }) {
  const isIncrease = parseFloat(change) > 0;
  const isZero = parseFloat(change) === 0;

  const themes = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100', iconBg: 'bg-amber-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100', iconBg: 'bg-sky-100' },
  };
  const style = themes[theme];

  return (
    <div className="bg-white rounded-[2rem] p-7 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      {/* Background Decorator */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${style.bg} opacity-50 transition-transform group-hover:scale-110 duration-500`}></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">{title}</h3>
          </div>
          <p className="text-slate-400 text-xs font-medium mb-4">{subtitle}</p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 tracking-tighter">
              {Number(value).toLocaleString('vi-VN')}
            </span>
            <span className={`font-bold text-sm ${style.text}`}>{unit}</span>
          </div>
        </div>
        
        <div className={`p-3.5 ${style.bg} ${style.text} rounded-2xl`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-5 border-t border-slate-50 flex items-center justify-between text-sm">
        <span className="text-slate-400 font-medium text-xs">So với tháng liền kề</span>
        
        {isZero ? (
          <span className="text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-xl text-xs">
            Bình ổn (0%)
          </span>
        ) : (
          <span 
            className={`font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl ${
              isIncrease ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
            }`}
          >
            {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isIncrease ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, theme, data, options }) {
  const themes = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-500' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-500' },
  };
  const style = themes[theme];

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 p-7 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${style.bg} ${style.text} rounded-[1rem]`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="h-[300px] w-full relative">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

/* =========================================
   HÀM TÍNH TOÁN
========================================== */
function calculateChange(data) {
  if (!data || data.length < 2) return "0.0";
  const last = parseFloat(data[data.length - 1].used);
  const prev = parseFloat(data[data.length - 2].used);
  if (prev === 0) return last > 0 ? "100.0" : "0.0";
  return (((last - prev) / prev) * 100).toFixed(1);
}