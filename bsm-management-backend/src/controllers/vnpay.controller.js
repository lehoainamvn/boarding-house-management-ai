import { sortObject } from "../utils/vnpay-utils.js";
import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
// 👇 IMPORT poolPromise VÀ sql TỪ FILE DB CỦA BẠN (Sửa lại đường dẫn cho đúng nhé)
import sql, { poolPromise } from "../config/db.js"; 

// Cấu hình
const vnp_TmnCode = "ZBVDBUOS";
const vnp_HashSecret = "S6L9CBYCLLHJDKO4IMS44B79LZY1PBQQ";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:5173/tenant/payment-return";

export const createPaymentUrl = async (req, res) => {
  try {
    const { amount, invoiceId } = req.body;
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: `${invoiceId}_${moment(date).format("HHmmss")}`,
      vnp_OrderInfo: `Thanh toan hoa don ${invoiceId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    const finalUrl = vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    return res.json({ paymentUrl: finalUrl });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi tạo link thanh toán" });
  }
};

export const vnpayIPN = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
      const invoiceId = vnp_TxnRef.split("_")[0]; // Lấy ID hóa đơn
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const amount = vnp_Params["vnp_Amount"] / 100; // VNPay nhân 100 nên chia lại

      if (responseCode === "00") {
        console.log(`Bắt đầu lưu data cho hóa đơn: ${invoiceId}`);
        
        // 1. Chờ lấy pool kết nối từ db.js
        const pool = await poolPromise;
        
        // 2. Tạo Transaction để đảm bảo an toàn dữ liệu
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          // 3. Cập nhật bảng invoices
          const invoiceRequest = new sql.Request(transaction);
          await invoiceRequest
            .input("invoiceId", sql.Int, invoiceId)
            .query("UPDATE invoices SET status = 'PAID', paid_at = GETDATE() WHERE id = @invoiceId");

          // 4. Thêm mới bản ghi vào bảng payments
          const paymentRequest = new sql.Request(transaction);
          await paymentRequest
            .input("invoiceId", sql.Int, invoiceId)
            .input("transNo", sql.NVarChar, vnp_Params["vnp_TransactionNo"])
            .input("resCode", sql.NVarChar, responseCode)
            .input("info", sql.NVarChar, vnp_Params["vnp_OrderInfo"])
            .input("amount", sql.Decimal(12, 2), amount)
            .query(`
              INSERT INTO payments (invoice_id, vnp_TransactionNo, vnp_ResponseCode, vnp_OrderInfo, amount, method, paid_at) 
              VALUES (@invoiceId, @transNo, @resCode, @info, @amount, 'VNPAY', GETDATE())
            `);

          // Nếu mọi thứ ok thì commit lưu vào db
          await transaction.commit();
          console.log(`✅ Lưu Database thành công cho hóa đơn: ${invoiceId}`);

        } catch (dbError) {
          // Nếu 1 trong 2 lệnh lỗi thì hủy bỏ toàn bộ
          await transaction.rollback();
          console.error("❌ Lỗi khi thực thi SQL (đã rollback):", dbError);
          return res.status(500).json({ RspCode: "99", Message: "Database error" });
        }

        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }
      return res.status(200).json({ RspCode: "01", Message: "Payment Failed" });
    }
    return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
  } catch (error) {
    console.error("LỖI IPN:", error);
    return res.status(500).json({ RspCode: "99", Message: "System error" });
  }
};
export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
      const invoiceId = vnp_TxnRef.split("_")[0];
      const amount = vnp_Params["vnp_Amount"] / 100;

      if (responseCode === "00") {
        
        // 👇 COPY ĐOẠN LƯU DATABASE TỪ IPN SANG ĐÂY 👇
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          const invoiceRequest = new sql.Request(transaction);
          await invoiceRequest
            .input("invoiceId", sql.Int, invoiceId)
            .query("UPDATE invoices SET status = 'PAID', paid_at = GETDATE() WHERE id = @invoiceId");

          const paymentRequest = new sql.Request(transaction);
          await paymentRequest
            .input("invoiceId", sql.Int, invoiceId)
            .input("transNo", sql.NVarChar, vnp_Params["vnp_TransactionNo"])
            .input("resCode", sql.NVarChar, responseCode)
            .input("info", sql.NVarChar, vnp_Params["vnp_OrderInfo"])
            .input("amount", sql.Decimal(12, 2), amount)
            .query(`
              INSERT INTO payments (invoice_id, vnp_TransactionNo, vnp_ResponseCode, vnp_OrderInfo, amount, method, paid_at) 
              VALUES (@invoiceId, @transNo, @resCode, @info, @amount, 'VNPAY', GETDATE())
            `);

          await transaction.commit();
          console.log(`✅ [Hàm Return] Lưu DB thành công cho hóa đơn: ${invoiceId}`);

        } catch (dbError) {
          await transaction.rollback();
          console.error("❌ Lỗi DB ở hàm Return:", dbError);
        }
        // 👆 KẾT THÚC ĐOẠN LƯU DATABASE 👆

        return res.status(200).json({ success: true, message: "Thanh toán thành công" });
      } else {
        return res.status(200).json({ success: false, message: "Giao dịch không thành công" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
    }
  } catch (error) {
    console.error("LỖI VNPAY RETURN:", error); 
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi kiểm tra giao dịch" });
  }
};