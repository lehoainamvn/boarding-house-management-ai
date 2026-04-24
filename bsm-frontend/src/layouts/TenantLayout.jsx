import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Home,
  DoorClosed,
  Receipt,
  BarChart3,
  MessageSquare,
  Shield
} from "lucide-react";

import TenantAIChatBox from "../components/chat/TenantAIChatBox";
import Sidebar from "../components/layout/Sidebar";
import UserMenu from "../components/layout/UserMenu";
import NotificationMenu from "../components/layout/NotificationMenu";
import NotificationModal from "../components/layout/NotificationModal";
import { useNotifications } from "../hooks/useNotifications";

export default function TenantLayout() {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null);

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  const [user, setUser] = useState({ id: null, name: "Khách thuê", email: "" });
  
  const { 
    notifications, 
    unreadCount, 
    markReadAll, 
    deleteNotify, 
    clearAll, 
    markRead 
  } = useNotifications(user.id);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
    if (saved) {
      setUser({
        id: saved.id,
        name: saved.name || "Khách thuê",
        email: saved.email || ""
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
    if (notification.title?.toLowerCase().includes("tin nhắn")) {
      navigate("/tenant/messages");
    } else if (notification.title?.toLowerCase().includes("hóa đơn")) {
      navigate("/tenant/invoices");
    }
    setOpenNotify(false);
    setShowAllModal(false);
  };

  const menu = [
    { label: "Trang chủ", path: "/tenant/home", icon: Home },
    { label: "Phòng của tôi", path: "/tenant/room", icon: DoorClosed },
    { label: "Hóa đơn", path: "/tenant/invoices", icon: Receipt },
    { label: "Thống kê", path: "/tenant/statistics", icon: BarChart3 },
    { label: "Tin nhắn", path: "/tenant/messages", icon: MessageSquare },
    { label: "Nội quy", path: "/tenant/rules", icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden text-slate-900">
      <Sidebar 
        menu={menu} 
        sidebarOpen={true} 
        collapsible={false}
        widthClass="w-64"
        handleLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <h1 className="font-bold text-slate-800 text-sm md:text-base tracking-tight">
              Hệ thống quản lý phòng trọ
            </h1>
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
              isTenant={true}
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

      <TenantAIChatBox />
    </div>
  );
}