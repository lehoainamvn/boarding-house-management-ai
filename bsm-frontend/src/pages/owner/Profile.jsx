import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "../../api/profile.api";
import { User, Mail, Phone, Save, ShieldCheck, BadgeCheck } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Ref để chặn việc gọi API 2 lần trong Strict Mode
  const isFetched = useRef(false);

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

  const role = profile ? (roleMap[profile.role] || roleMap.TENANT) : roleMap.TENANT;

  /* ================= LOAD PROFILE ================= */
  async function fetchProfile() {
    try {
      // Sử dụng toast.promise để thông báo trạng thái tải dữ liệu
      const data = await toast.promise(
        getProfile(),
        {
          loading: "Đang tải thông tin...",
          success: "Tải thông tin thành công",
          error: "Không tải được thông tin cá nhân"
        }
      );

      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || ""
      });

      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Nếu đã gọi API rồi thì không gọi lại nữa (Fix lỗi double-toast)
    if (isFetched.current) return;
    isFetched.current = true;

    fetchProfile();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  /* ================= UPDATE PROFILE ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Tên không được để trống");
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (form.phone && !phoneRegex.test(form.phone)) {
      toast.error("Số điện thoại không đúng định dạng!");
      return;
    }

    try {
      setSaving(true);

      await toast.promise(
        updateProfile({
          name: form.name.trim(),
          phone: form.phone
        }),
        {
          loading: "Đang cập nhật thông tin...",
          success: "Cập nhật thông tin thành công",
          error: (err) => err.message || "Cập nhật thất bại"
        }
      );

      const newProfile = {
        ...profile,
        name: form.name.trim(),
        phone: form.phone
      };

      setProfile(newProfile);
      localStorage.setItem("user", JSON.stringify(newProfile));

      // Gửi event để các component khác (như Sidebar/Header) cập nhật lại tên hiển thị
      window.dispatchEvent(new Event("user-updated"));
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setSaving(false);
    }
  }

  /* ================= LOADING UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Đang tải hồ sơ...</p>
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
            Hồ sơ cá nhân
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Quản lý và cập nhật thông tin tài khoản cá nhân
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* LEFT SIDEBAR: AVATAR & ROLE */}
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

              <span className={`mt-3 text-[11px] font-bold px-3 py-1 rounded-full border ${role.style}`}>
                {role.label}
              </span>
            </div>

            {/* RIGHT SIDE: FORM EDIT */}
            <div className="md:col-span-8 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* NAME INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Họ và tên
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* EMAIL INPUT (READ-ONLY) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Địa chỉ Email
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      value={form.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-xl cursor-not-allowed text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium ml-1">Email được dùng để đăng nhập và không thể thay đổi.</p>
                </div>

                {/* PHONE INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="090xxxxxxx"
                      className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
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