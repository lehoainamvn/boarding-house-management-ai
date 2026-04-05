import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-indigo-100/40 overflow-hidden grid md:grid-cols-12 min-h-[600px]">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-10 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Decorative background shapes */}
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Hệ Thống Quản Lý</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              BSM Management
            </h1>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
              Giải pháp vận hành và quản lý nhà trọ, căn hộ dịch vụ tự động, chuyên nghiệp hàng đầu.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              "Quản lý phòng & khách thuê",
              "Theo dõi hóa đơn thông minh",
              "Thống kê doanh thu trực quan",
              "Gửi hóa đơn qua Zalo tiện lợi"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm font-medium text-indigo-100">
                <CheckCircle2 size={16} className="text-indigo-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-xs text-indigo-300 font-medium">
            © 2026 BSM. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - CHỖ CHỨA FORM (LOGIN/REGISTER/...) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-7">
          {children}
        </div>

      </div>
    </div>
  );
}