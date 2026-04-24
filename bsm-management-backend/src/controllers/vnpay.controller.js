import {
  generatePaymentUrlService,
  processVnpayIPNService,
  processVnpayReturnService
} from "../services/vnpay.service.js";

export const createPaymentUrl = async (req, res) => {
  try {
    const { amount, invoiceId } = req.body;
    const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    
    const finalUrl = await generatePaymentUrlService(amount, invoiceId, ipAddr);

    return res.json({ paymentUrl: finalUrl });
  } catch (error) {
    console.error("Lỗi tạo link thanh toán:", error);
    return res.status(500).json({ message: "Lỗi tạo link thanh toán" });
  }
};

export const vnpayIPN = async (req, res) => {
  try {
    const result = await processVnpayIPNService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("LỖI IPN:", error);
    return res.status(500).json({ RspCode: "99", Message: "System error" });
  }
};

export const vnpayReturn = async (req, res) => {
  try {
    const result = await processVnpayReturnService(req.query);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("LỖI VNPAY RETURN:", error); 
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi kiểm tra giao dịch" });
  }
};