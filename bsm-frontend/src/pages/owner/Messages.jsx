import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function Messages() {

  const socket = getSocket();

  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState("");

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
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setRooms(data);
  }

  /* JOIN ROOM */
  useEffect(() => {
    if (!selectedRoom) return;

    socket.emit("join_room", selectedRoom.id);
    loadMessages(selectedRoom.id);

  }, [selectedRoom]);

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
        content
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
    <div className="flex h-[720px] bg-white rounded-2xl shadow-xl border overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-80 border-r flex flex-col bg-white">

        <div className="p-5 font-bold text-lg border-b">
          Tin nhắn
        </div>

        <div className="p-3 border-b">
          <input
            placeholder="Tìm người thuê..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">

          {filteredRooms.map(room => {

            const isActive = selectedRoom?.id === room.id;

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition
                ${isActive
                  ? "bg-indigo-50 border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"}`}
              >

                <div className="relative">

                  <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                    {room.tenant_name.charAt(0)}
                  </div>

                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>

                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {room.tenant_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Phòng {room.room_name}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">

        {!selectedRoom ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-7xl mb-4">💬</div>
            <p>Chọn cuộc trò chuyện</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b flex items-center gap-3 bg-white">

              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                {selectedRoom.tenant_name.charAt(0)}
              </div>

              <div>
                <p className="font-semibold">
                  {selectedRoom.tenant_name}
                </p>
                <p className="text-xs text-green-500">
                  Đang hoạt động
                </p>
              </div>

            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">

              {messages.map(msg => {

                const isMe = msg.sender_id === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >

                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[65%] text-sm shadow
                      ${isMe
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white border rounded-bl-md"}`}
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

              <div ref={messagesEndRef}></div>

            </div>

            {/* INPUT */}
            <div className="border-t p-3 bg-white flex gap-2">

              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-5 rounded-full hover:bg-indigo-700"
              >
                ➤
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}