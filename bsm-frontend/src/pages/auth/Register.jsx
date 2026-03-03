import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "OWNER"
  });

  const [loading, setLoading] = useState(false);

  /* ================= CAPTCHA ================= */
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setNum1(a);
    setNum2(b);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Mật khẩu nhập lại không khớp");
    }

    if (Number(captchaAnswer) !== num1 + num2) {
      toast.error("Captcha không đúng");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);

      await registerApi({
        name: form.name,
        phone: form.phone,
        email: `${form.phone}@bsm.local`,
        password: form.password,
        role: form.role
      });

      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/"), 800);

    } catch (err) {
      toast.error(err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center bg-white border-r p-10 space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-800">
            BSM Management
          </h1>

          <p className="text-slate-500">
            Hệ thống quản lý nhà trọ chuyên nghiệp
          </p>

          <div className="space-y-3 text-sm text-slate-600">
            <p>✔ Quản lý phòng & khách thuê</p>
            <p>✔ Theo dõi hóa đơn</p>
            <p>✔ Thống kê doanh thu</p>
            <p>✔ Gửi hóa đơn qua Zalo</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-10 space-y-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Tạo tài khoản
            </h2>
            <p className="text-sm text-slate-500">
              Chọn loại tài khoản phù hợp
            </p>
          </div>

          {/* ROLE */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "OWNER" })}
              className={`p-4 rounded-2xl border transition text-left ${
                form.role === "OWNER"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold text-slate-800">Chủ trọ</p>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, role: "TENANT" })}
              className={`p-4 rounded-2xl border transition text-left ${
                form.role === "TENANT"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold text-slate-800">Người thuê</p>
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            {/* CAPTCHA */}
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                Xác minh bạn không phải robot
              </p>

              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-indigo-600">
                  {num1} + {num2} = ?
                </div>

                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-24 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />

                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Đổi
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700
                         text-white py-3 rounded-xl font-semibold
                         transition disabled:opacity-60"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

          </form>

          <p className="text-sm text-center">
            Đã có tài khoản?{" "}
            <Link to="/" className="text-indigo-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}