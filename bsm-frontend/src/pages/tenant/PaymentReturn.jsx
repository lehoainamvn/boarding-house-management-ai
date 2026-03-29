import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        // Gửi toàn bộ query string từ VNPay lên backend để xác thực
        const res = await fetch(`http://localhost:5000/api/payment/vnpay-return?${searchParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message || "Thanh toán không thành công");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Lỗi kết nối hệ thống");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        
        {status === "processing" && (
          <>
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={64} />
            <h2 className="text-xl font-bold">Đang xác thực giao dịch...</h2>
            <p className="text-slate-500">Vui lòng không đóng trình duyệt</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-emerald-500" size={64} />
            <h2 className="text-2xl font-bold text-slate-800">Thanh toán thành công!</h2>
            <p className="text-slate-500">Cảm ơn bạn. Hóa đơn của bạn đã được cập nhật trạng thái đã thanh toán.</p>
            <button 
              onClick={() => navigate("/tenant/invoices")}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              Xem danh sách hóa đơn
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto text-red-500" size={64} />
            <h2 className="text-2xl font-bold text-slate-800">Thanh toán thất bại</h2>
            <p className="text-slate-500">{message}</p>
            <button 
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              Quay lại thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}