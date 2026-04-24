import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { RefreshCw } from "lucide-react";

const Captcha = forwardRef(({ onVerify }, ref) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setNum1(a);
    setNum2(b);
    setCaptchaAnswer("");
    onVerify(false); // Reset trạng thái xác thực về false khi đổi mã
  };

  // Cho phép component cha gọi hàm refresh từ bên ngoài (ví dụ khi submit sai)
  useImperativeHandle(ref, () => ({
    refresh: generateCaptcha
  }));

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setCaptchaAnswer(value);
    
    // Trả về true nếu tính đúng, ngược lại là false
    const isCorrect = Number(value) === num1 + num2;
    onVerify(isCorrect);
  };

  return (
    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 space-y-2">
      <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
        Xác minh bảo mật
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-base font-bold text-indigo-600 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-lg">
            {num1} + {num2} = ?
          </div>
          
          <button
            type="button"
            onClick={generateCaptcha}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm"
            title="Đổi mã khác"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <input
          type="number"
          placeholder="Kết quả"
          value={captchaAnswer}
          onChange={handleChange}
          className="w-24 border border-slate-200 px-3 py-2 text-sm text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          required
        />
      </div>
    </div>
  );
});

Captcha.displayName = "Captcha";
export default Captcha;