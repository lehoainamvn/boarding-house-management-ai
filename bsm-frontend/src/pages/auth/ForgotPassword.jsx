import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  forgotPasswordApi,
  resetPasswordApi
} from "../../api/auth.api";
import { Mail, Key, Lock, ArrowLeft, ShieldEllipsis } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout"; 

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

      // Reset form
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
    <AuthLayout>
      {/* HEADER CỦA FORM */}
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
    </AuthLayout>
  );
}