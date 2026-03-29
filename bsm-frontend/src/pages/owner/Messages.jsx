import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../socket";
import { Search, Send, MessageSquare, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Messages() {
  const socket = getSocket();

  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* LOAD ROOMS */
  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoadingRooms(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRooms(false);
    }
  }

  /* JOIN ROOM */
  useEffect(() => {
    if (!selectedRoom) return;
    socket.emit("join_room", selectedRoom.id);
    loadMessages(selectedRoom.id);
  }, [selectedRoom]);

  /* LOAD MESSAGE */
  async function loadMessages(roomId) {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  }

  /* RECEIVE */
  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.room_id === selectedRoom?.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [selectedRoom]);

  /* SEND */
  async function sendMessage() {
    if (!content.trim() || !selectedRoom) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        room_id: selectedRoom.id,
        receiver_id: selectedRoom.tenant_id,
        content: content.trim()
      })
    });

    const saved = await res.json();
    if (!saved.id) return;

    socket.emit("send_message", saved);
    setContent("");
  }

  const filteredRooms = rooms.filter(r =>
    r.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        
        {/* Sidebar Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <h1 className="font-bold text-xl text-slate-800">Tin nhắn</h1>
          <button className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <MessageSquare size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Tìm kiếm người thuê..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {loadingRooms ? (
            // Skeleton loading cho danh sách phòng
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : filteredRooms.length === 0 ? (
            <div className="text-center text-slate-400 text-sm mt-10">
              Không tìm thấy người dùng
            </div>
          ) : (
            filteredRooms.map(room => {
              const isActive = selectedRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-all
                  ${isActive ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-semibold shadow-sm">
                      {room.tenant_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {room.tenant_name}
                      </p>
                      <span className="text-xs text-slate-400">10:49</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Phòng {room.room_name}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-50/50">

        {!selectedRoom ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">Bắt đầu cuộc trò chuyện</p>
            <p className="text-xs text-slate-400 mt-1">Chọn một người thuê từ danh sách bên trái để nhắn tin</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                    {selectedRoom.tenant_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {selectedRoom.tenant_name}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    Đang hoạt động
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 rounded-full transition"><Phone size={18} /></button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition"><Video size={18} /></button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingMessages ? (
                // Skeleton loading cho tin nhắn
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className={`flex ${idx % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-10 bg-slate-200 rounded-2xl w-1/3 animate-pulse ${idx % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"}`}></div>
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-10">
                  Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === user.id;
                  
                  // Gom cụm tin nhắn: Kiểm tra xem tin nhắn sau có cùng người gửi không
                  const isLastFromUser = index === messages.length - 1 || messages[index + 1].sender_id !== msg.sender_id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${isLastFromUser ? "mb-3" : "mb-1"}`}
                    >
                      <div
                        className={`px-4 py-2.5 max-w-[65%] text-[13.5px] shadow-sm relative group transition-all
                        ${isMe
                          ? `bg-indigo-600 text-white ${isLastFromUser ? "rounded-2xl rounded-br-sm" : "rounded-2xl"}`
                          : `bg-white border border-slate-200 text-slate-800 ${isLastFromUser ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"}`}`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        <div className={`text-[10px] opacity-70 mt-1 flex items-center justify-end gap-1 ${isMe ? "text-indigo-100" : "text-slate-500"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {isMe && <CheckCheck size={12} className="inline-block" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none text-slate-800 placeholder-slate-400 py-2"
                />

                <button
                  onClick={sendMessage}
                  disabled={!content.trim()}
                  className={`p-2.5 rounded-xl transition-all ${
                    !content.trim()
                      ? "text-slate-300 bg-transparent cursor-not-allowed"
                      : "text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-2">Mẹo: Nhấn `Enter` để gửi, `Shift + Enter` để xuống dòng.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}