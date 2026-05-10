import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../socket";
import { Send, User, ShieldCheck, MoreVertical, Paperclip, Smile, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";

export default function TenantContact() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [room, setRoom] = useState(null);
  
  // State phục vụ việc gửi ảnh
  const [selectedImage, setSelectedImage] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const socket = getSocket();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  /* LOAD ROOM */
  useEffect(() => {
    loadRoom();
  }, []);

  async function loadRoom() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/messages/my-room`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data?.id) return;
    setRoom(data);
  }

  /* JOIN ROOM */
  useEffect(() => {
    if (!room?.id) return;
    socket.emit("join_room", room.id);
    loadMessages(room.id);
  }, [room]);

  /* LOAD MESSAGE */
  async function loadMessages(roomId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/messages/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMessages(data);
  }

  /* RECEIVE */
  useEffect(() => {
    if (!room?.id) return;

    const handleReceive = (msg) => {
      if (msg.room_id === room.id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [room]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* XỬ LÝ CHỌN ẢNH */
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chỉ chọn file hình ảnh!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  /* HỦY BỎ ẢNH ĐÃ CHỌN */
  function clearSelectedImage() {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* SEND MESSAGE */
  async function sendMessage() {
    if (!content.trim() && !selectedImage) return;
    if (!room?.id) return;

    const token = localStorage.getItem("token");
    let imageUrl = null;

    try {
      setIsUploading(true);

      // 1. NẾU CÓ ẢNH THÌ UPLOAD LÊN SERVER TRƯỚC
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!uploadRes.ok) {
          toast.error("Không thể upload hình ảnh!");
          setIsUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url; 
      }

      // 2. GỬI TIN NHẮN (Gộp link ảnh vào đuôi Content để né lỗi 400)
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: room.id,
          receiver_id: room.owner_id,
          content: imageUrl ? `${content.trim()} [img]${imageUrl}[/img]`.trim() : content.trim()
        })
      });

      const saved = await res.json();
      if (!saved.id) return;

      // Thêm sender_name vào data gửi qua socket
      const senderName = user?.full_name || user?.username || "Khách thuê";
      console.log("Sending message with sender_name:", senderName, "User:", user);
      
      socket.emit("send_message", {
        ...saved,
        sender_name: senderName
      });
      
      setContent("");
      clearSelectedImage();

    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi tin nhắn!");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[550px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* HEADER PHÒNG CHAT */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              <User size={20} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-800 text-sm">Quản lý/Chủ trọ</p>
              <ShieldCheck size={14} className="text-indigo-500" />
            </div>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              Đang trực tuyến
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* VÙNG HIỂN THỊ TIN NHẮN */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">

        {!room && (
          <div className="flex flex-col items-center justify-center text-center mt-12 text-slate-400">
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <User size={24} className="text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-600">Chưa được gán phòng</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Bạn cần được gán vào phòng cụ thể để bắt đầu cuộc trò chuyện với chủ trọ.
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === user.id;
          
          // --- LOGIC TÁCH ẢNH THÔNG MINH ---
          let textDisplay = msg.content;
          let extractedImgUrl = null;

          if (msg.content && msg.content.includes("[img]") && msg.content.includes("[/img]")) {
            const start = msg.content.indexOf("[img]") + 5;
            const end = msg.content.indexOf("[/img]");
            extractedImgUrl = msg.content.substring(start, end);
            textDisplay = msg.content.replace(`[img]${extractedImgUrl}[/img]`, "").trim();
          }
          // ---------------------------------

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 max-w-[70%] text-sm shadow-sm transition-all space-y-2
                ${isMe
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm font-medium"
                  : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm font-medium"}
                `}
              >
                {/* HIỂN THỊ HÌNH ẢNH NẾU TÁCH THÀNH CÔNG */}
                {extractedImgUrl && (
                  <div className="rounded-lg overflow-hidden border border-black/5 mb-1 max-w-[250px]">
                    <img 
                      src={extractedImgUrl} 
                      alt="Ảnh đính kèm" 
                      className="w-full h-auto object-cover max-h-60 cursor-pointer"
                      onClick={() => window.open(extractedImgUrl, "_blank")}
                    />
                  </div>
                )}

                {/* HIỂN THỊ CHỮ NẾU CÓ */}
                {textDisplay && (
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{textDisplay}</p>
                )}

                <div className={`text-[10px] mt-1.5 flex items-center justify-end font-medium ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }) : "Vừa xong"}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* VÙNG NHẬP TIN NHẮN */}
      <div className="p-4 bg-white border-t border-slate-100">
        
        {/* KHU VỰC PREVIEW ẢNH KHI CHỌN */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={clearSelectedImage}
              className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-0.5 rounded-full hover:bg-rose-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all flex items-center gap-2 px-3 py-1.5">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageChange}
          />

          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`${imagePreview ? "text-indigo-600" : "text-slate-400"} hover:text-indigo-600 p-2 hover:bg-white rounded-lg transition-colors`}
          >
            {imagePreview ? <ImageIcon size={18} /> : <Paperclip size={18} />}
          </button>

          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !isUploading && sendMessage()}
            placeholder={imagePreview ? "Thêm chú thích cho ảnh..." : "Nhập tin nhắn..."}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-700 placeholder:text-slate-400 py-2"
            disabled={isUploading}
          />

          <button className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-white rounded-lg transition-colors">
            <Smile size={18} />
          </button>

          <button
            onClick={sendMessage}
            disabled={(!content.trim() && !selectedImage) || isUploading}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}