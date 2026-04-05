import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function Rules() {
  const rules = [
    {
      title: "Quy định về giờ giấc",
      icon: Shield,
      items: [
        "Giờ mở cửa: 05:00 - 23:00 hàng ngày",
        "Không tổ chức tiệc tùng, sinh hoạt ồn ào sau 22:00",
        "Không sử dụng thiết bị âm thanh lớn gây ảnh hưởng đến người khác",
        "Tuân thủ giờ tắt đèn chung: 23:00"
      ]
    },
    {
      title: "Quy định về vệ sinh",
      icon: CheckCircle,
      items: [
        "Giữ gìn vệ sinh chung: cầu thang, hành lang, khu vực công cộng",
        "Không xả rác bừa bãi, sử dụng đúng nơi quy định",
        "Tự giác dọn dẹp phòng ở của mình",
        "Không giặt đồ, phơi đồ ở khu vực công cộng",
        "Bảo quản thức ăn đúng cách, tránh gây mùi"
      ]
    },
    {
      title: "Quy định về an ninh",
      icon: AlertTriangle,
      items: [
        "Không cho người lạ vào nhà trọ",
        "Khóa cửa kỹ càng khi ra ngoài hoặc ngủ",
        "Báo ngay cho chủ nhà nếu phát hiện dấu hiệu bất thường",
        "Không mang vật nuôi vào nhà trọ",
        "Không sử dụng thiết bị điện nguy hiểm"
      ]
    },
    {
      title: "Quy định về thanh toán",
      icon: FileText,
      items: [
        "Thanh toán tiền phòng đúng hạn (ngày 1-5 hàng tháng)",
        "Thanh toán tiền điện, nước theo chỉ số thực tế",
        "Thông báo trước 30 ngày nếu muốn chuyển đi",
        "Bồi thường nếu làm hỏng đồ đạc, cơ sở vật chất"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nội quy nhà trọ</h1>
            <p className="text-slate-500 text-sm mt-1">
              Quy định chung áp dụng cho tất cả người thuê trọ
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium text-sm">Lưu ý quan trọng</p>
              <p className="text-amber-700 text-sm mt-1">
                Việc vi phạm nội quy có thể dẫn đến cảnh cáo.
                Vui lòng đọc kỹ và tuân thủ đầy đủ các quy định.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="text-center">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Liên hệ chủ nhà</h3>
          <p className="text-slate-500 text-sm mb-4">
            Nếu có thắc mắc về nội quy hoặc cần hỗ trợ, vui lòng liên hệ:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-medium">Hotline:</span>
              <span className="text-indigo-600 font-semibold">0123 456 789</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-medium">Email:</span>
              <span className="text-indigo-600 font-semibold">naml75803@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}