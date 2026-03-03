import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function TenantLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [user, setUser] = useState({
    name: "",
    email: ""
  });

  const [openUserMenu, setOpenUserMenu] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) setUser(saved);
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

  const menu = [
    { label: "Trang chủ", path: "/tenant/home", icon: "🏠" },
    { label: "Phòng của tôi", path: "/tenant/room", icon: "🛏" },
    { label: "Hóa đơn", path: "/tenant/invoices", icon: "🧾" },
    { label: "Liên hệ chủ trọ", path: "/tenant/contact", icon: "💬" }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-md flex flex-col">

        <div className="h-16 flex items-center px-6 text-xl font-bold border-b bg-white">
          Tenant Portal
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500 hover:bg-rose-600
                       text-white py-2.5 rounded-xl font-semibold transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-16 bg-slate-50 border-b flex items-center justify-between px-8">

          <h1 className="font-semibold text-slate-700">
            Hệ thống quản lý phòng trọ
          </h1>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-3"
            >
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-800">
                  {user.name}
                </p>
                <p className="text-slate-400 text-xs">
                  {user.email}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            </button>

            {openUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50">

                <button
                  onClick={() => navigate("/tenant/profile")}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                >
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => navigate("/tenant/change-password")}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                >
                  Đổi mật khẩu
                </button>

                <div className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-rose-50 text-rose-600 font-semibold"
                  >
                    Đăng xuất
                  </button>
                </div>

              </div>
            )}
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 bg-slate-100 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6 min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}