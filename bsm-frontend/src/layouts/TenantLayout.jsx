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
  Lock,
  Settings,
  ChevronDown,
  Bell,         
  CheckCheck,  
  X,
  Trash2, 
  Shield
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
    { label: "Nội quy", path: "/tenant/rules", icon: Shield },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-68 bg-white border-r border-slate-100 flex flex-col shadow-sm">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
      
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
            
            {/* NOTIFICATION DROP-DOWN */}
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
                    <div className="flex gap-3">
                      <span onClick={markAsReadAll} className="text-[11px] text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 uppercase tracking-tighter">Đọc tất cả</span>
                      <span onClick={clearAllNotifications} className="text-[11px] text-rose-600 font-bold cursor-pointer hover:text-rose-700 uppercase tracking-tighter">Xóa tất cả</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-indigo-50/20' : ''}`}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className={`text-[10px] uppercase font-bold mb-0.5 ${!n.is_read ? 'text-indigo-600' : 'text-slate-400'}`}>{n.title || "Thông báo"}</p>
                              <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.content}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>}
                              <button 
                                onClick={(e) => deleteNotification(n.id, e)} 
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-rose-500 rounded transition-all"
                                title="Xóa thông báo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
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

            {/* USER PROFILE BUTTON */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setOpenUserMenu(!openUserMenu)} className={`flex items-center gap-3 p-1.5 rounded-xl border border-slate-100 transition-all ${openUserMenu ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"}`}>
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
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <button onClick={() => { navigate("/tenant/profile"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
                      <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
                    </button>
                    <button onClick={() => { navigate("/tenant/change-password"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
                      <Lock size={16} className="text-slate-400" /> Đổi mật khẩu
                    </button>
                    <button onClick={() => { navigate("/tenant/settings"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
                      <Settings size={16} className="text-slate-400" /> Cài đặt chung
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 text-rose-600 text-sm font-bold border-t border-slate-50">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </main>
      </div>

      {/* MODAL THÔNG BÁO CHUẨN PROFESSIONAL (ĐÃ ĐỒNG BỘ) */}
      {showAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Lớp phủ mờ (Overlay) */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all duration-300" 
            onClick={() => setShowAllModal(false)}
          ></div>
          
          {/* Thân Modal */}
          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
            
            {/* Header chuyên nghiệp */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thông báo</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Bạn đang có <span className="text-indigo-600 font-semibold">{unreadCount}</span> thông báo mới
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={markAsReadAll} 
                  className="p-2.5 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck size={16} />
                  <span className="hidden sm:inline">Đã đọc tất cả</span>
                </button>
                <button 
                  onClick={clearAllNotifications} 
                  className="p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Xóa toàn bộ thông báo"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Xóa tất cả</span>
                </button>
                <button 
                  onClick={() => setShowAllModal(false)} 
                  className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Nội dung danh sách thông báo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Bell size={40} className="stroke-slate-300 mb-3" />
                  <p className="font-medium text-sm">Hộp thư thông báo trống.</p>
                </div>
              ) : (
                notifications.map(n => {
                  const isRead = n.is_read;
                  const isInvoice = n.title?.toLowerCase().includes("hóa đơn");
                  
                  return (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer group border ${
                        !isRead 
                          ? 'bg-white border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200' 
                          : 'bg-white/70 border-transparent hover:bg-white hover:border-slate-100'
                      }`}
                    >
                      {/* Icon được bọc màu Pastel */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        !isRead 
                          ? (isInvoice ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600')
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isInvoice ? <Receipt size={18} /> : <MessageSquare size={18} />}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm ${!isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                {n.title || "Thông báo"}
                              </h4>
                              {!isRead && (
                                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">MỚI</span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 line-clamp-2 leading-relaxed ${!isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                              {n.content}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs font-medium text-slate-400">
                              {n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'Vừa xong'}
                            </span>
                            <button 
                              onClick={(e) => deleteNotification(n.id, e)} 
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-100 text-rose-500 rounded-lg transition-all ml-1"
                              title="Xóa thông báo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer chân modal */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Auto-refresh real-time</span>
              <button 
                onClick={() => setShowAllModal(false)} 
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 hover:shadow-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <TenantAIChatBox />
    </div>
  );
}