import { Bell, Trash2, CheckCheck, X, Receipt, MessageSquare } from "lucide-react";

export default function NotificationMenu({ 
  notifications, 
  unreadCount, 
  openNotify, 
  setOpenNotify, 
  notifyRef, 
  markReadAll, 
  clearAll, 
  deleteNotify, 
  handleNotificationClick,
  setShowAllModal
}) {
  return (
    <div className="relative" ref={notifyRef}>
      <button
        onClick={() => setOpenNotify(!openNotify)}
        className={`w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center relative transition-all ${
          openNotify ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"
        }`}
      >
        <Bell size={18} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {openNotify && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <span className="font-extrabold text-slate-800 text-sm">Thông báo</span>
            <div className="flex gap-3">
              <span onClick={markReadAll} className="text-[11px] text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 uppercase tracking-tighter">Đọc tất cả</span>
              <span onClick={clearAll} className="text-[11px] text-rose-600 font-bold cursor-pointer hover:text-rose-700 uppercase tracking-tighter">Xóa tất cả</span>
            </div>
          </div>

          <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">Không có thông báo mới</div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)} 
                  className={`px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-indigo-50/20' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className={`text-[10px] uppercase font-bold mb-0.5 ${!n.is_read ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {n.title || "Thông báo"}
                      </p>
                      <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                        {n.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotify(n.id); }} 
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
  );
}
