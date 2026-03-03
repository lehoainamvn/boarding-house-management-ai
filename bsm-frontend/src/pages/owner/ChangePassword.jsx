import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../api/user.api";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }

    try {
      setLoading(true);

      await changePassword({
        oldPassword,
        newPassword
      });

      toast.success("Đổi mật khẩu thành công");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      toast.error(
        err?.message || "Không thể đổi mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">
          Đổi mật khẩu
        </h1>
        <p className="text-slate-500 text-sm">
          Cập nhật mật khẩu để bảo mật tài khoản
        </p>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-md p-8 space-y-6"
      >

        {/* OLD PASSWORD */}
        <div className="relative">
          <label className="block text-sm text-slate-600 mb-1">
            Mật khẩu hiện tại
          </label>
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-4 top-10 text-xs text-slate-500"
          >
            {showOld ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {/* NEW PASSWORD */}
        <div className="relative">
          <label className="block text-sm text-slate-600 mb-1">
            Mật khẩu mới
          </label>
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-10 text-xs text-slate-500"
          >
            {showNew ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative">
          <label className="block text-sm text-slate-600 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-10 text-xs text-slate-500"
          >
            {showConfirm ? "Ẩn" : "Hiện"}
          </button>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-slate-300
                       text-slate-600 hover:bg-slate-100 transition"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-indigo-600
                       hover:bg-indigo-700 text-white font-semibold
                       transition disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>

      </form>
    </div>
  );
}