import { sortObject } from "../utils/vnpay-utils.js";
import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
import sql, { poolPromise } from "../config/db.js";

// Cấu hình (có thể đưa vào .env ở bản production)
const vnp_TmnCode = "ZBVDBUOS";
const vnp_HashSecret = "S6L9CBYCLLHJDKO4IMS44B79LZY1PBQQ";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:5173/tenant/payment-return";

export const generatePaymentUrlService = async (amount, invoiceId, ipAddr) => {
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
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;
  const finalUrl = vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

  return finalUrl;
};

export const processVnpayIPNService = async (vnp_Params) => {
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== signed) {
    return { RspCode: "97", Message: "Invalid Checksum" };
  }

  const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
  const invoiceId = vnp_TxnRef.split("_")[0];
  const responseCode = vnp_Params["vnp_ResponseCode"];
  const amount = vnp_Params["vnp_Amount"] / 100;

  if (responseCode !== "00") {
    return { RspCode: "01", Message: "Payment Failed" };
  }

  console.log(`Bắt đầu lưu data cho hóa đơn: ${invoiceId}`);
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
    console.log(`✅ Lưu Database thành công cho hóa đơn: ${invoiceId}`);
    return { RspCode: "00", Message: "Confirm Success" };

  } catch (dbError) {
    await transaction.rollback();
    console.error("❌ Lỗi khi thực thi SQL (đã rollback):", dbError);
    return { RspCode: "99", Message: "Database error" };
  }
};

export const processVnpayReturnService = async (vnp_Params) => {
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== signed) {
    return { success: false, message: "Chữ ký không hợp lệ" };
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
  const invoiceId = vnp_TxnRef.split("_")[0];
  const amount = vnp_Params["vnp_Amount"] / 100;

  if (responseCode !== "00") {
    return { success: false, message: "Giao dịch không thành công" };
  }

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
    // Vẫn trả về success mặc dù lỗi DB, vì bên IPN có thể đã xử lý, 
    // Tuy nhiên return báo lỗi cũng được.
  }

  return { success: true, message: "Thanh toán thành công" };
};
