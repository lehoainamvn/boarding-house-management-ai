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
  Home,
  Download
} from "lucide-react";
import html2pdf from "html2pdf.js";

import { getTenantInvoiceDetail } from "../../api/tenantApi";
import { createPaymentUrl } from "../../api/paymentApi";

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
      const data = await getTenantInvoiceDetail(id);
      setInvoice(data);
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
    }
  }

  // HÀM XỬ LÝ THANH TOÁN
  async function handlePayment() {
    setIsProcessing(true);
    try {
      const data = await createPaymentUrl(invoice.total_amount, invoice.id);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi kết nối thanh toán:", err);
      alert(err.message || "Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  }

  // HÀM XUẤT PDF
  function handleDownloadPDF() {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin:       10,
      filename:     `HoaDon_Thang${invoice.month}_${invoice.room_name}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        onclone: (clonedDoc) => {
          // Xóa tất cả các thẻ style và link stylesheet để tránh lỗi oklch của Tailwind v4
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(s => s.remove());
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download size={14} className="text-indigo-600" />
            Tải PDF
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Bảo mật VNPAY Gateway</span>
          </div>
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ HÓA ĐƠN - MÔ PHỎNG TỜ HÓA ĐƠN SÁNG TRỌNG */}
      <div 
        id="invoice-content" 
        style={{ 
          backgroundColor: '#ffffff', 
          color: '#1e293b',
          maxWidth: '48rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: '1.5rem',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          fontFamily: 'sans-serif'
        }}
      >
        
        {/* TIÊU ĐỀ HÓA ĐƠN */}
        <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '0.625rem', borderRadius: '0.75rem' }}>
                <FileText size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Kỳ thanh toán
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Tháng {invoice.month}
                </p>
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {/* DANH SÁCH CHI PHÍ */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Row label="Tên phòng" value={invoice.room_name} icon={Home} />
            <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '1rem' }}>
              <Row label="Tiền phòng cố định" value={formatMoney(invoice.room_price)} icon={FileText} />
            </div>
            <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '1rem' }}>
              <Row 
                label="Tiền điện sử dụng" 
                value={formatMoney(invoice.electric_cost)} 
                subValue={`${invoice.electric_used} kWh × ${formatMoney(invoice.electric_cost / (invoice.electric_used || 1))}`} 
                icon={Zap}
              />
            </div>
            <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '1rem' }}>
              <Row 
                label="Tiền nước sử dụng" 
                value={formatMoney(invoice.water_cost)} 
                subValue={`${invoice.water_used} m³ × ${formatMoney(invoice.water_cost / (invoice.water_used || 1))}`}
                icon={Droplets}
              />
            </div>
          </div>

          {/* HIỆU ỨNG ĐƯỜNG RĂNG CƯA GIẢ LẬP */}
          <div style={{ position: 'relative', borderTop: '1px dashed #e2e8f0', margin: '1.5rem -2rem' }}>
            <div style={{ position: 'absolute', left: '-0.625rem', top: '-0.625rem', width: '1.25rem', height: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '9999px', borderRight: '1px solid #f1f5f9' }}></div>
            <div style={{ position: 'absolute', right: '-0.625rem', top: '-0.625rem', width: '1.25rem', height: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '9999px', borderLeft: '1px solid #f1f5f9' }}></div>
          </div>

          {/* TỔNG CỘNG */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', margin: '1.5rem -2rem -2rem -2rem', padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontWeight: '700', color: '#334155', fontSize: '1rem' }}>Tổng tiền cần trả</span>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500', margin: 0 }}>Đã bao gồm VAT và các phí dịch vụ</p>
            </div>
            <span style={{ fontSize: '1.875rem', fontWeight: '900', color: '#4f46e5', letterSpacing: '-0.025em' }}>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', fontSize: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '0.625rem' }}>
        {Icon && <Icon size={16} style={{ color: '#94a3b8', marginTop: '0.125rem' }} />}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#475569', fontWeight: '500' }}>{label}</span>
          {subValue && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', marginTop: '0.125rem' }}>{subValue}</span>}
        </div>
      </div>
      <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.875rem' }}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const isPaid = status === "PAID";
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        borderRadius: '9999px',
        border: isPaid ? '1px solid #d1fae5' : '1px solid #ffe4e6',
        backgroundColor: isPaid ? '#ecfdf5' : '#fff1f2',
        color: isPaid ? '#047857' : '#be123c'
      }}
    >
      <span style={{
        width: '0.375rem',
        height: '0.375rem',
        borderRadius: '9999px',
        backgroundColor: isPaid ? '#10b981' : '#f43f5e'
      }}></span>
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