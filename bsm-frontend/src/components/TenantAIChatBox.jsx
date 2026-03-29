import { useState, useRef, useEffect } from "react"
import { Bot, User, Send, X, Sparkles } from "lucide-react"

export default function TenantAIChatBox(){

  const [open,setOpen] = useState(false)

  const [messages,setMessages] = useState([
    {
      role:"assistant",
      content:"Xin chào 👋 Tôi là trợ lý ảo hỗ trợ thông tin phòng của bạn. Bạn cần tra cứu thông tin gì hôm nay?",
      suggestions:[
        "Hóa đơn tháng này",
        "Tiền điện tháng này",
        "Thông tin cá nhân"
      ]
    }
  ])

  const [input,setInput] = useState("")
  const [loading,setLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const userLocal = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("profile"));
  const userName = userLocal?.name || "Khách"

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const sendMessage = async (text)=>{

    const message = text || input
    if(!message.trim()) return

    const newMessages=[
      ...messages,
      { role:"user",content:message }
    ]

    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try{

      const res = await fetch("http://localhost:5000/api/ai-tenant/chat",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          question:message,
          userId:userLocal?.id
        })
      })

      const data = await res.json()

      setMessages([
        ...newMessages,
        {
          role:"assistant",
          content:data.answer,
          suggestions:data.suggestions || []
        }
      ])

    }catch{

      setMessages([
        ...newMessages,
        { role:"assistant",content:"⚠️ Hiện tại hệ thống phản hồi đang bận. Bạn vui lòng thử lại sau ít phút nhé!" }
      ])

    }

    setLoading(false)

  }

  return(

    <>

      {/* OPEN BUTTON - HIỆU ỨNG PULSE SÓNG NƯỚC */}

      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-105 hover:shadow-indigo-600/40 transition-all duration-300 group z-50"
        >
          <div className="absolute inset-0 rounded-2xl bg-indigo-600 animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></div>
          <Bot size={24} className="relative z-10 transition-transform group-hover:rotate-12"/>
        </button>
      )}

      {/* CHAT BOX */}

      {open && (

        <div className="fixed bottom-6 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">

          {/* HEADER */}

          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-5 py-4 flex justify-between items-center">

            <div className="flex items-center gap-3">

              <div className="bg-white/15 backdrop-blur-sm text-white rounded-xl p-2 border border-white/20">
                <Bot size={18}/>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                   <p className="font-bold text-sm tracking-tight">AI Trợ Lý Phòng</p>
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                </div>
                <p className="text-xs text-indigo-100 font-medium">Hỗ trợ khách thuê 24/7</p>
              </div>

            </div>

            <button 
              onClick={()=>setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">

            {messages.map((m,i)=>(

              <div
                key={i}
                className={`flex gap-3 ${
                  m.role==="user" ? "justify-end" : "justify-start"
                }`}
              >

                {m.role==="assistant" && (
                  <div className="bg-white border border-slate-100 text-indigo-600 shadow-sm rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center">
                    <Bot size={16}/>
                  </div>
                )}

                <div className="max-w-[80%] flex flex-col gap-2">
                  <div
                    className={`px-4 py-3 text-sm rounded-2xl shadow-sm leading-relaxed ${
                      m.role==="user"
                      ? "bg-indigo-600 text-white rounded-br-sm font-medium"
                      : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* SUGGESTIONS TRỰC THUỘC TIN NHẮN */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {m.suggestions.map((s, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(s)}
                          className="text-xs font-semibold bg-indigo-50/80 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={10} className="text-indigo-500" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role==="user" && (
                  <div className="bg-slate-800 text-white rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}

              </div>

            ))}

            {/* HIỆU ỨNG ĐANG SUY NGHĨ */}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-white border border-slate-100 text-indigo-600 shadow-sm rounded-xl h-9 w-9 flex-shrink-0 flex items-center justify-center">
                  <Bot size={16}/>
                </div>
                <div className="bg-white border border-slate-100 text-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}/>

          </div>

          {/* INPUT */}

          <div className="border-t border-slate-100 p-4 flex gap-2.5 bg-white">

            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Nhập câu hỏi tại đây..."
              className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              onKeyDown={(e)=>{
                if(e.key==="Enter") sendMessage()
              }}
            />

            <button
              onClick={()=>sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm shadow-indigo-500/10"
            >
              <Send size={16}/>
            </button>

          </div>

        </div>

      )}

    </>

  )

}