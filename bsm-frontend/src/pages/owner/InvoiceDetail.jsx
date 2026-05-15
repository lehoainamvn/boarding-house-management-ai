import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, updateInvoiceStatus } from "../../api/invoiceApi";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        setError(err.message || "Không tải được hóa đơn");
        toast.error(err.message || "Không tải được hóa đơn");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  async function handleMarkPaid() {
    if (!invoice) return;
    if (!window.confirm("Xác nhận đã thu tiền hóa đơn này?")) return;

    try {
      await updateInvoiceStatus(invoice.id, "PAID");
      setInvoice({
        ...invoice,
        status: "PAID",
        paid_at: new Date().toISOString()
      });
      toast.success("Đã cập nhật trạng thái hóa đơn thành công");
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  }

  function handleDownloadPDF() {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin:       10,
      filename:     `HoaDon_${invoice.month}_${invoice.room_name}.pdf`,
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

  const money = (n) => n.toLocaleString("vi-VN") + " đ";

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-slate-50">
        <div className="bg-white border border-red-100 text-red-600 px-6 py-4 rounded-xl shadow-sm text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  /* ================= MAIN ================= */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* ===== NÚT QUAY LẠI ===== */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <span>←</span> Trở về danh sách
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
          >
            <Download size={14} className="text-indigo-600" />
            Xuất hóa đơn PDF
          </button>
        </div>

        {/* KHU VỰC HIỂN THỊ HÓA ĐƠN CHÍNH */}
        <div 
          id="invoice-content" 
          style={{ 
            backgroundColor: '#ffffff', 
            color: '#0f172a',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            fontFamily: 'sans-serif'
          }}
        >
          
          {/* Header Hóa Đơn */}
          <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', color: '#94a3b8', margin: 0 }}>Hóa đơn thu tiền</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem', marginBottom: 0 }}>
                Kỳ thanh toán tháng {invoice.month}
              </h1>
            </div>

            <span
              style={{
                padding: '0.375rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                border: invoice.status === "PAID" ? '1px solid #d1fae5' : '1px solid #fed7aa',
                backgroundColor: invoice.status === "PAID" ? '#ecfdf5' : '#fff7ed',
                color: invoice.status === "PAID" ? '#059669' : '#ea580c'
              }}
            >
              {invoice.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
            </span>
          </div>

          {/* Grid Thông Tin Cơ Bản */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
            <InfoCard label="Số phòng" value={invoice.room_name} />
            <InfoCard label="Khách hàng" value={invoice.tenant_name} />
            <InfoCard label="Ngày lập phiếu" value={new Date(invoice.created_at).toLocaleDateString("vi-VN")} />
          </div>

          {/* Chi Tiết Chi Phí */}
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Chi tiết các khoản thu
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CostRow label="Chi phí thuê phòng" value={money(invoice.room_price)} />
              <CostRow label="Sử dụng điện" value={money(invoice.electric_cost)} />
              <CostRow label="Sử dụng nước" value={money(invoice.water_cost)} />
            </div>

            {/* Đường gạch phân cách */}
            <div style={{ borderTop: '1px dashed #e2e8f0', margin: '1.5rem 0' }}></div>

            {/* Tổng Tiền */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>Tổng cộng số tiền cần nộp</p>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginTop: '0.125rem' }}>
                  {money(invoice.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {invoice.status === "UNPAID" && (
          <button
            onClick={handleMarkPaid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white
                      px-6 py-4 rounded-xl font-bold text-sm
                      shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            Xác nhận đã thu tiền từ khách
          </button>
        )}
        
        {/* Chân trang thông tin thêm (Tùy chọn) */}
        <p className="text-center text-xs text-slate-400">
          Đây là phiếu thu tự động được khởi tạo từ hệ thống quản lý.
        </p>
      </div>
    </div>
  );
}

/* ================= COMPONENT HÀM CON ================= */
function InfoCard({ label, value }) {
  return (
    <div className="p-6">
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className="text-base font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm py-0.5">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}