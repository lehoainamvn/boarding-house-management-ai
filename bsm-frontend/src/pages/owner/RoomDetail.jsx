import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getRoomById, updateRoom } from "../../api/room.api";
import { findTenantByEmail, assignTenantToRoom, removeTenantFromRoom } from "../../api/tenant.api";

export default function RoomDetail() {
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== EDIT NAME ===== */
  const [editingName, setEditingName] = useState(false);
  const [roomName, setRoomName] = useState("");

  /* ===== PRICE ===== */
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({
    room_price: 0,
    electric_price: 0,
    water_type: "METER",
    water_price: 0,
    old_index: 0,
    new_index: 0,
    people_count: 1,
    water_price_per_person: 0,
  });

  /* ===== TENANT EXISTING ===== */
  const [email, setEmail] = useState("");
  const [foundTenant, setFoundTenant] = useState(null);
  const [error, setError] = useState("");
  const [startDateExisting, setStartDateExisting] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* ===== TENANT NEW ===== */
  const [isCreatingNewTenant, setIsCreatingNewTenant] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: "",
    email: "",
    phone: "",
    start_date: new Date().toISOString().slice(0, 10), // Thêm ngày vào form tạo mới
  });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  /* ================= FETCH ROOM ================= */
  async function fetchRoom() {
    try {
      setLoading(true);
      const data = await getRoomById(id);
      setRoom(data);
      setRoomName(data.room_name);

      setPriceForm({
        room_price: data.room_price ?? 0,
        electric_price: data.electric_price ?? 0,
        water_type: data.water_type ?? "METER",
        water_price: data.water_price ?? 0,
        old_index: data.old_index ?? 0,
        new_index: data.new_index ?? 0,
        people_count: data.people_count ?? 1,
        water_price_per_person: data.water_price_per_person ?? 0,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ================= SAVE NAME ================= */
  async function saveRoomName() {
    try {
      await updateRoom(id, { room_name: roomName });
      toast.success("Đã cập nhật tên phòng");
      setEditingName(false);
      fetchRoom();
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật tên phòng");
    }
  }

  /* ================= SAVE PRICE ================= */
  async function savePrice() {
    try {
      const payload =
        priceForm.water_type === "PERSON"
          ? {
              room_price: Number(priceForm.room_price),
              electric_price: Number(priceForm.electric_price),
              water_type: "PERSON",
              people_count: Number(priceForm.people_count),
              water_price_per_person: Number(priceForm.water_price_per_person),
            }
          : {
              room_price: Number(priceForm.room_price),
              electric_price: Number(priceForm.electric_price),
              water_type: "METER",
              water_price: Number(priceForm.water_price),
            };

      await updateRoom(id, payload);
      toast.success("Đã lưu giá");
      setEditingPrice(false);
      fetchRoom();
    } catch (err) {
      toast.error(err.message || "Không thể lưu giá");
    }
  }

  /* ================= TENANT EXISTING ================= */
  async function handleCheckEmail() {
    try {
      const data = await findTenantByEmail(email);
      setFoundTenant(data);
      setError("");
    } catch (err) {
      setFoundTenant(null);
      setError(err.message);
    }
  }

  async function handleAssignTenant() {
    try {
      await assignTenantToRoom(id, {
        tenantType: "EXISTING",
        email: foundTenant.email,
        start_date: startDateExisting,
      });

      toast.success("Gán người thuê thành công");
      setEmail("");
      setFoundTenant(null);
      fetchRoom();
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* ================= REMOVE TENANT ================= */
  async function removeTenant() {
    if (!window.confirm("Xác nhận trả phòng?")) return;

    try {
      await removeTenantFromRoom(id);
      toast.success("Đã trả phòng");
      fetchRoom();
    } catch (err) {
      toast.error(err.message || "Không thể trả phòng");
    }
  }

  /* ================= CREATE + ASSIGN ================= */
  async function handleCreateAndAssignTenant() {
    try {
      await assignTenantToRoom(id, {
        tenantType: "NEW",
        ...newTenantForm,
      });

      toast.success("Tạo & gán phòng thành công");
      setIsCreatingNewTenant(false);
      setNewTenantForm({
        name: "",
        email: "",
        phone: "",
        start_date: new Date().toISOString().slice(0, 10),
      });
      fetchRoom();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const money = (n) => n?.toLocaleString("vi-VN") + " đ";
  
  // Hàm format hiển thị ngày cho đẹp
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );

  if (!room)
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white border border-red-100 text-red-600 px-6 py-4 rounded-xl shadow-sm text-sm">
          Không tìm thấy dữ liệu phòng
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER PHÒNG */}
      <div className="flex items-center justify-between">
        {!editingName ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {room.room_name}
              </h1>
              <p className="text-sm text-slate-500">
                Quản lý thông tin chi tiết của phòng
              </p>
            </div>
            <button
              onClick={() => setEditingName(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm"
            >
              Chỉnh sửa tên
            </button>
          </>
        ) : (
          <div className="flex gap-2 w-full max-w-md">
            <input
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button
              onClick={saveRoomName}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Lưu
            </button>
            <button
              onClick={() => {
                setRoomName(room.room_name);
                setEditingName(false);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* GRID 2 CỘT PHÍA DƯỚI */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* CỘT 1: GIÁ DỊCH VỤ */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800">Biểu phí dịch vụ</h3>
            {!editingPrice && (
              <button
                onClick={() => setEditingPrice(true)}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition"
              >
                Thay đổi giá
              </button>
            )}
          </div>

          {!editingPrice ? (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Giá phòng</span>
                <span className="font-semibold text-slate-800">
                  {money(room.room_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Giá điện</span>
                <span className="font-semibold text-slate-800">
                  {money(room.electric_price)} /kWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Giá nước</span>
                {room.water_type === "METER" ? (
                  <span className="font-semibold text-slate-800">
                    {money(room.water_price)} /m³
                  </span>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {room.people_count} người ×{" "}
                    {money(room.water_price_per_person)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Giá phòng (đ)
                </label>
                <input
                  type="number"
                  className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={priceForm.room_price}
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, room_price: e.target.value })
                  }
                  onInput={(e) => {
                    if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                      e.target.value = e.target.value.replace(/^0+/, '');
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Giá điện (đ/kWh)
                </label>
                <input
                  type="number"
                  className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={priceForm.electric_price}
                  onChange={(e) =>
                    setPriceForm({
                      ...priceForm,
                      electric_price: e.target.value,
                    })
                  }
                  onInput={(e) => {
                    if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                      e.target.value = e.target.value.replace(/^0+/, '');
                    }
                  }}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">
                  Cách tính tiền nước
                </label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="text-indigo-600 focus:ring-indigo-500"
                      checked={priceForm.water_type === "METER"}
                      onChange={() =>
                        setPriceForm({ ...priceForm, water_type: "METER" })
                      }
                    />
                    <span className="text-slate-700 font-medium">
                      Theo đồng hồ
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="text-indigo-600 focus:ring-indigo-500"
                      checked={priceForm.water_type === "PERSON"}
                      onChange={() =>
                        setPriceForm({ ...priceForm, water_type: "PERSON" })
                      }
                    />
                    <span className="text-slate-700 font-medium">
                      Theo đầu người
                    </span>
                  </label>
                </div>
              </div>

              {priceForm.water_type === "METER" ? (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Giá nước (đ/m³)
                  </label>
                  <input
                    type="number"
                    className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={priceForm.water_price}
                    onChange={(e) =>
                      setPriceForm({
                        ...priceForm,
                        water_price: e.target.value,
                      })
                    }
                    onInput={(e) => {
                      if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                        e.target.value = e.target.value.replace(/^0+/, '');
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Số người
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={priceForm.people_count}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          people_count: e.target.value,
                        })
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                          e.target.value = e.target.value.replace(/^0+/, '');
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Giá / người
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1.5 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={priceForm.water_price_per_person}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          water_price_per_person: e.target.value,
                        })
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                          e.target.value = e.target.value.replace(/^0+/, '');
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={savePrice}
                  className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition"
                >
                  Cập nhật giá
                </button>
                <button
                  onClick={() => setEditingPrice(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CỘT 2: NGƯỜI THUÊ */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800">Thông tin người thuê</h3>
          </div>

          {room.tenant ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Họ và tên
                  </p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {room.tenant.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Email
                  </p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    {room.tenant.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Số điện thoại
                  </p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    {room.tenant.phone}
                  </p>
                </div>
                
                {/* HIỂN THỊ NGÀY NHẬN PHÒNG */}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <p className="text-xs font-semibold text-indigo-500 uppercase">
                    Ngày nhận phòng
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {formatDate(room.tenant?.start_date)}
                  </p>
                </div>
              </div>

              <button
                onClick={removeTenant}
                className="w-full bg-white border border-rose-200 text-rose-600 text-sm font-semibold py-3 rounded-lg hover:bg-rose-50 transition"
              >
                Yêu cầu trả phòng
              </button>
            </div>
          ) : (
            <>
              {!isCreatingNewTenant ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">
                      Đã có tài khoản hệ thống
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Nhập email cần tìm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        onClick={handleCheckEmail}
                        className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition"
                      >
                        Tìm
                      </button>
                    </div>

                    {error && (
                      <p className="text-xs font-medium text-rose-500 mt-1.5">
                        {error}
                      </p>
                    )}

                    {foundTenant && (
                      <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                        <p className="text-sm font-semibold text-slate-800">
                          {foundTenant.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {foundTenant.email} • {foundTenant.phone}
                        </p>
                        
                        {/* CHỌN NGÀY KHI GÁN TÀI KHOẢN CÓ SẴN */}
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase">
                            Chọn ngày nhận phòng
                          </label>
                          <input
                            type="date"
                            className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={startDateExisting}
                            onChange={(e) => setStartDateExisting(e.target.value)}
                          />
                        </div>
                        
                        <button
                          onClick={handleAssignTenant}
                          className="mt-2 w-full bg-emerald-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-emerald-700 transition"
                        >
                          Xác nhận gán phòng
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">
                      Người thuê chưa có tài khoản
                    </label>
                    <button
                      onClick={() => setIsCreatingNewTenant(true)}
                      className="w-full bg-indigo-600 text-white text-sm font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Tạo hồ sơ người thuê mới
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Khởi tạo hồ sơ mới
                  </label>
                  {["name", "email", "phone"].map((k) => (
                    <input
                      key={k}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder={
                        k === "name"
                          ? "Họ tên người thuê"
                          : k === "email"
                          ? "Địa chỉ Email"
                          : "Số điện thoại"
                      }
                      value={newTenantForm[k]}
                      onChange={(e) =>
                        setNewTenantForm({
                          ...newTenantForm,
                          [k]: e.target.value,
                        })
                      }
                    />
                  ))}
                  
                  {/* CHỌN NGÀY KHI TẠO MỚI */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Ngày nhận phòng
                    </label>
                    <input
                      type="date"
                      className="w-full mt-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={newTenantForm.start_date}
                      onChange={(e) =>
                        setNewTenantForm({
                          ...newTenantForm,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateAndAssignTenant}
                      className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Khởi tạo & Gán
                    </button>
                    <button
                      onClick={() => setIsCreatingNewTenant(false)}
                      className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}