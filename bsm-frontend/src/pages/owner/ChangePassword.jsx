import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../api/user.api";
import { Lock, Save, Eye, EyeOff, ShieldCheck, User } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ================= ROLE MAP ================= */
  const roleMap = {
    OWNER: {
      label: "Chủ nhà",
      style: "bg-purple-50 text-purple-600 border-purple-100"
    },
    TENANT: {
      label: "Người thuê",
      style: "bg-indigo-50 text-indigo-600 border-indigo-100"
    }
  };

  const role = roleMap[user?.role] || roleMap.TENANT;

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải tối thiểu 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);

      await toast.promise(
        changePassword({
          oldPassword,
          newPassword
        }),
        {
          loading: "Đang đổi mật khẩu...",
          success: "Đổi mật khẩu thành công",
          error: "Đổi mật khẩu thất bại"
        }
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate(-1), 800);
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Đổi mật khẩu
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Cập nhật mật khẩu tài khoản của bạn để bảo mật tốt hơn
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all"
          >
            Quay lại
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* LEFT: USER PROFILE CARD */}
            <div className="md:col-span-4 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200/60 p-8 flex flex-col items-center justify-center text-center">
              
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                  <ShieldCheck size={16} className="text-indigo-600" />
                </div>
              </div>

              <p className="font-bold text-slate-800 text-base">
                {user?.name}
              </p>

              <p className="text-xs font-medium text-slate-400 mt-0.5 max-w-full truncate">
                {user?.email}
              </p>

              <span className={`mt-3 text-[11px] font-bold px-3 py-1 rounded-full border ${role.style}`}>
                {role.label}
              </span>
            </div>

            {/* RIGHT: FORM */}
            <div className="md:col-span-8 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* OLD PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Mật khẩu hiện tại
                  </label>
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Mật khẩu mới
                  </label>
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-1">Gợi ý: Mật khẩu nên có tối thiểu 6 ký tự.</p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Xác nhận mật khẩu
                  </label>
                  
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2 shadow-sm shadow-indigo-500/10 transition-all disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}