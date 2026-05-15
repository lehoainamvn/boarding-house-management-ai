import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  ClipboardList, 
  Trash2, 
  Edit3, 
  Plus, 
  Home, 
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { useHouses } from "../../hooks/useHouses";
import { 
  getHouseRules, 
  createHouseRule, 
  updateHouseRule, 
  deleteHouseRule 
} from "../../api/houseRuleApi";
import AddButton from "../../components/common/AddButton";

export default function HouseRules() {
  const { houses, selectedHouseId, changeHouse } = useHouses();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  useEffect(() => {
    if (selectedHouseId) {
      fetchRules();
    }
  }, [selectedHouseId]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getHouseRules(selectedHouseId);
      setRules(data);
    } catch (err) {
      toast.error("Không thể tải danh sách nội quy");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ title: rule.title, content: rule.content });
    } else {
      setEditingRule(null);
      setFormData({ title: "", content: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setFormData({ title: "", content: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHouseId) return toast.error("Vui lòng chọn nhà trọ");
    if (!formData.title || !formData.content) return toast.error("Vui lòng nhập đầy đủ thông tin");

    try {
      if (editingRule) {
        await updateHouseRule(editingRule.id, formData);
        toast.success("Cập nhật nội quy thành công");
      } else {
        await createHouseRule(selectedHouseId, formData);
        toast.success("Thêm nội quy mới thành công");
      }
      fetchRules();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nội quy này?")) return;
    try {
      await deleteHouseRule(id);
      toast.success("Xóa nội quy thành công");
      fetchRules();
    } catch (err) {
      toast.error("Xóa nội quy thất bại");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nội quy nhà trọ</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý các quy định và thông báo chung cho từng khu nhà
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedHouseId || ""}
              onChange={(e) => changeHouse(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white appearance-none font-medium text-slate-700 shadow-sm"
            >
              <option value="" disabled>Chọn nhà trọ</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <AddButton onClick={() => handleOpenModal()} label="Thêm nội quy" />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
          <ClipboardList size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm font-medium">Chưa có nội quy nào cho nhà này.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {rule.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {rule.content}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(rule)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRule ? "Cập nhật nội quy" : "Thêm nội quy mới"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tiêu đề nội quy
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700"
                  placeholder="Ví dụ: Giờ giấc ra vào"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nội dung chi tiết
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700 resize-none"
                  placeholder="Nhập nội dung quy định..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                >
                  {editingRule ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
