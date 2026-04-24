import { Bell, CheckCheck, Trash2, X, Receipt, MessageSquare } from "lucide-react";

export default function NotificationModal({ 
  show, 
  onClose, 
  notifications, 
  unreadCount, 
  markReadAll, 
  clearAll, 
  deleteNotify, 
  handleNotificationClick 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Lớp phủ mờ (Overlay) */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Thân Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thông báo</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Bạn đang có <span className="text-indigo-600 font-semibold">{unreadCount}</span> thông báo mới
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={markReadAll} 
              className="p-2.5 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Đã đọc tất cả</span>
            </button>
            <button 
              onClick={clearAll} 
              className="p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Xóa toàn bộ thông báo"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nội dung danh sách thông báo */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 custom-scrollbar">
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
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    !isRead 
                      ? (isInvoice ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600')
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isInvoice ? <Receipt size={18} /> : <MessageSquare size={18} />}
                  </div>
                  
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
                          onClick={(e) => { e.stopPropagation(); deleteNotify(n.id); }} 
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
        
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Hệ thống thông báo thời gian thực</span>
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
