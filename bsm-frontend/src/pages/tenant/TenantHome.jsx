import { useEffect, useState } from "react";
import { getTenantDashboard } from "../../api/tenant.self.api.js";
import { useNavigate } from "react-router-dom";

export default function TenantHome() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getTenantDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (!data) {
    return <div className="text-rose-500">Không thể tải dữ liệu</div>;
  }

  return (
    <div className="space-y-8">

      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500
                      rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2">
          Chào mừng bạn 👋
        </h1>
        <p className="text-indigo-100">
          Theo dõi thông tin phòng và hóa đơn của bạn tại đây
        </p>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* ROOM */}
        <div className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600
                          rounded-xl flex items-center justify-center text-xl mb-4">
            🛏
          </div>
          <p className="text-sm text-slate-500">Phòng của bạn</p>
          <p className="text-2xl font-extrabold text-slate-800">
            {data.room || "Chưa được gán phòng"}
          </p>
        </div>

        {/* UNPAID */}
        <div className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-rose-100 text-rose-600
                          rounded-xl flex items-center justify-center text-xl mb-4">
            🧾
          </div>
          <p className="text-sm text-slate-500">
            Hóa đơn chưa thanh toán
          </p>
          <p className="text-2xl font-extrabold text-rose-600">
            {data.unpaidCount} hóa đơn
          </p>
        </div>

        {/* TOTAL */}
        <div className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600
                          rounded-xl flex items-center justify-center text-xl mb-4">
            💰
          </div>
          <p className="text-sm text-slate-500">
            Tổng tiền tháng này
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {Number(data.totalMonth).toLocaleString("vi-VN")} đ
          </p>
        </div>

      </div>

      {/* ===== RECENT INVOICE ===== */}
      {data.recentInvoice && (
        <div className="bg-white rounded-3xl shadow-md p-8 space-y-4">

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              Hóa đơn gần nhất
            </h2>

            <button
              onClick={() => navigate("/tenant/invoices")}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="border rounded-2xl p-6 flex justify-between items-center hover:bg-slate-50 transition">

            <div>
              <p className="font-semibold text-slate-800">
                Tháng {data.recentInvoice.month}
              </p>
              <p className="text-sm text-slate-500">
                Ngày tạo: {new Date(
                  data.recentInvoice.created_at
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-indigo-600">
                {Number(
                  data.recentInvoice.total_amount
                ).toLocaleString("vi-VN")} đ
              </p>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.recentInvoice.status === "PAID"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {data.recentInvoice.status === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}