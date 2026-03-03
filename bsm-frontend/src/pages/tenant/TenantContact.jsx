import { useState } from "react";
import toast from "react-hot-toast";

export default function TenantContact() {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!message) {
      return toast.error("Vui lòng nhập nội dung");
    }

    toast.success("Đã gửi tin nhắn cho chủ trọ");
    setMessage("");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800">
        Liên hệ chủ trọ
      </h1>

      <div className="bg-white rounded-3xl shadow p-6 space-y-4">

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập nội dung..."
          className="w-full h-32 border rounded-xl p-3"
        />

        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-6 py-2
                     rounded-xl font-semibold"
        >
          Gửi tin nhắn
        </button>

      </div>
    </div>
  );
}