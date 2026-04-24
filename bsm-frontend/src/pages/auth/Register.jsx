import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, UserCircle, Home } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout"; // <-- Import Layout dùng chung
import Captcha from "../../components/common/Captcha";

export default function Register() {
  const navigate = useNavigate();
  const captchaRef = useRef(); // Ref để điều khiển Captcha

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "OWNER"
  });

  const [loading, setLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false); // State lưu trạng thái đúng/sai của captcha

  /* ================= FORM CHANGE ================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  /* ================= VALIDATE ================= */
  function validate() {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return false;
    }

    if (form.name.trim().length < 3) {
      toast.error("Tên phải tối thiểu 3 ký tự");
      return false;
    }

    if (!form.phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!/^[0-9]+$/.test(form.phone)) {
      toast.error("Số điện thoại chỉ được chứa số");
      return false;
    }

    if (form.phone.length < 10 || form.phone.length > 11) {
      toast.error("Số điện thoại phải từ 10 - 11 số");
      return false;
    }

    if (!form.email) {
      toast.error("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Email không hợp lệ");
      return false;
    }

    if (!form.password) {
      toast.error("Vui lòng nhập mật khẩu");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return false;
    }

    // Kiểm tra Captcha đã tách
    if (!isCaptchaValid) {
      toast.error("Captcha không đúng");
      captchaRef.current?.refresh(); // Tự động đổi mã mới khi gõ sai
      return false;
    }

    return true;
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await toast.promise(
        registerApi({
          name: form.name.trim(),
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: form.role
        }),
        {
          loading: "Đang đăng ký...",
          success: "Đăng ký thành công",
          error: "Đăng ký thất bại"
        }
      );

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (err) {
      toast.error(err?.message || "Đăng ký thất bại");
      captchaRef.current?.refresh(); // Làm mới captcha nếu API lỗi
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {/* HEADER CỦA FORM */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Tạo tài khoản mới
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Thiết lập tài khoản của bạn chỉ trong vài phút
        </p>
      </div>

      {/* ROLE SELECTOR */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Bạn tham gia với tư cách?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "OWNER" })}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              form.role === "OWNER"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Home size={18} className={form.role === "OWNER" ? "text-indigo-600" : "text-slate-400"} />
            <span className="text-sm">Chủ trọ</span>
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, role: "TENANT" })}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              form.role === "TENANT"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserCircle size={18} className={form.role === "TENANT" ? "text-indigo-600" : "text-slate-400"} />
            <span className="text-sm">Người thuê</span>
          </button>
        </div>
      </div>

      {/* FORM INPUTS */}
      <form onSubmit={handleSubmit} className="space-y-3.5">

        {/* NAME */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <User size={16} />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={form.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* PHONE */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Phone size={16} />
          </div>
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* EMAIL */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Mail size={16} />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Địa chỉ Email"
            value={form.email}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* PASSWORD */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Lock size={16} />
          </div>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={form.password}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Lock size={16} />
          </div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* CAPTCHA COMPONENT */}
        <Captcha ref={captchaRef} onVerify={setIsCaptchaValid} />

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-500/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Đăng ký ngay"
          )}
        </button>

      </form>

      {/* FOOTER LINK */}
      <p className="text-xs font-medium text-center text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-bold">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthLayout>
  );
}