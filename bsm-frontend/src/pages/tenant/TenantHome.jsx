import { useEffect, useState } from "react";
import { getTenantDashboard } from "../../api/tenantDashboard.api";
import { 
  CreditCard, 
  Zap, 
  Droplets, 
  Wallet, 
  Bell, 
  FileText,
  Calendar,
  ArrowRight
} from "lucide-react";

export default function TenantHome() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-100"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl border border-slate-100"></div>
          <div className="h-64 bg-slate-100 rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.profile) {
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

  const invoice = data.latest_invoice;

  return (
    <div className="space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Trang tổng quan
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Chào mừng bạn quay trở lại, dưới đây là tổng quan phòng của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold">
          <Calendar size={16} />
          Tháng {invoice?.month || "--"}
        </div>
      </div>

      {/* ===== OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* TOTAL */}
        <Card
          title="Tổng tiền tháng này"
          value={invoice ? formatMoney(invoice.total_amount) : "—"}
          icon={Wallet}
          color="indigo"
        />

        {/* ELECTRIC */}
        <Card
          title="Tiền điện"
          value={invoice ? formatMoney(invoice.electric_cost) : "—"}
          icon={Zap}
          color="orange"
        />

        {/* WATER */}
        <Card
          title="Tiền nước"
          value={invoice ? formatMoney(invoice.water_cost) : "—"}
          icon={Droplets}
          color="blue"
        />

        {/* STATUS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Trạng thái thanh toán</p>
            <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
              <CreditCard size={18} />
            </div>
          </div>
          
          <div className="mt-4">
            {invoice ? (
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full border ${
                  invoice.status === "PAID"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  invoice.status === "PAID" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
                }`}></span>
                {invoice.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-medium">Chưa có hóa đơn</p>
            )}
          </div>
        </div>

      </div>

      {/* ===== DETAIL GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LATEST INVOICE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <FileText size={16} />
              </div>
              <h3 className="font-bold text-slate-800">
                Chi tiết hóa đơn gần nhất
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Tháng {invoice?.month || "--"}</span>
          </div>

          {invoice ? (
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-slate-500 font-medium">Tiền phòng cố định</span>
                <span className="text-slate-800 font-semibold">{formatMoney(invoice.room_price)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500 font-medium">Điện sử dụng ({invoice.electric_used} kWh)</span>
                <span className="text-slate-800 font-semibold">{formatMoney(invoice.electric_cost)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500 font-medium">Nước sử dụng ({invoice.water_used} m³)</span>
                <span className="text-slate-800 font-semibold">{formatMoney(invoice.water_cost)}</span>
              </div>
              <div className="flex justify-between py-3 bg-slate-50/50 -mx-6 px-6 font-bold text-base mt-1">
                <span className="text-slate-700">Tổng cộng</span>
                <span className="text-indigo-600">{formatMoney(invoice.total_amount)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
               <FileText size={32} className="text-slate-300 mb-2" />
               <p className="text-slate-400 text-sm font-medium">Chưa có dữ liệu hóa đơn</p>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Bell size={16} />
              </div>
              <h3 className="font-bold text-slate-800">
                Thông báo mới
              </h3>
            </div>
            {data.notifications.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {data.notifications.length}
              </span>
            )}
          </div>

          {data.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
               <Bell size={32} className="text-slate-300 mb-2" />
               <p className="text-slate-400 text-sm font-medium">Hộp thư thông báo trống</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm flex items-center justify-between">
                        {n.title}
                        <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== CARD COMPONENT CAO CẤP ===== */
function Card({ title, value, icon: Icon, color }) {
  const colorStyles = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className={`p-2 ${style.bg} ${style.text} rounded-xl`}>
          <Icon size={18} />
        </div>
      </div>
      <h2 className={`text-2xl font-bold mt-4 tracking-tight ${style.text}`}>
        {value}
      </h2>
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