import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import TenantAIChatBox from "../components/TenantAIChatBox";

import { 
  LayoutDashboard, 
  Home, 
  DoorClosed, 
  Receipt, 
  BarChart3, 
  MessageSquare, 
  LogOut, 
  User, 
  Key,
  ChevronDown
} from "lucide-react";

export default function TenantLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [user, setUser] = useState({
    name: "Khách thuê",
    email: ""
  });

  const [openUserMenu, setOpenUserMenu] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
    if (saved) {
      setUser({
        name: saved.name || "Khách thuê",
        email: saved.email || ""
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  // Chuyển đổi emoji sang Lucide Icons sang xịn mịn
  const menu = [
    { label: "Trang chủ", path: "/tenant/home", icon: Home },
    { label: "Phòng của tôi", path: "/tenant/room", icon: DoorClosed },
    { label: "Hóa đơn", path: "/tenant/invoices", icon: Receipt },
    { label: "Thống kê", path: "/tenant/statistics", icon: BarChart3 },
    { label: "Tin nhắn", path: "/tenant/messages", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-68 bg-white border-r border-slate-100 flex flex-col shadow-sm">

        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
             <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-base">Tenant Portal</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} className="transition-colors group-hover:text-indigo-600 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm shadow-slate-100/50 relative z-10">

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <h1 className="font-bold text-slate-800 text-sm md:text-base">
              Hệ thống quản lý phòng trọ
            </h1>
          </div>

          {/* USER PROFILE */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className={`flex items-center gap-3 p-1.5 rounded-xl border border-slate-100 transition-all ${
                openUserMenu ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="text-right text-sm hidden md:block">
                <p className="font-bold text-slate-800 leading-tight">
                  {user.name}
                </p>
                <p className="text-slate-400 text-xs truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>

              <ChevronDown size={14} className={`text-slate-400 hidden md:block transition-transform duration-200 ${openUserMenu ? "rotate-180" : ""}`} />
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                
                <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                  <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => { navigate("/tenant/profile"); setOpenUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                >
                  <User size={16} className="text-slate-400" />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => { navigate("/tenant/change-password"); setOpenUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                >
                  <Key size={16} className="text-slate-400" />
                  Đổi mật khẩu
                </button>

                <div className="border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-rose-50 text-rose-600 text-sm font-bold transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>

              </div>
            )}
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 bg-slate-50/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
      
      <TenantAIChatBox />
    </div>
  );
}