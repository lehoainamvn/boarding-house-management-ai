import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, RefreshCw, CheckCircle2, UserCircle, Home } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "OWNER"
  });

  const [loading, setLoading] = useState(false);

  /* ================= CAPTCHA ================= */
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    setNum1(a);
    setNum2(b);
    setCaptchaAnswer("");
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  /* ================= FORM ================= */
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

    if (Number(captchaAnswer) !== num1 + num2) {
      toast.error("Captcha không đúng");
      generateCaptcha();
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 flex items-center justify-center p-4 md:p-6 font-sans">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-indigo-100/40 overflow-hidden grid md:grid-cols-12 min-h-[650px]">

        {/* LEFT PANEL - GRADIENT & BACKGROUND GLOW */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Bắt đầu miễn phí</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              BSM Management
            </h1>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
              Trở thành một phần của hệ sinh thái quản lý nhà trọ hiện đại, tinh gọn và chuyên nghiệp nhất.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              "Khởi tạo tài khoản nhanh chóng",
              "Bảo mật thông tin tuyệt đối",
              "Phù hợp cho cả chủ nhà & khách thuê"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm font-medium text-indigo-100">
                <CheckCircle2 size={16} className="text-indigo-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-xs text-indigo-300 font-medium">
            © 2026 BSM. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - FORM ĐĂNG KÝ */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center space-y-6">

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

            {/* CAPTCHA - SOFT GLASS BOX */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-indigo-600 bg-white border border-slate-100 shadow-sm px-2.5 py-1.5 rounded-lg">
                  {num1} + {num2} = ?
                </div>
                
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm"
                  title="Đổi mã khác"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <input
                type="number"
                placeholder="Kết quả"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-24 border border-slate-200 px-3 py-2 text-sm text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                required
              />
            </div>

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

        </div>
      </div>
    </div>
  );
}