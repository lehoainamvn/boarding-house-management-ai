import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function TenantContact() {

const [messages, setMessages] = useState([]);
const [content, setContent] = useState("");
const [isOwnerOnline, setIsOwnerOnline] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const roomId = 1;
  const ownerId = 1;

  const bottomRef = useRef(null);

  useEffect(() => {

    socket.emit("join_room", roomId);

    loadMessages();

  }, []);

  async function loadMessages() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setMessages(data);

  }

  /* RECEIVE MESSAGE */

  useEffect(() => {

    function handleReceive(msg) {

      if (msg.room_id === roomId) {

        setMessages(prev => [...prev, msg]);

      }

    }

    socket.on("receive_message", handleReceive);

    return () => socket.off("receive_message", handleReceive);

  }, []);

  /* AUTO SCROLL */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  /* SEND MESSAGE */

  async function sendMessage() {

    if (!content.trim()) return;

    const token = localStorage.getItem("token");

    const payload = {
      room_id: roomId,
      receiver_id: ownerId,
      content
    };

    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const savedMessage = await res.json();

    socket.emit("send_message", savedMessage);

    setMessages(prev => [...prev, savedMessage]);

    setContent("");

  }

  return (
    <div className="flex flex-col h-[680px] bg-white rounded-2xl shadow-lg border overflow-hidden">

      {/* HEADER */}

      <div className="p-4 border-b flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
          O
        </div>

        <div>
          <p className="font-semibold">Chủ trọ</p>
          <p className="text-xs text-gray-500">Đang hoạt động</p>
        </div>

      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">

        {messages.map(msg => (

          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user.id
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`px-4 py-3 rounded-2xl max-w-[70%] shadow-sm
              ${msg.sender_id === user.id
                ? "bg-indigo-600 text-white rounded-br-md"
                : "bg-white border rounded-bl-md"}
              `}
            >

              <p className="text-sm leading-relaxed">
                {msg.content}
              </p>

              <div className="text-[11px] opacity-70 mt-1 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>

            </div>

          </div>

        ))}

        <div ref={bottomRef}></div>

      </div>

      {/* INPUT */}

      <div className="border-t p-4 bg-white flex gap-3">

        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className="flex-1 border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nhập tin nhắn..."
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-6 rounded-full hover:bg-indigo-700 transition"
        >
          Gửi
        </button>

      </div>

    </div>
  );

}