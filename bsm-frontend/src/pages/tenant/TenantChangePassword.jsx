import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../api/user.api";
import { getProfile } from "../../api/profile.api";
import { Lock, KeyRound, ShieldCheck, BadgeCheck, Save, X } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      toast.error(err.message || "Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải tối thiểu 6 ký tự");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setSaving(true);

      await toast.promise(
        changePassword({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        }),
        {
          loading: "Đang xử lý đổi mật khẩu...",
          success: "Đổi mật khẩu thành công",
          error: (err) => err?.message || "Đổi mật khẩu thất bại"
        }
      );

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  /* ================= LOADING SKELETON ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-indigo-50/30 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Bảo mật tài khoản
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </p>
        </div>

        {/* MAIN CARD CHIA 2 CỐT */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* LEFT: PROFILE SIDEBAR (4 CỘT) */}
            <div className="md:col-span-4 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200/60 p-8 flex flex-col items-center justify-center text-center">

              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                  <ShieldCheck size={16} className="text-indigo-600" />
                </div>
              </div>

              <p className="font-bold text-slate-800 text-base flex items-center gap-1 justify-center">
                {profile?.name || "Người dùng"}
                <BadgeCheck size={16} className="text-blue-500" fill="currentColor" />
              </p>

              <p className="text-xs font-medium text-slate-400 mt-0.5 max-w-full truncate">
                {profile?.email}
              </p>

              <span className="mt-3 text-[11px] font-bold px-3 py-1 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-100">
                Người thuê trọ
              </span>
            </div>

            {/* RIGHT: FORM ĐỔI MẬT KHẨU (8 CỘT) */}
            <div className="md:col-span-8 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* MẬT KHẨU CŨ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      name="oldPassword"
                      value={form.oldPassword}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* MẬT KHẨU MỚI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* XÁC NHẬN MẬT KHẨU MỚI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <X size={16} />
                    <span>Hủy</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2 shadow-sm shadow-indigo-500/10 transition-all disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Đang xử lý..." : "Đổi mật khẩu"}
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