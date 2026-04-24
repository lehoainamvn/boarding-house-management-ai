import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Home,
  DoorOpen,
  Users,
  Receipt,
  Zap,
  BarChart3,
  MessageSquare,
  Brain
} from "lucide-react";

import AIChatBox from "../components/chat/AIChatBox";
import Sidebar from "../components/layout/Sidebar";
import UserMenu from "../components/layout/UserMenu";
import NotificationMenu from "../components/layout/NotificationMenu";
import NotificationModal from "../components/layout/NotificationModal";
import { useNotifications } from "../hooks/useNotifications";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false); 

  const [user, setUser] = useState({ id: null, name: "Chủ trọ", email: "" });
  
  const { 
    notifications, 
    unreadCount, 
    markReadAll, 
    deleteNotify, 
    clearAll, 
    markRead 
  } = useNotifications(user.id);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
    if (savedUser) {
      setUser({ 
        id: savedUser.id, 
        name: savedUser.name || "Chủ trọ", 
        email: savedUser.email || "" 
      });
    }
  }, []);

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

  const handleNotificationClick = (notification) => {
    markRead(notification);
    if (notification.title === "Tin nhắn mới") {
      navigate("/messages");
    } else if (notification.title?.toLowerCase().includes("hóa đơn")) {
      navigate("/invoices");
    }
    setOpenNotify(false);
    setShowAllModal(false);
  };

  const menu = [
    { label: "Dashboard", path: "/home", icon: Home },
    { label: "Phòng trọ", path: "/rooms", icon: DoorOpen },
    { label: "Khách thuê", path: "/tenants", icon: Users },
    { label: "Hóa đơn", path: "/invoices", icon: Receipt },
    { label: "Điện nước", path: "/meters", icon: Zap },
    { label: "Thống kê", path: "/revenue", icon: BarChart3 },
    { label: "Tin nhắn", path: "/messages", icon: MessageSquare },
    { label: "AI Prediction", path: "/prediction", icon: Brain }
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans text-slate-900">
      <Sidebar 
        menu={menu} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        handleLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm relative z-10">
          <div className="hidden sm:block text-xs font-medium text-slate-400 uppercase tracking-widest">
            Hệ thống quản lý nhà trọ thông minh
          </div>

          <div className="flex items-center gap-4">
            <NotificationMenu 
              notifications={notifications}
              unreadCount={unreadCount}
              openNotify={openNotify}
              setOpenNotify={setOpenNotify}
              notifyRef={notifyRef}
              markReadAll={markReadAll}
              clearAll={clearAll}
              deleteNotify={deleteNotify}
              handleNotificationClick={handleNotificationClick}
              setShowAllModal={setShowAllModal}
            />

            <UserMenu 
              user={user}
              openUserMenu={openUserMenu}
              setOpenUserMenu={setOpenUserMenu}
              userMenuRef={userMenuRef}
              handleLogout={handleLogout}
              navigate={navigate}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationModal 
        show={showAllModal}
        onClose={() => setShowAllModal(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        markReadAll={markReadAll}
        clearAll={clearAll}
        deleteNotify={deleteNotify}
        handleNotificationClick={handleNotificationClick}
      />

      <AIChatBox />
    </div>
  );
}