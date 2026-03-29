import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import toast from "react-hot-toast";
import { Phone, Lock, RefreshCw, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= CAPTCHA ================= */
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setNum1(a);
    setNum2(b);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "OWNER") {
        navigate("/home", { replace: true });
      } else if (user.role === "TENANT") {
        navigate("/tenant/home", { replace: true });
      }
    }
  }, [navigate]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    if (Number(captchaAnswer) !== num1 + num2) {
      toast.error("Captcha không đúng");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);

      const data = await login({ phone, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        if (data.user.role === "OWNER") {
          navigate("/home", { replace: true });
        } else if (data.user.role === "TENANT") {
          navigate("/tenant/home", { replace: true });
        }
      }, 600);

    } catch (err) {
      toast.error(err?.message || "Sai số điện thoại hoặc mật khẩu");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 flex items-center justify-center p-4 md:p-6 font-sans">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-indigo-100/40 overflow-hidden grid md:grid-cols-12 min-h-[600px]">

        {/* LEFT PANEL - NÂNG CẤP GRADIENT & HIỆU ỨNG GLOW */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Decorative background shapes */}
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Hệ Thống Quản Lý</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              BSM Management
            </h1>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
              Giải pháp vận hành và quản lý nhà trọ, căn hộ dịch vụ tự động, chuyên nghiệp hàng đầu.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              "Quản lý phòng & khách thuê",
              "Theo dõi hóa đơn thông minh",
              "Thống kê doanh thu trực quan",
              "Gửi hóa đơn qua Zalo tiện lợi"
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

        {/* RIGHT PANEL - FORM ĐĂNG NHẬP */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-7">

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Chào mừng trở lại!
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Vui lòng nhập thông tin để truy cập vào hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* PHONE INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Số điện thoại
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Phone size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* CAPTCHA - LÀM MỚI THEO STYLE SOFT GLASS */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 space-y-2">
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                Xác minh bảo mật
              </p>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-base font-bold text-indigo-600 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-lg">
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
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* FOOTER LINKS */}
          <div className="flex justify-between items-center text-xs font-medium pt-2">
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Tạo tài khoản mới
            </Link>

            <Link
              to="/forgot"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}