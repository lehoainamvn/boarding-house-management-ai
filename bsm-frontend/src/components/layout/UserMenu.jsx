import { User, Lock, Settings, LogOut, ChevronDown } from "lucide-react";

export default function UserMenu({ user, openUserMenu, setOpenUserMenu, userMenuRef, handleLogout, navigate, isTenant = false }) {
  const profilePath = isTenant ? "/tenant/profile" : "/profile";
  const passwordPath = isTenant ? "/tenant/change-password" : "/change-password";
  const settingsPath = isTenant ? "/tenant/settings" : "/settings";

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setOpenUserMenu(!openUserMenu)}
        className={`flex items-center gap-3 p-1.5 rounded-xl border border-slate-100 transition-all ${
          openUserMenu ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left text-sm hidden md:block pr-1">
          <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
          <p className="text-slate-400 text-[10px] truncate max-w-[100px]">{user.email}</p>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openUserMenu ? "rotate-180" : ""}`} />
      </button>

      {openUserMenu && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => { navigate(profilePath); setOpenUserMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors"
          >
            <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => { navigate(passwordPath); setOpenUserMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors"
          >
            <Lock size={16} className="text-slate-400" /> Đổi mật khẩu
          </button>
          {!isTenant && (
            <button
              onClick={() => { navigate(settingsPath); setOpenUserMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors"
            >
              <Settings size={16} className="text-slate-400" /> Cài đặt chung
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 text-rose-600 text-sm font-bold border-t border-slate-50"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
