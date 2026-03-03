export default function TenantInvoices() {
  return (
    <div className="space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Hóa đơn của tôi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi và kiểm tra các hóa đơn phòng
          </p>
        </div>

        <select className="border px-4 py-2 rounded-xl text-sm
                           focus:ring-2 focus:ring-indigo-500">
          <option>Tất cả</option>
          <option>Chưa thanh toán</option>
          <option>Đã thanh toán</option>
        </select>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl shadow-md p-6">
          <p className="text-sm text-slate-500">Tổng hóa đơn</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            12
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6">
          <p className="text-sm text-slate-500">
            Chưa thanh toán
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            1
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6">
          <p className="text-sm text-slate-500">
            Tổng tiền chưa thanh toán
          </p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            2.500.000 đ
          </p>
        </div>

      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left font-semibold">
                Tháng
              </th>
              <th className="p-4 text-right font-semibold">
                Tổng tiền
              </th>
              <th className="p-4 text-center font-semibold">
                Trạng thái
              </th>
              <th className="p-4 text-center font-semibold">
                Chi tiết
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">

            <tr className="hover:bg-slate-50 transition">
              <td className="p-4 font-medium text-slate-800">
                Tháng 03/2026
              </td>

              <td className="p-4 text-right font-semibold text-indigo-600">
                2.500.000 đ
              </td>

              <td className="p-4 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold
                                 bg-amber-100 text-amber-700">
                  Chưa thanh toán
                </span>
              </td>

              <td className="p-4 text-center">
                <button className="text-indigo-600 font-semibold hover:underline">
                  Xem
                </button>
              </td>
            </tr>

            <tr className="hover:bg-slate-50 transition">
              <td className="p-4 font-medium text-slate-800">
                Tháng 02/2026
              </td>

              <td className="p-4 text-right font-semibold text-slate-800">
                2.400.000 đ
              </td>

              <td className="p-4 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold
                                 bg-emerald-100 text-emerald-700">
                  Đã thanh toán
                </span>
              </td>

              <td className="p-4 text-center">
                <button className="text-indigo-600 font-semibold hover:underline">
                  Xem
                </button>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

      {/* ===== EMPTY STATE (Demo) ===== */}
      {/* 
      <div className="bg-white rounded-3xl shadow-md p-12 text-center text-slate-500">
        Bạn chưa có hóa đơn nào
      </div>
      */}

    </div>
  );
}