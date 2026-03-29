import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { 
  Brain, TrendingUp, AlertCircle, CheckCircle2, 
  Target, Zap, ShieldCheck, BarChart3, 
  Lightbulb, Activity, ChevronRight, DollarSign, ArrowUpRight, Scale
} from "lucide-react";

export default function RevenuePrediction() {
  const [houses, setHouses] = useState([]);
  const [houseId, setHouseId] = useState("");
  const [months, setMonths] = useState(12);
  const [simOccupancy, setSimOccupancy] = useState(90);
  const [chartData, setChartData] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadHouses(); }, []);

  async function loadHouses() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/houses", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.length > 0) { 
        setHouses(data); 
        setHouseId(data[0].id); 
      }
    } catch (err) { toast.error("Lỗi tải danh sách nhà"); }
  }

  async function runPrediction(isSim = false) {
    setLoading(true);
    const toastId = toast.loading(isSim ? "Đang giả lập kịch bản..." : "AI đang tính toán...");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/predict-revenue?house=${houseId}&months=${months}&simOccupancy=${simOccupancy}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      setResult(data);
      
      if (data.error) {
        setChartData([]);
        toast.error(data.error, { id: toastId });
        return;
      }

      const history = (data.history || []).map(i => ({
        month: i.month.substring(0, 7),
        "Thực tế": parseFloat(i.revenue),
      }));

      const lastReal = history.length > 0 ? history[history.length - 1]["Thực tế"] : 0;
      
      const predictions = (data.predictions || []).map(i => ({
        month: i.month,
        "Dự báo AI": i.realistic,
        "Kịch bản Tốt": i.optimistic,
        "Kịch bản Rủi ro": i.pessimistic
      }));

      if (history.length > 0 && predictions.length > 0) {
        predictions.unshift({ 
          month: history[history.length-1].month, 
          "Dự báo AI": lastReal, 
          "Kịch bản Tốt": lastReal, 
          "Kịch bản Rủi ro": lastReal 
        });
      }

      setChartData([...history, ...predictions]);
      toast.success("Dữ liệu đã sẵn sàng!", { id: toastId });
    } catch (err) { 
      toast.error("Lỗi kết nối với hệ thống AI", { id: toastId }); 
      setResult(null);
    } finally { 
      setLoading(false); 
    }
  }

  // Hàm format tiền tệ VNĐ
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-indigo-50/30 pb-20 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI Prediction Lab</h1>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                HỆ THỐNG ĐANG HOẠT ĐỘNG
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            <select 
              value={houseId} 
              onChange={(e) => setHouseId(e.target.value)} 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all"
            >
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <button 
              onClick={() => runPrediction(false)} 
              disabled={loading} 
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-500/20 disabled:opacity-70"
            >
              {loading ? "Đang tính..." : "Chạy phân tích"} <Zap size={14} fill="currentColor"/>
            </button>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {result.error ? (
              <div className="lg:col-span-12 bg-white/80 backdrop-blur-md border border-red-100 p-10 rounded-3xl text-center shadow-sm">
                <div className="bg-red-500 w-14 h-14 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-500/20">
                  <AlertCircle size={24}/>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Không đủ dữ liệu phân tích</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">{result.error}</p>
              </div>
            ) : (
              <>
                {/* QUICK STATS (3 Thẻ chỉ số nhanh phía trên) */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng doanh thu AI dự báo</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{chartData.length > 0 ? formatVND(result.predictions?.[0]?.realistic || 0) : "---"}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <DollarSign size={22} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ lấp đầy</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{simOccupancy}%</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Target size={22} />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Độ lệch (Rủi ro)</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">±{(result.accuracy?.mae/1000 || 0).toFixed(0)}K</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <Scale size={22} />
                    </div>
                  </div>
                </div>

                {/* LEFT SIDE: MAIN CHART & SIMULATOR */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                         <TrendingUp size={16} className="text-indigo-600"/> Dự báo dòng tiền đa kịch bản
                      </h3>
                    </div>
                    <div className="h-[360px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorThucTe" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(v) => (v/1000000).toFixed(1) + 'M'} />
                          <Tooltip 
                            formatter={(value) => [formatVND(value), ""]}
                            contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '12px'}} 
                          />
                          <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '15px', fontSize: '11px', fontWeight: '600', color: '#64748b'}}/>
                          <Area type="monotone" dataKey="Thực tế" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorThucTe)" />
                          <Area type="monotone" dataKey="Dự báo AI" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" />
                          <Area type="monotone" dataKey="Kịch bản Tốt" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                          <Area type="monotone" dataKey="Kịch bản Rủi ro" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* THIẾT LẬP GIẢ LẬP */}
                  <div className="bg-slate-900 rounded-3xl p-7 text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden">
                    <div className="absolute -right-20 -bottom-20 opacity-5 text-white"><Target size={220}/></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/20 rounded-lg"><Zap size={16} className="text-indigo-300" /></div>
                          <h2 className="text-lg font-bold">Giả lập tỷ lệ lấp đầy</h2>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                          <span className="text-slate-400 text-sm mt-1">Kỳ vọng lấp đầy:</span> <span className="text-indigo-400 text-2xl">{simOccupancy}%</span>
                        </div>
                        <input type="range" min="50" max="100" value={simOccupancy} onChange={(e) => setSimOccupancy(e.target.value)}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        <button onClick={() => runPrediction(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Cập nhật kịch bản</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                          <ShieldCheck className="text-emerald-400 mb-1" size={18}/>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Độ tin cậy</p>
                          <p className="text-xl font-bold mt-0.5">{result.accuracy?.r2_score ?? 0}%</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                          <AlertCircle className="text-orange-400 mb-1" size={18}/>
                          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Mã lỗi MAE</p>
                          <p className="text-xl font-bold mt-0.5">±{(result.accuracy?.mae/1000 || 0).toFixed(0)}K</p>
                        </div>
                        <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                           <div>
                             <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Trọng số lấp đầy</p>
                             <p className="text-lg font-bold text-slate-100 mt-0.5">{result.insight?.factorWeights?.["Lấp đầy"] ?? 0}%</p>
                           </div>
                           <div className="p-2 bg-white/5 rounded-lg">
                             <BarChart3 size={20} className="text-indigo-400 opacity-80"/>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: ALERTS & INSIGHTS */}
                <div className="lg:col-span-4 space-y-6">
                  {/* INSIGHTS CARD */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-wider mb-5">
                      <Lightbulb size={16} className="text-yellow-500"/> Giải mã dữ liệu (AI)
                    </h4>
                    <div className="space-y-5">
                      {result.insight?.factorWeights && Object.entries(result.insight.factorWeights).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>{key}</span> <span className="text-indigo-600">{val}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full transition-all" style={{width: `${val}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVICE CARD */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                      <CheckCircle2 size={16} className="text-emerald-500"/> Khuyến nghị từ AI
                    </h4>
                    <div className="space-y-3">
                      {result.explanations?.map((text, i) => (
                        <div key={i} className="flex gap-3 items-start bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                           <div className="mt-0.5 text-indigo-500"><ChevronRight size={14} strokeWidth={3}/></div>
                           <p className="text-xs text-slate-600 font-medium leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}