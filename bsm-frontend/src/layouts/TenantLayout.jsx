import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import TenantAIChatBox from "../components/TenantAIChatBox";
import toast from "react-hot-toast"; 
import { io } from "socket.io-client"; 

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
  ChevronDown,
  Bell,         
  CheckCheck,  
  X,
  Trash2, 
  ArrowRight
} from "lucide-react";

const socket = io("http://localhost:5000");

export default function TenantLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null); 

  const [user, setUser] = useState({ id: null, name: "Khách thuê", email: "" });
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false); 
  const [notifications, setNotifications] = useState([]);

  // 🔥 ĐÃ FIX 1 & 3: Đưa fetch vào trong useEffect để tránh re-render vô hạn và dọn dẹp socket triệt để
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();

    const saved = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
    if (saved) {
      setUser({
        id: saved.id,
        name: saved.name || "Khách thuê",
        email: saved.email || ""
      });

      socket.emit("join_room", `user_${saved.id}`);
      
      socket.on("new_notification", (newNotify) => {
        setNotifications(prev => [newNotify, ...prev]);
        toast.success(newNotify.title || "Thông báo mới!", { icon: '🔔' });
      });
    }

    // Dọn dẹp cả 2 sự kiện socket khi unmount
    return () => {
      socket.off("new_notification");
      socket.off("join_room");
    };
  }, []);

  const markAsReadAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        toast.success("Đã đánh dấu tất cả là đã đọc");
      }
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/notifications/${notification.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
          );
        }
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đọc:", error);
      }
    }

    if (notification.title === "Tin nhắn mới") {
      navigate("/tenant/messages");
    } else if (notification.title?.toLowerCase().includes("hóa đơn")) {
      navigate("/tenant/invoices");
    }
    
    setOpenNotify(false);
    setShowAllModal(false);
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation(); 
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Đã xóa thông báo");
      } else {
        toast.error("Không thể xóa thông báo");
      }
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
      toast.error("Đã có lỗi xảy ra");
    }
  };

  // 🔥 ĐÃ FIX 4: Không xóa "vội" ở state nếu API Backend bị lỗi
  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications([]);
        toast.success("Đã xóa tất cả thông báo");
      } else {
        toast.error("Không thể xóa thông báo trên Server");
      }
    } catch (error) {
      console.error("Lỗi xóa tất cả thông báo:", error);
      toast.error("Hệ thống đang bận, vui lòng thử lại!");
    }
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  const menu = [
    { label: "Trang chủ", path: "/tenant/home", icon: Home },
    { label: "Phòng của tôi", path: "/tenant/room", icon: DoorClosed },
    { label: "Hóa đơn", path: "/tenant/invoices", icon: Receipt },
    { label: "Thống kê", path: "/tenant/statistics", icon: BarChart3 },
    { label: "Tin nhắn", path: "/tenant/messages", icon: MessageSquare },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden text-slate-900">

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

          <div className="flex items-center gap-3">
            
            {/* BỘ THÔNG BÁO DROP-DOWN */}
            <div className="relative" ref={notifyRef}>
              <button
                onClick={() => setOpenNotify(!openNotify)}
                className={`w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center relative transition-all ${openNotify ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"}`}
              >
                <Bell size={18} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNotify && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="font-extrabold text-slate-800 text-sm">Thông báo</span>
                    <div className="flex gap-3 items-center">
                      <span onClick={clearAllNotifications} className="text-[11px] text-rose-500 font-bold cursor-pointer hover:text-rose-700 uppercase tracking-tighter">Xóa tất cả</span>
                      <span onClick={markAsReadAll} className="text-[11px] text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 uppercase tracking-tighter">Đọc tất cả</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-indigo-50/20' : ''}`}>
                          <div className="flex justify-between items-start gap-2 pr-6">
                            <div>
                                <p className={`text-[10px] uppercase font-bold mb-0.5 ${!n.is_read ? 'text-indigo-600' : 'text-slate-400'}`}>{n.title || "Thông báo"}</p>
                                <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.content}</p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>}
                          </div>
                          
                          <button
                            onClick={(e) => deleteNotification(n.id, e)}
                            className="absolute right-3 top-4 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa thông báo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="px-5 py-3 bg-slate-50/50 text-center border-t border-slate-50">
                    <button 
                      onClick={() => { setShowAllModal(true); setOpenNotify(false); }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                    >
                      XEM TẤT CẢ THÔNG BÁO
                    </button>
                  </div>
                </div>
              )}
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
                  <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[150px]">{user.email}</p>
                </div>

                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <ChevronDown size={14} className={`text-slate-400 hidden md:block transition-transform duration-200 ${openUserMenu ? "rotate-180" : ""}`} />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200 z-50">
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
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 bg-slate-50/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
      
      {/* MODAL FACEBOOK STYLE (XEM TẤT CẢ) */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAllModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Thông báo</h2>
                <p className="text-sm text-slate-500 font-medium">Bạn có {unreadCount} thông báo chưa đọc</p>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={clearAllNotifications} className="text-xs font-bold text-rose-500 hover:text-rose-700 p-3 transition-all" title="Xóa tất cả thông báo">
                  Xóa tất cả
                </button>
                <button onClick={markAsReadAll} className="p-3 hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-all" title="Đánh dấu tất cả đã đọc">
                  <CheckCheck size={22} />
                </button>
                <button onClick={() => setShowAllModal(false)} className="p-3 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-medium">Hộp thư thông báo trống.</div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-4 p-5 rounded-[1.5rem] transition-all cursor-pointer group shadow-sm relative ${!n.is_read ? 'bg-white border-l-4 border-l-indigo-500 hover:bg-indigo-50/30' : 'bg-white/60 hover:bg-white border-l-4 border-l-transparent'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${!n.is_read ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {n.title?.includes("hóa đơn") ? <Receipt size={20} /> : <MessageSquare size={20} />}
                    </div>
                    
                    <div className="flex-1 pr-6">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-[15px] ${!n.is_read ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-600'}`}>{n.title}</h4>
                        {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${!n.is_read ? 'text-slate-700' : 'text-slate-500'}`}>{n.content}</p>
                      
                      {/* 🔥 ĐÃ FIX 2: Thêm check Valid Date để phòng lỗi hiển thị */}
                      <span className="text-[11px] font-bold text-slate-400 mt-3 block uppercase tracking-widest">
                        {n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="absolute right-4 top-5 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa thông báo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 text-center">
                <button onClick={() => setShowAllModal(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}

      <TenantAIChatBox />
    </div>
  );
}