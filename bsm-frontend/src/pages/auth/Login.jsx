import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLoginApi } from "../../api/auth.api";
import toast from "react-hot-toast";
import { Phone, Lock } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout"; 
import Captcha from "../../components/common/Captcha";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const captchaRef = useRef(); // Dùng ref để điều khiển captcha từ bên ngoài

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false); // Lưu trạng thái đúng/sai của captcha

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "OWNER") navigate("/home", { replace: true });
      else if (user.role === "TENANT") navigate("/tenant/home", { replace: true });
    }
  }, [navigate]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    // Kiểm tra captcha
    if (!isCaptchaValid) {
      toast.error("Captcha không đúng");
      captchaRef.current?.refresh(); // Tự động làm mới captcha khi nhập sai
      return;
    }

    try {
      setLoading(true);
      const data = await login({ phone, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        if (data.user.role === "OWNER") navigate("/home", { replace: true });
        else if (data.user.role === "TENANT") navigate("/tenant/home", { replace: true });
      }, 600);

    } catch (err) {
      toast.error(err?.message || "Sai số điện thoại hoặc mật khẩu");
      captchaRef.current?.refresh(); // Làm mới captcha khi call API thất bại
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN HANDLER ================= */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await googleLoginApi(credentialResponse.credential);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập Google thành công!");

      setTimeout(() => {
        if (data.user.role === "OWNER") navigate("/home", { replace: true });
        else if (data.user.role === "TENANT") navigate("/tenant/home", { replace: true });
      }, 600);
      
    } catch (err) {
      toast.error(err?.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Đăng nhập Google thất bại");
  };

  return (
    <AuthLayout>
      {/* HEADER */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Chào mừng trở lại!</h2>
        <p className="text-xs font-medium text-slate-500">Vui lòng nhập thông tin để truy cập vào hệ thống</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PHONE INPUT */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400"><Phone size={16} /></div>
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
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400"><Lock size={16} /></div>
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
              <span>Đang đăng nhập...</span>
            </div>
          ) : "Đăng nhập"}
        </button>
      </form>

      {/* DIVIDER */}
      <div className="flex items-center space-x-3 my-4">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-xs font-medium text-slate-400">Hoặc</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* GOOGLE LOGIN */}
      <div className="flex justify-center w-full mb-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          theme="outline"
          size="large"
        />
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-xs font-medium pt-2">
        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold">Tạo tài khoản mới</Link>
        <Link to="/forgot" className="text-slate-500 hover:text-indigo-600 transition-colors">Quên mật khẩu?</Link>
      </div>
    </AuthLayout>
  );
}