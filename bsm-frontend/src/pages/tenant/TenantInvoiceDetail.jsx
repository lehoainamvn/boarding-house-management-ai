import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ShieldCheck, 
  FileText,
  Zap,
  Droplets,
  Home
} from "lucide-react";

const API_URL = "http://localhost:5000/api/tenants";

export default function TenantInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function loadDetail() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
    }
  }

  // HÀM XỬ LÝ THANH TOÁN
  async function handlePayment() {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/payment/create-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: invoice.total_amount,
          invoiceId: invoice.id,
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi kết nối thanh toán:", err);
      alert("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  }

  // SKELETON LOADING CAO CẤP
  if (!invoice) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 space-y-6">
          <div className="h-12 bg-slate-100 rounded-xl w-3/4 mx-auto"></div>
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-slate-50 rounded w-full"></div>
            <div className="h-4 bg-slate-50 rounded w-full"></div>
            <div className="h-4 bg-slate-50 rounded w-5/6"></div>
          </div>
          <div className="h-16 bg-slate-100 rounded-xl w-full mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* NÚT QUAY LẠI & HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate("/tenant/invoices")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold mb-2 transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Chi tiết hóa đơn
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Xem thông tin đối soát và tiến hành thanh toán trực tuyến
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 shadow-sm">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Bảo mật VNPAY Gateway</span>
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ HÓA ĐƠN - MÔ PHỎNG TỜ HÓA ĐƠN SÁNG TRỌNG */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* TIÊU ĐỀ HÓA ĐƠN */}
        <div className="bg-slate-50/70 p-8 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  Kỳ thanh toán
                </p>
                <p className="text-xl font-bold text-slate-800">
                  Tháng {invoice.month}
                </p>
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {/* DANH SÁCH CHI PHÍ */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <Row label="Tên phòng" value={invoice.room_name} icon={Home} />
            <div className="border-t border-slate-50 pt-4">
              <Row label="Tiền phòng cố định" value={formatMoney(invoice.room_price)} icon={FileText} />
            </div>
            <div className="border-t border-slate-50 pt-4">
              <Row 
                label="Tiền điện sử dụng" 
                value={formatMoney(invoice.electric_cost)} 
                subValue={`${invoice.electric_used} kWh × ${formatMoney(invoice.electric_cost / (invoice.electric_used || 1))}`} 
                icon={Zap}
              />
            </div>
            <div className="border-t border-slate-50 pt-4">
              <Row 
                label="Tiền nước sử dụng" 
                value={formatMoney(invoice.water_cost)} 
                subValue={`${invoice.water_used} m³ × ${formatMoney(invoice.water_cost / (invoice.water_used || 1))}`}
                icon={Droplets}
              />
            </div>
          </div>

          {/* HIỆU ỨNG ĐƯỜNG RĂNG CƯA GIẢ LẬP */}
          <div className="relative border-t border-dashed border-slate-200 my-6 -mx-8">
            <div className="absolute -left-2.5 -top-2.5 w-5 h-5 bg-slate-50 rounded-full border-r border-slate-100"></div>
            <div className="absolute -right-2.5 -top-2.5 w-5 h-5 bg-slate-50 rounded-full border-l border-slate-100"></div>
          </div>

          {/* TỔNG CỘNG */}
          <div className="flex justify-between items-center bg-slate-50/50 -mx-8 px-8 py-5 -mb-8 mt-6 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-700 text-base">Tổng tiền cần trả</span>
              <p className="text-xs text-slate-400 font-medium">Đã bao gồm VAT và các phí dịch vụ</p>
            </div>
            <span className="text-3xl font-black text-indigo-600 tracking-tight">
              {formatMoney(invoice.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* NÚT THANH TOÁN */}
      <div className="max-w-3xl mx-auto">
        {invoice.status === "UNPAID" ? (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ĐANG KẾT NỐI VNPAY...
              </span>
            ) : (
              <>
                <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                THANH TOÁN NGAY QUA VNPAY
              </>
            )}
          </button>
        ) : (
          <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 shadow-sm shadow-emerald-50">
            <CheckCircle size={18} /> HOÀN TẤT THANH TOÁN
          </div>
        )}

        <p className="text-center text-xs text-slate-400 font-medium mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          Giao dịch được mã hóa và bảo mật bởi VNPAY Gateway
        </p>
      </div>
    </div>
  );
}

// Helper Components
function Row({ label, value, subValue, icon: Icon }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <div className="flex items-start gap-2.5">
        {Icon && <Icon size={16} className="text-slate-400 mt-0.5" />}
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium">{label}</span>
          {subValue && <span className="text-xs text-slate-400 font-bold mt-0.5">{subValue}</span>}
        </div>
      </div>
      <span className="font-bold text-slate-800 text-sm">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const isPaid = status === "PAID";
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${
        isPaid
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : "bg-rose-50 text-rose-700 border-rose-100"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        isPaid ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
      }`}></span>
      {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
    </div>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}