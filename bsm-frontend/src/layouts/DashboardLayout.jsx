import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import {
  LayoutDashboard,
  Home,
  DoorOpen,
  Users,
  Receipt,
  Zap,
  BarChart3,
  MessageSquare,
  Brain,
  Bell,
  Menu,
  Lock,
  LogOut,
  User,
  Key,
  ChevronDown,
  X,
  CheckCheck,
  Trash2,
  Settings,
  Shield
} from "lucide-react";

import AIChatBox from "../components/AIChatBox";

const socket = io("http://localhost:5000");

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false); 

  const [user, setUser] = useState({ id: null, name: "Chủ trọ", email: "" });
  const [notifications, setNotifications] = useState([]);

  // 1. Lấy danh sách thông báo
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

  useEffect(() => {
    fetchNotifications();
    const savedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
    if (savedUser) {
      setUser({ id: savedUser.id, name: savedUser.name || "Chủ trọ", email: savedUser.email || "" });
      socket.emit("join_room", `user_${savedUser.id}`);
      
      socket.on("new_notification", (newNotify) => {
        setNotifications(prev => [newNotify, ...prev]);
        toast.success(newNotify.title || "Thông báo mới!", { icon: '🔔' });
      });
    }
    return () => socket.off("new_notification");
  }, []);

  // 2. Đánh dấu tất cả đã đọc
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

  // 3. Xóa 1 thông báo
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
      toast.error("Lỗi hệ thống");
    }
  };

  // 4. Xóa tất cả thông báo
  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications/clear-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications([]);
        toast.success("Đã xóa toàn bộ thông báo");
      } else {
        toast.error("Không thể xóa thông báo");
      }
    } catch (error) {
      console.error("Lỗi xóa tất cả thông báo:", error);
      toast.error("Lỗi hệ thống");
    }
  };

  // 5. Xử lý khi click vào thông báo
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
      navigate("/messages");
    } else if (notification.title?.toLowerCase().includes("hóa đơn")) {
      navigate("/invoices");
    }
    
    setOpenNotify(false);
    setShowAllModal(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
      if (notifyRef.current && !notifyRef.current.contains(e.target)) setOpenNotify(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menu = [
    { label: "Dashboard", path: "/home", icon: Home },
    { label: "Phòng trọ", path: "/rooms", icon: DoorOpen },
    { label: "Khách thuê", path: "/tenants", icon: Users },
    { label: "Hóa đơn", path: "/invoices", icon: Receipt },
    { label: "Điện nước", path: "/meters", icon: Zap },
    { label: "Thống kê", path: "/revenue", icon: BarChart3 },
    { label: "Tin nhắn", path: "/messages", icon: MessageSquare },
    { label: "Nội quy", path: "/rules", icon: Shield },
    { label: "AI Prediction", path: "/prediction", icon: Brain }
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-100 transition-all duration-300 flex flex-col shadow-sm`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-bold text-slate-800">
            
            {sidebarOpen && <span className="tracking-tight text-base">BSM Manager</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <Icon size={18} className="transition-colors group-hover:text-indigo-600 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className={`w-full flex items-center ${sidebarOpen ? "justify-start px-3.5" : "justify-center"} gap-3 text-rose-600 hover:bg-rose-50 py-2.5 rounded-xl text-sm font-semibold transition-colors`}>
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm relative z-10">
          <div className="hidden sm:block text-xs font-medium text-slate-400">Hệ thống quản lý nhà trọ thông minh</div>

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
                {/* Đã sửa thành rounded-full tại đây để tạo ảnh đại diện hình tròn */}
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
                    <button onClick={() => { navigate("/profile"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
                      <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
                    </button>
                    <button onClick={() => { navigate("/change-password"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
                      <Lock size={16} className="text-slate-400" /> Đổi mật khẩu
                    </button>
                    <button onClick={() => { navigate("/settings"); setOpenUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 text-sm text-slate-700 font-semibold transition-colors">
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

      {/* MODAL FACEBOOK STYLE (XEM TẤT CẢ) */}
     {/* MODAL THÔNG BÁO CHUẨN PROFESSIONAL */}
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

      <AIChatBox />
    </div>
  );
}