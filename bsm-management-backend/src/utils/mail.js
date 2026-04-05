import { transporter } from "../config/mail.js";

export const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"BSM System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      // text, <-- Ẩn cái này đi
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Xác thực mã OTP</h2>
          <p>Chào bạn,</p>
          <p>Bạn vừa yêu cầu mã OTP để khôi phục mật khẩu. Mã của bạn là:</p>
          <div style="font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 4px; padding: 10px; background: #f3f4f6; display: inline-block; border-radius: 8px;">
            ${text} 
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Mã này sẽ hết hạn sau 5 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `
    });
    console.log(`✉️ Email HTML đã được gửi tới: ${to}`);
  } catch (err) {
    console.error("❌ Send mail error:", err.message);
    throw new Error("Gửi email thất bại");
  }
};