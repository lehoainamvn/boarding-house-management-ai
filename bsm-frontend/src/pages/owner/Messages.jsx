import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function Messages() {

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

    loadMessages();

  }, [selectedRoom]);

  /* LOAD HISTORY */

  async function loadMessages() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/${selectedRoom.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setMessages(data);

  }

  /* RECEIVE MESSAGE */

  useEffect(() => {

    function handleReceive(msg) {

      if (msg.room_id === selectedRoom?.id) {

        setMessages(prev => [...prev, msg]);

      }

    }

    socket.on("receive_message", handleReceive);

    return () => socket.off("receive_message", handleReceive);

  }, [selectedRoom]);

  /* SEND MESSAGE */

  async function sendMessage() {

    if (!content.trim() || !selectedRoom) return;

    const token = localStorage.getItem("token");

    const payload = {
      room_id: selectedRoom.id,
      receiver_id: selectedRoom.tenant_id,
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

    setContent("");

  }

  const filteredRooms = rooms.filter(r =>
    r.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[720px] bg-white rounded-2xl shadow-xl border overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-80 border-r bg-white flex flex-col">

        <div className="p-5 font-bold text-lg border-b">
          Tin nhắn
        </div>

        {/* SEARCH */}

        <div className="p-3 border-b">

          <input
            placeholder="Tìm người thuê..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />

        </div>

        <div className="flex-1 overflow-y-auto">

          {filteredRooms.map(room => (

            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition
              ${selectedRoom?.id === room.id
                ? "bg-indigo-50 border-l-4 border-indigo-600"
                : "hover:bg-gray-50"}
              `}
            >

              {/* AVATAR */}

              <div className="relative">

                <div className="w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                  {room.tenant_name.charAt(0)}
                </div>

                {/* ONLINE DOT */}

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

          ))}

        </div>

      </div>

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col">

        {!selectedRoom && (

          <div className="flex flex-col items-center justify-center h-full text-gray-400">

            <div className="text-7xl mb-4">💬</div>

            <p className="text-lg">
              Chọn cuộc trò chuyện
            </p>

          </div>

        )}

        {selectedRoom && (
          <>

            {/* HEADER */}

            <div className="p-4 border-b flex items-center justify-between">

              <div className="flex items-center gap-3">

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

            </div>

            {/* MESSAGE LIST */}

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">

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
                    className={`px-4 py-3 rounded-2xl max-w-[65%] text-sm shadow
                    ${msg.sender_id === user.id
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white border rounded-bl-md"}
                    `}
                  >

                    {msg.content}

                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>

                  </div>

                </div>

              ))}

              <div ref={messagesEndRef}></div>

            </div>

            {/* INPUT */}

            <div className="border-t p-4 bg-white flex gap-3 items-center">

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
                className="bg-indigo-600 text-white px-5 py-3 rounded-full hover:bg-indigo-700 transition"
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