import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function TenantContact() {

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [room, setRoom] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const socket = getSocket();
  const bottomRef = useRef(null);

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

  /* SEND */
  async function sendMessage() {

    if (!content.trim()) return;
    if (!room?.id) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        room_id: room.id,
        receiver_id: room.owner_id,
        content
      })
    });

    const saved = await res.json();

    if (!saved.id) return;

    socket.emit("send_message", saved);
    setContent("");
  }

  return (
    <div className="flex flex-col h-[680px] bg-white rounded-2xl shadow-lg border overflow-hidden">

      {/* HEADER */}
      <div className="p-4 border-b flex items-center gap-3 bg-white">

        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
          O
        </div>

        <div>
          <p className="font-semibold">Chủ trọ</p>
          <p className="text-xs text-green-500">Đang hoạt động</p>
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

        {!room && (
          <div className="text-center text-gray-400 mt-10">
            ❌ Bạn chưa được gán phòng
          </div>
        )}

        {messages.map(msg => {

          const isMe = msg.sender_id === user.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >

              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow
                ${isMe
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-white border rounded-bl-md"}
                `}
              >

                <p>{msg.content}</p>

                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>

              </div>

            </div>
          );
        })}

        <div ref={bottomRef}></div>

      </div>

      {/* INPUT */}
      <div className="border-t p-3 bg-white flex gap-2">

        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-5 rounded-full hover:bg-indigo-700"
        >
          Gửi
        </button>

      </div>

    </div>
  );
}