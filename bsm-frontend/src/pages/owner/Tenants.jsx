import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, User, Mail, Phone, Lock, Search, X } from "lucide-react";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingTenant, setEditingTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const emptyForm = { name: "", email: "", phone: "", password: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTenants(data);
    } catch {
      toast.error("Không tải được danh sách khách thuê");
    } finally {
      setLoading(false);
    }
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isPhoneValid(phone) {
    return /^\d{9,12}$/.test(phone.replace(/\s+/g, ""));
  }

  function isDuplicate({ name, email, phone }, excludeId) {
    return tenants.some((t) => {
      if (excludeId && t.id === excludeId) return false;
      if (email && t.email?.toLowerCase() === email.toLowerCase()) return true;
      if (phone && t.phone === phone) return true;
      if (name && t.name?.toLowerCase() === name.toLowerCase()) return true;
      return false;
    });
  }

  async function handleAdd() {
    if (!form.name || !form.phone || !form.password) {
      return toast.error("Vui lòng điền đầy đủ tên, số điện thoại và mật khẩu");
    }

    if (!isPhoneValid(form.phone)) {
      return toast.error("Số điện thoại phải là 9-12 chữ số");
    }

    if (form.email && !isEmailValid(form.email)) {
      return toast.error("Địa chỉ email không hợp lệ");
    }

    if (isDuplicate(form)) {
      return toast.error("Tên/Email/Số điện thoại đã tồn tại");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Thêm khách thuê thất bại");
      }
      toast.success("Đã thêm khách thuê");
      setShowAddModal(false);
      setForm(emptyForm);
      fetchTenants();
    } catch (err) {
      toast.error(err.message || "Thêm khách thuê thất bại");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn chắc chắn muốn xóa khách thuê này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Đã xóa khách thuê");
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error(err.message || "Xóa thất bại");
    }
  }

  function openEditModal(tenant) {
    setEditingTenant(tenant);
    setForm({
      name: tenant.name,
      email: tenant.email || "",
      phone: tenant.phone || "",
    });
  }

  async function handleUpdate() {
    if (!form.name || !form.phone) {
      return toast.error("Vui lòng điền tên và số điện thoại");
    }

    if (!isPhoneValid(form.phone)) {
      return toast.error("Số điện thoại phải là 9-12 chữ số");
    }

    if (form.email && !isEmailValid(form.email)) {
      return toast.error("Địa chỉ email không hợp lệ");
    }

    if (isDuplicate(form, editingTenant?.id)) {
      return toast.error("Tên/Email/Số điện thoại đã tồn tại");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clients/${editingTenant.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Cập nhật thất bại");
      }
      toast.success("Cập nhật thành công");
      setEditingTenant(null);
      setForm(emptyForm);
      fetchTenants();
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  }

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* HEADER ĐỒNG BỘ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khách thuê</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý thông tin và tài khoản của cư dân trong hệ thống
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <Plus size={16} />
          Thêm khách mới
        </button>
      </div>

      {/* THANH TÌM KIẾM CHUYÊN NGHIỆP */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* DANH SÁCH BẢNG KHÁCH THUÊ */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <User size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm font-medium">Không tìm thấy khách thuê nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Khách thuê</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                        {t.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-700">{t.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.email || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{t.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          <Edit size={12} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="flex items-center justify-center w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddModal && (
        <Modal
          title="Thêm khách thuê mới"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          form={form}
          setForm={setForm}
          submitText="Thêm khách"
          isCreate={true}
        />
      )}

      {editingTenant && (
        <Modal
          title="Chỉnh sửa thông tin khách"
          onClose={() => setEditingTenant(null)}
          onSubmit={handleUpdate}
          form={form}
          setForm={setForm}
          submitText="Lưu thay đổi"
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, form, setForm, isCreate, submitText }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-5 shadow-xl border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-slate-400" />
            </div>
            <input
              placeholder="Họ và tên"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={16} className="text-slate-400" />
            </div>
            <input
              placeholder="Địa chỉ Email"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={16} className="text-slate-400" />
            </div>
            <input
              placeholder="Số điện thoại"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {isCreate && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="Mật khẩu tài khoản"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            {submitText || "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}