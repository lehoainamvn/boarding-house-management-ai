import { useState, useRef, useEffect } from "react";

export default function AIChatBox() {

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào 👋 Tôi có thể giúp gì cho bạn?" }
  ]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===== SEND MESSAGE ===== */
  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    try {

      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          message: currentInput
        })
      });

      const data = await res.json();

      const aiMessage = {
        role: "assistant",
        content: data.reply
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "AI server đang lỗi"
        }
      ]);

    }

  };

  return (
    <>
      {/* BUTTON OPEN CHAT */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg text-xl"
      >
        🤖
      </button>

      {/* CHAT BOX */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-white rounded-xl shadow-xl flex flex-col">

          {/* HEADER */}
          <div className="bg-indigo-600 text-white p-3 font-semibold">
            AI Assistant
          </div>

          {/* MESSAGE LIST */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-indigo-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            ))}

            <div ref={bottomRef}></div>

          </div>

          {/* INPUT */}
          <div className="border-t flex">

            <input
              className="flex-1 px-3 py-2 outline-none"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="px-4 bg-indigo-600 text-white"
            >
              Gửi
            </button>

          </div>

        </div>
      )}
    </>
  );

}