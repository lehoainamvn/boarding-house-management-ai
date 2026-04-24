import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  Brain, TrendingUp, AlertCircle, CheckCircle2,
  Target, Zap, ShieldCheck, BarChart3,
  Lightbulb, ChevronRight, DollarSign, Scale,
  CalendarDays, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

import { getHouses } from "../../api/house.api";
import { predictRevenue } from "../../api/predict.api";

function fmt(v) {
  return new Intl.NumberFormat("vi-VN").format(v) + "đ";
}

function fmtShort(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return v;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl text-xs min-w-[180px]">
      <p className="font-bold text-slate-700 mb-2 text-sm">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }} className="font-semibold">{p.name}</span>
          <span className="text-slate-600 font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function RevenuePrediction() {
  const [houses, setHouses] = useState([]);
  const [houseId, setHouseId] = useState("");
  const [months, setMonths] = useState(6);
  const [simOccupancy, setSimOccupancy] = useState(90);
  const [chartData, setChartData] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");

  useEffect(() => { loadHouses(); }, []);

  async function loadHouses() {
    try {
      const data = await getHouses();
      if (data.length > 0) { setHouses(data); setHouseId(data[0].id); }
    } catch { toast.error("Lỗi tải danh sách nhà"); }
  }

  async function runPrediction() {
    if (!houseId) return toast.error("Vui lòng chọn nhà trọ");
    setLoading(true);
    const toastId = toast.loading("AI đang phân tích dữ liệu...");
    try {
      const data = await predictRevenue(houseId, months, simOccupancy);
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

      const lastReal = history.at(-1)?.["Thực tế"] ?? 0;
      const predictions = (data.predictions || []).map(i => ({
        month: i.month,
        "Dự báo": i.realistic,
        "Tốt nhất": i.optimistic,
        "Rủi ro": i.pessimistic,
      }));

      if (history.length > 0 && predictions.length > 0) {
        predictions.unshift({ month: history.at(-1).month, "Dự báo": lastReal, "Tốt nhất": lastReal, "Rủi ro": lastReal });
      }
      setChartData([...history, ...predictions]);
      toast.success("Phân tích hoàn tất!", { id: toastId });
    } catch {
      toast.error("Lỗi kết nối hệ thống AI", { id: toastId });
      setResult(null);
    } finally { setLoading(false); }
  }

  const totalPredicted = result?.totalPredicted ?? (result?.predictions?.reduce((s, p) => s + p.realistic, 0) ?? 0);
  const lastHistory = result?.history?.at(-1);
  const firstPrediction = result?.predictions?.[0];
  const trend = firstPrediction && lastHistory
    ? ((firstPrediction.revenue - lastHistory.revenue) / lastHistory.revenue * 100)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 pb-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <Brain size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dự Báo Doanh Thu AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                HỆ THỐNG ĐANG HOẠT ĐỘNG
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 ring-indigo-400/30 outline-none"
            >
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>

            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
              <CalendarDays size={14} className="text-slate-500" />
              <select
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                {[3, 6, 9, 12].map(m => <option key={m} value={m}>Dự báo {m} tháng</option>)}
              </select>
            </div>

            <button
              onClick={runPrediction}
              disabled={loading}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm shadow-indigo-500/20 disabled:opacity-60"
            >
              {loading ? "Đang tính..." : <><Zap size={14} fill="currentColor" /> Chạy phân tích</>}
            </button>
          </div>
        </div>

        {result && (
          result.error ? (
            <div className="bg-white border border-red-100 p-12 rounded-2xl text-center shadow-sm">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Không đủ dữ liệu</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">{result.error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: `Tổng dự báo (${months} tháng)`, value: fmt(totalPredicted), icon: <DollarSign size={18} />, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
                  { 
                    label: "Xu hướng tháng tới", 
                    value: trend !== null ? `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%` : "---", 
                    icon: trend > 0 ? <ArrowUpRight size={18} /> : trend < 0 ? <ArrowDownRight size={18} /> : <Minus size={18} />,
                    color: trend > 0 ? "emerald" : trend < 0 ? "red" : "slate",
                    bg: trend > 0 ? "bg-emerald-50" : trend < 0 ? "bg-red-50" : "bg-slate-50",
                    text: trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-slate-500"
                  },
                  { label: "Độ tin cậy", value: `${result.accuracy?.r2_score ?? 0}%`, icon: <ShieldCheck size={18} />, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { label: "Sai lệch (MAE)", value: `±${fmtShort(result.accuracy?.mae || 0)}`, icon: <Scale size={18} />, color: "orange", bg: "bg-orange-50", text: "text-orange-500" },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">{c.label}</p>
                      <p className="text-xl font-bold text-slate-800 mt-1.5">{c.value}</p>
                    </div>
                    <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center ${c.text} flex-shrink-0`}>
                      {c.icon}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: CHART & ADVICE */}
                <div className="lg:col-span-8 space-y-6">
                  {/* MAIN CHART */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <TrendingUp size={15} className="text-indigo-500" /> Biểu đồ doanh thu & dự báo
                      </h3>
                      <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5 text-xs font-semibold">
                        {["chart", "table"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                          >
                            {tab === "chart" ? "Biểu đồ" : "Bảng số liệu"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeTab === "chart" ? (
                      <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                              <linearGradient id="gAI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }} dy={8} interval={Math.max(0, Math.floor(chartData.length / 8) - 1)} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={fmtShort} width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#64748b", paddingBottom: "12px" }} />
                            {result?.history?.length > 0 && <ReferenceLine x={result.history.at(-1).month} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" label={{ value: "Hiện tại", position: "insideTopRight", fontSize: 10, fill: "#94a3b8" }} />}
                            <Area type="monotone" dataKey="Thực tế" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gReal)" dot={false} />
                            <Area type="monotone" dataKey="Dự báo" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gAI)" dot={false} />
                            <Area type="monotone" dataKey="Tốt nhất" stroke="#34d399" strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} />
                            <Area type="monotone" dataKey="Rủi ro" stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                              <th className="px-4 py-3 text-left font-semibold">Tháng</th>
                              <th className="px-4 py-3 text-right font-semibold">Dự báo</th>
                              <th className="px-4 py-3 text-right font-semibold text-emerald-300">Tốt nhất</th>
                              <th className="px-4 py-3 text-right font-semibold text-red-300">Rủi ro</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(result.predictions || []).map((p, i) => (
                              <tr key={i} className={`border-t border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-indigo-50/30 transition-colors`}>
                                <td className="px-4 py-3 font-bold text-slate-700">{p.month}</td>
                                <td className="px-4 py-3 text-right font-semibold text-indigo-600">{fmt(p.realistic)}</td>
                                <td className="px-4 py-3 text-right text-emerald-600">{fmt(p.optimistic)}</td>
                                <td className="px-4 py-3 text-right text-red-500">{fmt(p.pessimistic)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ADVICE SECTION */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase tracking-wider mb-5">
                      <Lightbulb size={14} className="text-yellow-500" /> Giải mã & Khuyến nghị chi tiết từ AI
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.explanations?.map((text, i) => (
                        <div key={i} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
                          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <CheckCircle2 size={14} />
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-4 space-y-5">
                  {/* SIMULATOR */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg"><Zap size={14} className="text-indigo-300" /></div>
                      <h4 className="font-bold text-sm">Giả lập lấp đầy</h4>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-400 text-xs">Lịch sử TB:</span>
                      <span className="font-bold text-slate-300">{result.insight?.avgOccupancy ?? "--"}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-xl font-bold">
                      <span className="text-slate-400 text-xs mt-1">Mục tiêu:</span>
                      <span className="text-indigo-400">{simOccupancy}%</span>
                    </div>
                    <input type="range" min="40" max="100" value={simOccupancy} onChange={(e) => setSimOccupancy(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 mb-6" />
                    <button onClick={runPrediction} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20">Cập nhật kịch bản</button>
                  </div>

                  {/* WEIGHTS */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase tracking-wider mb-5">
                      <BarChart3 size={14} className="text-indigo-500" /> Trọng số phân tích
                    </h4>
                    <div className="space-y-4">
                      {result.insight?.factorWeights && Object.entries(result.insight.factorWeights).map(([key, val]) => (
                        <div key={key} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-600"><span>{key}</span><span className="text-indigo-600">{val}%</span></div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ANOMALIES */}
                  {result.anomalies?.length > 0 && (
                    <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
                      <h4 className="font-bold text-orange-700 flex items-center gap-2 text-xs uppercase tracking-wider mb-4"><AlertCircle size={14} /> Biến động bất thường</h4>
                      {result.anomalies.map((a, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-t border-orange-100 first:border-0">
                          <div><p className="text-xs font-bold text-orange-700">{a.month}</p><p className="text-[10px] text-orange-500">{a.type}</p></div>
                          <ChevronRight size={14} className="text-orange-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {!result && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Brain size={28} />
            </div>
            <h3 className="font-bold text-slate-700 mb-1">Sẵn sàng phân tích</h3>
            <p className="text-slate-400 text-sm">Chọn nhà trọ và bấm <strong className="text-indigo-600">Chạy phân tích</strong> để AI dự báo doanh thu</p>
          </div>
        )}
      </div>
    </div>
  );
}