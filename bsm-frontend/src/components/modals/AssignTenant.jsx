import { useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config";

export default function AssignTenant({ roomId, onSuccess }) {
  const [type, setType] = useState("EXISTING");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    start_date: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit() {
    try {
      if (type === "EXISTING" && !form.email) {
        return toast.error("Vui lòng nhập email người thuê");
      }

      if (type === "NEW" && (!form.name || !form.phone || !form.email)) {
        return toast.error("Vui lòng nhập đầy đủ thông tin người thuê");
      }

      setLoading(true);
      const token = localStorage.getItem("token");

      const body =
        type === "EXISTING"
          ? {
              tenantType: "EXISTING",
              email: form.email,
              start_date: form.start_date,
            }
          : {
              tenantType: "NEW",
              name: form.name,
              email: form.email,
              phone: form.phone,
              start_date: form.start_date,
            };

      const res = await fetch(
        `${API_BASE_URL}/rooms/${roomId}/assign-tenant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Không thể gán người thuê");
      }

      toast.success("Gán người thuê thành công");
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-5">

      <h3 className="text-lg font-semibold">Gán người thuê</h3>

      {/* TYPE */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Loại người thuê
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input"
        >
          <option value="EXISTING">Đã có tài khoản</option>
          <option value="NEW">Chưa có tài khoản</option>
        </select>
      </div>

      {/* EXISTING */}
      {type === "EXISTING" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Email người thuê
          </label>
          <input
            className="input"
            placeholder="tenant@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      )}

      {/* NEW */}
      {type === "NEW" && (
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Tên"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <input
            className="input"
            placeholder="SĐT"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      )}

      {/* DATE */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Ngày bắt đầu thuê
        </label>
        <input
          type="date"
          className="input"
          value={form.start_date}
          onChange={(e) => handleChange("start_date", e.target.value)}
        />
      </div>

      {/* ACTION */}
      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-60"
      >
        {loading ? "Đang xử lý..." : "Gán người thuê"}
      </button>
    </div>
  );
}
