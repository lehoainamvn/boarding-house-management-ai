import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsReadApi, 
  deleteNotificationApi, 
  clearAllNotificationsApi 
} from "../api/notification.api";

const socket = io(SOCKET_URL);

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (userId) {
      socket.emit("join_room", `user_${userId}`);
      
      socket.on("new_notification", (newNotify) => {
        setNotifications(prev => [newNotify, ...prev]);
        toast.success(newNotify.title || "Thông báo mới!", { icon: '🔔' });
      });
    }
    return () => {
      socket.off("new_notification");
    };
  }, [userId, fetchNotifications]);

  const markReadAll = async () => {
    const ok = await markAllAsReadApi();
    if (ok) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    }
  };

  const deleteNotify = async (id) => {
    const ok = await deleteNotificationApi(id);
    if (ok) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Đã xóa thông báo");
    }
  };

  const clearAll = async () => {
    const ok = await clearAllNotificationsApi();
    if (ok) {
      setNotifications([]);
      toast.success("Đã xóa toàn bộ thông báo");
    }
  };

  const markRead = async (notification) => {
    if (!notification.is_read) {
      const ok = await markAsRead(notification.id);
      if (ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
        );
      }
    }
  };

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.is_read).length,
    markReadAll,
    deleteNotify,
    clearAll,
    markRead,
    refresh: fetchNotifications
  };
}
