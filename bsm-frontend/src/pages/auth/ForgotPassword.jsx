import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  forgotPasswordApi,
  resetPasswordApi
} from "../../api/auth.api";
import { Mail, Key, Lock, CheckCircle2, ArrowLeft, ShieldEllipsis } from "lucide-react";

export default function ForgotPassword() {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Email không đúng định dạng");
    }

    try {
      setLoading(true);

      await forgotPasswordApi(email);

      toast.success("OTP đã được gửi về email");
      setStep(2);

    } catch (err) {
      toast.error(err.message || "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải tối thiểu 6 ký tự");
    }

    try {
      setLoading(true);

      await resetPasswordApi({
        email,
        otp,
        newPassword
      });

      toast.success("Đổi mật khẩu thành công");

      // reset form
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");

    } catch (err) {
      toast.error(err.message || "Khôi phục mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 flex items-center justify-center p-4 md:p-6 font-sans">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-indigo-100/40 overflow-hidden grid md:grid-cols-12 min-h-[550px]">

        {/* LEFT PANEL - ĐỒNG BỘ GRADIENT CAO CẤP */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Khôi phục tài khoản</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              BSM Management
            </h1>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
              Đừng lo lắng! Hãy thực hiện theo các bước xác minh để lấy lại quyền truy cập vào tài khoản của bạn.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              "Quản lý phòng & khách thuê",
              "Theo dõi hóa đơn thông minh",
              "Thống kê doanh thu trực quan",
              "Nhắc thanh toán tự động"
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

        {/* RIGHT PANEL - FORM XỬ LÝ */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <ShieldEllipsis size={24} className="text-indigo-600" />
               Quên mật khẩu?
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {step === 1 
                ? "Nhập email đã đăng ký để nhận mã xác thực OTP" 
                : "Nhập mã OTP vừa nhận và thiết lập lại mật khẩu mới"}
            </p>
          </div>

          {/* PROGRESS STEPS INDICATOR */}
          <div className="flex items-center gap-2 pb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`}></div>
          </div>

          {/* STEP 1: NHẬP EMAIL */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-500/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi mã...</span>
                  </div>
                ) : (
                  "Gửi mã OTP"
                )}
              </button>
            </div>
          )}

          {/* STEP 2: NHẬP OTP & NEW PASSWORD */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* OTP */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mã xác thực OTP
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Key size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập 6 số OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-500/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
              
              <button 
                onClick={() => setStep(1)}
                className="w-full text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Quay lại bước nhập Email
              </button>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-center text-xs font-medium pt-2">
            <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors font-bold">
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}