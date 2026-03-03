import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "OWNER") {
        navigate("/home", { replace: true });
      } else if (user.role === "TENANT") {
        navigate("/tenant/home", { replace: true });
      }
    }
  }, [navigate]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    if (Number(captchaAnswer) !== num1 + num2) {
      toast.error("Captcha không đúng");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);

      const data = await login({ phone, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        if (data.user.role === "OWNER") {
          navigate("/home", { replace: true });
        } else if (data.user.role === "TENANT") {
          navigate("/tenant/home", { replace: true });
        }
      }, 600);

    } catch (err) {
      toast.error(err?.message || "Sai số điện thoại hoặc mật khẩu");
      generateCaptcha();
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
              Đăng nhập hệ thống
            </h2>
            <p className="text-sm text-slate-500">
              Nhập thông tin để truy cập
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

          </form>

          <div className="flex justify-between text-sm pt-2">
            <Link to="/register" className="text-indigo-600 hover:underline">
              Tạo tài khoản
            </Link>

            <button className="text-slate-500 hover:text-indigo-600">
              Quên mật khẩu?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}