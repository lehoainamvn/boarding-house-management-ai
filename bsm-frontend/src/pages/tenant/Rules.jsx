import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  ClipboardList,
  Info,
  ChevronRight,
  Clock,
  MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { getHouseRulesForTenant } from "../../api/houseRuleApi";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getHouseRulesForTenant();
      setRules(data);
    } catch (err) {
      toast.error("Không thể tải nội quy nhà trọ");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ===== HEADER SECTION ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <Shield size={20} />
            </div>
            Nội quy nhà trọ
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Quy định chung giúp xây dựng cộng đồng văn minh và an toàn.
          </p>
        </div>
        {rules.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 shadow-sm">
            <Clock size={14} className="text-indigo-500" />
            Cập nhật mới nhất: {formatDate(rules[0].created_at)}
          </div>
        )}
      </div>

      {/* ===== IMPORTANT NOTICE ===== */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white text-amber-600 rounded-xl shadow-sm">
            <AlertTriangle size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-amber-900 font-bold">Lưu ý quan trọng</h3>
            <p className="text-amber-800/80 text-sm leading-relaxed max-w-3xl">
              Việc tuân thủ nội quy là trách nhiệm của mỗi thành viên trong nhà trọ. 
              Các hành vi vi phạm nghiêm trọng có thể dẫn đến việc chấm dứt hợp đồng thuê trước thời hạn. 
              Vui lòng đọc kỹ và thực hiện đầy đủ.
            </p>
          </div>
        </div>
      </div>

      {/* ===== RULES CONTENT ===== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-24 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">Chưa có nội quy đăng tải</h3>
          <p className="text-slate-400 text-sm mt-1">
            Chủ trọ hiện chưa cập nhật danh sách nội quy cụ thể cho khu nhà này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, index) => (
            <div 
              key={rule.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <FileText size={18} />
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {rule.title}
                </h3>
              </div>
              
              <div className="flex-1 bg-slate-50/50 rounded-xl p-4 group-hover:bg-indigo-50/30 transition-colors">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {rule.content}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Quy định {index + 1}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-indigo-500">
                  Xem thêm <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== FOOTER BANNER (RE-DESIGNED TO WHITE) ===== */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <MessageCircle size={28} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-800">Bạn có thắc mắc về nội quy?</h3>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">
              Nhắn tin trực tiếp với chủ trọ để được giải đáp và hỗ trợ nhanh nhất.
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/tenant/messages")}
          className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <MessageCircle size={18} />
          Nhắn tin ngay
        </button>
      </div>
    </div>
  );
}