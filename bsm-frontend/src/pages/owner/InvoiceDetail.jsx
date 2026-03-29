import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, markInvoicePaid } from "../../api/invoice.api";
import toast from "react-hot-toast";

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
      await markInvoicePaid(invoice.id);
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
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2"
        >
          <span>←</span> Trở về danh sách
        </button>

        {/* ===== KHỐI HÓA ĐƠN CHÍNH ===== */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          
          {/* Header Hóa Đơn */}
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-5">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Hóa đơn thu tiền</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Kỳ thanh toán tháng {invoice.month}
              </h1>
            </div>

            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center justify-center
                ${
                  invoice.status === "PAID"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-orange-50 text-orange-600 border border-orange-100"
                }`}
            >
              {invoice.status === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}
            </span>
          </div>

          {/* Grid Thông Tin Cơ Bản */}
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
            <InfoCard label="Số phòng" value={invoice.room_name} />
            <InfoCard label="Khách hàng" value={invoice.tenant_name} />
            <InfoCard label="Ngày lập phiếu" value={new Date(invoice.created_at).toLocaleDateString("vi-VN")} />
          </div>

          {/* Chi Tiết Chi Phí */}
          <div className="p-8">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-5">
              Chi tiết các khoản thu
            </h2>

            <div className="space-y-4">
              <CostRow label="Chi phí thuê phòng" value={money(invoice.room_price)} />
              <CostRow label="Sử dụng điện" value={money(invoice.electric_cost)} />
              <CostRow label="Sử dụng nước" value={money(invoice.water_cost)} />
            </div>

            {/* Đường gạch phân cách */}
            <div className="border-t border-dashed border-slate-200 my-6"></div>

            {/* Tổng Tiền */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng cộng số tiền cần nộp</p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
                  {money(invoice.total_amount)}
                </p>
              </div>

              {invoice.status === "UNPAID" && (
                <button
                  onClick={handleMarkPaid}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white
                            px-6 py-3 rounded-lg font-semibold text-sm
                            shadow-sm transition-all active:scale-[0.98]"
                >
                  Xác nhận đã thu tiền
                </button>
              )}
            </div>
          </div>
          
        </div>
        
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