import { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ReactMarkdown from "react-markdown"; 
import remarkGfm from "remark-gfm"; // <-- ĐÃ THÊM: Import plugin để vẽ bảng

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Send, Bot, X, Sparkles } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AIChatBox(){

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào 👋 Tôi là trợ lý AI của BSM. Tôi có thể giúp gì cho bạn hôm nay?",
      suggestions: [
        "Doanh thu tháng này",
        "Phòng nào chưa thanh toán",
        "Tổng số phòng đang thuê"
      ]
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Lấy thông tin user để hiển thị avatar đẹp hơn
  const userLocal = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
  const userName = userLocal?.name || "User";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (loading) return;

    const question = text || input;

    if (!question.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: question }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {

      const token = localStorage.getItem("token"); 

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token 
        },
          body: JSON.stringify({
          question: question,
          history: messages // <-- GỬI KÈM LỊCH SỬ LÊN ĐÂY
        })
      });

      const data = await res.json();

      const aiMessage = {
        role: "assistant",
        content: data.answer,
        type: data.type,
        labels: data.labels,
        values: data.values,
        suggestions: data.suggestions || []
      };

      setMessages([
        ...newMessages,
        aiMessage
      ]);

    } catch (err) {

      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ AI server đang gặp sự cố. Bạn vui lòng thử lại sau nhé!" }
      ]);

    }

    setLoading(false);

  };

  return (

    <>

      {/* OPEN BUTTON - ĐƯỢC LÀM ĐẸP VÀ CÓ HIỆU ỨNG PULSE */}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white w-14 h-14 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-105 hover:shadow-indigo-600/40 transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-2xl bg-indigo-600 animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></div>
          <Bot size={24} className="relative z-10 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* CHAT BOX */}

      {open && (

        <div className="fixed bottom-6 right-6 w-[400px] h-[580px] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">

          {/* HEADER - ĐỒNG BỘ MÀU INDIGO BRAND */}

          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-5 py-4 flex justify-between items-center">

            <div className="flex items-center gap-3">

              <div className="bg-white/15 backdrop-blur-sm text-white rounded-xl p-2 border border-white/20">
                <Bot size={20}/>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                   <p className="font-bold text-sm tracking-tight">AI Trợ Lý Thông Minh</p>
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                </div>
                <p className="text-xs text-indigo-100 font-medium">Sẵn sàng hỗ trợ quản lý</p>
              </div>

            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-5">

            {messages.map((m, i) => (

              <div
                key={i}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >

                {m.role === "assistant" && (
                  <div className="bg-white border border-slate-100 text-indigo-600 shadow-sm rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center">
                    <Bot size={18}/>
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm font-medium"
                      : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm markdown-content" 
                  }`}
                >

                  {/* ĐÃ THAY ĐỔI: Thêm remarkPlugins={[remarkGfm]} để render được bảng biểu */}
                  {m.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}

                  {/* CHART */}

                  {m.type === "chart" && (

                    <div className="mt-3 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">

                      <Bar
                        data={{
                          labels: m.labels,
                          datasets: [
                            {
                              label: "Doanh thu",
                              data: m.values,
                              backgroundColor: "rgba(79, 70, 229, 0.85)", // Indigo-600
                              borderRadius: 6,
                              borderSkipped: false,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: '#1e293b',
                              titleFont: { size: 12, weight: 'bold' },
                              bodyFont: { size: 12 },
                              padding: 10,
                              cornerRadius: 8,
                              displayColors: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: 'rgba(241, 245, 249, 1)' }
                            },
                            x: {
                              grid: { display: false }
                            }
                          }
                        }}
                      />

                    </div>

                  )}

                  {/* SUGGESTIONS IN MESSAGE */}

                  {m.suggestions && m.suggestions.length > 0 && (

                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-50">

                      {m.suggestions.map((s, index) => (

                        <button
                          key={index}
                          onClick={() => sendMessage(s)}
                          disabled={loading}
                          className="text-xs font-semibold bg-indigo-50/70 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles size={10} className="text-indigo-500" />
                          {s}
                        </button>

                      ))}

                    </div>

                  )}

                </div>

                {m.role === "user" && (
                  <div className="bg-slate-800 text-white rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}

              </div>

            ))}

            {/* HIỆU ỨNG TYPING WAVE */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-white border border-slate-100 text-indigo-600 shadow-sm rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center">
                  <Bot size={18}/>
                </div>
                <div className="bg-white border border-slate-100 text-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}/>

          </div>

          {/* INPUT - FIX LẠI BO GÓC VÀ FOCUS */}

          <div className="border-t border-slate-100 p-4 flex gap-2.5 bg-white">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI về doanh thu, phòng trọ..."
              className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm shadow-indigo-500/10"
            >
              <Send size={16}/>
            </button>

          </div>

        </div>

      )}

    </>
  );

}