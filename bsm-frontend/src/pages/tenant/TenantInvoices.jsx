import { useEffect, useState } from "react";
import { getTenantInvoices } from "../../api/tenantInvoice.api";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Calendar, 
  ArrowUpRight,
  Inbox
} from "lucide-react";

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getTenantInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // SKELETON LOADING DẠNG BẢNG CAO CẤP
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="h-12 bg-slate-50 border-b border-slate-100"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-50 last:border-0 flex items-center px-6 gap-4">
              <div className="h-4 w-12 bg-slate-100 rounded"></div>
              <div className="h-4 w-24 bg-slate-100 rounded"></div>
              <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
              <div className="h-4 w-16 bg-slate-100 rounded"></div>
              <div className="ml-auto h-8 w-16 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Hóa đơn của tôi
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Theo dõi và tra cứu lịch sử hóa đơn hàng tháng
          </p>
        </div>

        {/* Thanh tìm kiếm nhanh giả lập để giao diện đầy đặn hơn */}
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tháng..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
               <Inbox size={28} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Chưa có hóa đơn nào</h3>
             <p className="text-slate-500 text-sm mt-1 max-w-sm">
               Các hóa đơn phát sinh hàng tháng của bạn sẽ hiển thị đầy đủ tại đây.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-left">
                  <th className="px-6 py-4 font-bold tracking-wide uppercase text-xs">Tháng</th>
                  <th className="px-6 py-4 font-bold tracking-wide uppercase text-xs">Tổng tiền</th>
                  <th className="px-6 py-4 font-bold tracking-wide uppercase text-xs">Trạng thái</th>
                  <th className="px-6 py-4 font-bold tracking-wide uppercase text-xs">Ngày tạo</th>
                  <th className="px-6 py-4 font-bold tracking-wide uppercase text-xs text-center">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                          <Calendar size={14} />
                        </div>
                        <span className="font-bold text-slate-800">
                          Tháng {invoice.month}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-indigo-600 font-bold text-sm">
                      {formatMoney(invoice.total_amount)}
                    </td>

                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
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
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {formatDate(invoice.created_at)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/tenant/invoices/${invoice.id}`)
                        }
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <FileText size={12} />
                        <span>Chi tiết</span>
                        <ArrowUpRight size={12} className="opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

/* FORMAT MONEY */
function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}

/* FORMAT DATE */
function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}