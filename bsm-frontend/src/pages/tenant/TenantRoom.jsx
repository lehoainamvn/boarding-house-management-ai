export default function TenantRoom() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Phòng của tôi
      </h1>

      <div className="bg-white rounded-3xl shadow p-8 space-y-4">

        <div>
          <p className="text-sm text-slate-500">Tên phòng</p>
          <p className="font-semibold text-lg">A101</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Giá phòng</p>
          <p className="font-semibold text-lg">
            2.000.000 đ / tháng
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Ngày bắt đầu hợp đồng</p>
          <p className="font-semibold text-lg">01/01/2025</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Trạng thái</p>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-600
                           rounded-full text-sm font-semibold">
            Đang thuê
          </span>
        </div>

      </div>
    </div>
  );
}