import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null);

  /* ===== USER (GIỮ NGUYÊN) ===== */
  const [user, setUser] = useState({
    name: "Chủ trọ",
    email: "owner@thunam.local",
  });

  /* ===== UI STATE (GIỮ NGUYÊN) ===== */
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /* ===== MOCK DATA (GIỮ NGUYÊN) ===== */
  const notifications = [
    { id: 1, text: "Phòng A101 đã gửi yêu cầu sửa chữa" },
    { id: 2, text: "Hóa đơn tháng 02 chưa thanh toán" },
    { id: 3, text: "Khách thuê B203 gửi tin nhắn" },
  ];

  /* ===== LOAD USER BAN ĐẦU (GIỮ NGUYÊN) ===== */
  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("profile"));

    if (savedUser) {
      setUser({
        name: savedUser.name || "Chủ trọ",
        email: savedUser.email || "",
      });
    }
  }, []);

  /* ===== 🔥 ADD: LISTEN USER UPDATE ===== */
  useEffect(() => {
    function handleUserUpdated() {
      const savedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("profile"));

      if (savedUser) {
        setUser({
          name: savedUser.name || "Chủ trọ",
          email: savedUser.email || "",
        });
      }
    }

    window.addEventListener("user-updated", handleUserUpdated);
    return () =>
      window.removeEventListener("user-updated", handleUserUpdated);
  }, []);
  /* ===== END ADD ===== */

  /* ===== CLICK OUTSIDE (GIỮ NGUYÊN) ===== */
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }

      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const mainMenu = [
    { label: "Trang chủ", path: "/home" },
    { label: "Phòng trọ", path: "/rooms" },
    { label: "Khách thuê", path: "/tenants" },
    { label: "Hóa đơn", path: "/invoices" },
    { label: "Điện nước", path: "/meters" },
    { label: "Thống kê", path: "/revenue" },
  ];

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-slate-900" : "bg-slate-100"}`}>
      {/* ===== SIDEBAR ===== */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 text-xl font-extrabold border-b border-white/10">
          Nam Rental
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {mainMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-5 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : "text-slate-300 hover:bg-white/10"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500 hover:bg-rose-600 py-2.5 rounded-xl font-semibold"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col">
        {/* ===== HEADER ===== */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 relative">
          <h1 className="font-semibold text-slate-700">
            Hệ thống quản lý nhà trọ Nam Rental
          </h1>

          <div className="flex items-center gap-5">
            {/* ===== DARK MODE ===== */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>

            {/* ===== NOTIFICATION ===== */}
            <div className="relative" ref={notifyRef}>
              <button
                onClick={() => setOpenNotify(!openNotify)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 relative"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {openNotify && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 font-semibold border-b">
                    Thông báo
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-slate-50 text-sm border-b"
                    >
                      {n.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== USER MENU (GIỮ NGUYÊN) ===== */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-3"
              >
                <div className="text-right text-sm">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-slate-400">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50"
                  >
                    Chỉnh sửa thông tin
                  </button>

                  <button
                    onClick={() => navigate("/change-password")}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50"
                  >
                    Đổi mật khẩu
                  </button>

                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50"
                  >
                    Quên mật khẩu
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
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
