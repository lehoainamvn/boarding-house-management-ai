import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInvoicesByMonth } from "../../api/invoice.api";
import { getHouses } from "../../api/house.api";
import { FileText, Send, Copy, X, Search, Calendar, Home, CreditCard } from "lucide-react";

export default function Invoices() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  /* ================= FILTER STATE ================= */
  const [year, setYear] = useState(
    Number(localStorage.getItem("invoice_year")) || currentYear
  );

  const [month, setMonth] = useState(
    localStorage.getItem("invoice_month") ||
      String(new Date().getMonth() + 1).padStart(2, "0")
  );

  const [houseId, setHouseId] = useState(
    localStorage.getItem("invoice_house") || ""
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("invoice_status") || "ALL"
  );

  /* ================= DATA ================= */
  const [houses, setHouses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zaloInvoice, setZaloInvoice] = useState(null);

  /* ================= SAVE FILTER ================= */
  useEffect(() => {
    localStorage.setItem("invoice_year", year);
    localStorage.setItem("invoice_month", month);
    localStorage.setItem("invoice_house", houseId);
    localStorage.setItem("invoice_status", statusFilter);
  }, [year, month, houseId, statusFilter]);

  /* ================= LOAD HOUSES ================= */
  useEffect(() => {
    getHouses().then(setHouses);
  }, []);

  /* ================= FETCH ================= */
  async function handleFetch() {
    try {
      setLoading(true);
      setError("");

      const monthParam = `${year}-${month}`;

      const data = await getInvoicesByMonth(
        monthParam,
        houseId
      );

      setInvoices(data);
    } catch (err) {
      setError(err.message || "Không tải được hóa đơn");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleFetch();
  }, []);

  /* ================= STATUS FILTER ================= */
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter((i) => i.status === statusFilter)
      );
    }
  }, [invoices, statusFilter]);

  /* ================= ZALO ================= */
  function buildMessage(invoice) {
    return `🏠 HÓA ĐƠN THÁNG ${invoice.month}

Phòng: ${invoice.room_name}
Người thuê: ${invoice.tenant_name}

💰 Tổng tiền: ${invoice.total_amount.toLocaleString("vi-VN")} đ
📅 Ngày tạo: ${new Date(invoice.created_at).toLocaleDateString()}

Trạng thái: ${
      invoice.status === "PAID"
        ? "Đã thanh toán"
        : "Chưa thanh toán"
    }

Vui lòng thanh toán trước ngày 10.`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(
      buildMessage(zaloInvoice)
    );
    toast.success("Đã copy nội dung hóa đơn");
  }

  function handleOpenZalo() {
    if (!zaloInvoice.tenant_phone) {
      toast.error("Khách thuê chưa có số điện thoại");
      return;
    }
    window.open(
      `https://zalo.me/${zaloInvoice.tenant_phone}`,
      "_blank"
    );
  }

  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">

      {/* HEADER ĐỒNG BỘ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý hóa đơn
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem, đối soát trạng thái và gửi hóa đơn cho khách thuê
          </p>
        </div>
      </div>

      {/* ================= BỘ LỌC CHUYÊN NGHIỆP ================= */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          
          {/* NĂM */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Năm</label>
            <div className="relative mt-1.5">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={year}
                onChange={(e) => setYear(+e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              >
                {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
                  .map((y) => (
                    <option key={y}>{y}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* THÁNG */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            >
              {months.map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* NHÀ */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Khu vực / Nhà</label>
            <div className="relative mt-1.5">
              <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">Tất cả nhà</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TRẠNG THÁI */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Trạng thái</label>
            <div className="relative mt-1.5">
              <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="ALL">Tất cả</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
              </select>
            </div>
          </div>

          {/* NÚT LỌC */}
          <button
            onClick={handleFetch}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Search size={16} />
            Lọc kết quả
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* ================= BẢNG DỮ LIỆU ================= */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600" />
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Người thuê</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{i.room_name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{i.tenant_name}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {i.total_amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold
                        ${
                          i.status === "PAID"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {i.status === "PAID" ? "Đã trả" : "Chưa trả"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/invoices/${i.id}`)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => setZaloInvoice(i)}
                          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          <Send size={12} />
                          Zalo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <FileText size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-sm font-medium">Không tìm thấy hóa đơn nào</p>
          </div>
        )}
      </div>

      {/* ================= MODAL GIẢ LẬP KHUNG CHAT ZALO ================= */}
      {zaloInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-100 space-y-5">
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Send size={18} className="text-blue-500" />
                Gửi thông báo Zalo
              </h2>
              <button 
                onClick={() => setZaloInvoice(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Khung giả lập tin nhắn */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-2 uppercase">Bản xem trước tin nhắn</p>
              <div className="bg-white border border-slate-200/60 p-3.5 rounded-lg text-sm text-slate-700 whitespace-pre-line shadow-sm">
                {buildMessage(zaloInvoice)}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition"
              >
                <Copy size={16} />
                Copy văn bản
              </button>

              <button
                onClick={handleOpenZalo}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
              >
                <Send size={16} />
                Mở Zalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}