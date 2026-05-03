import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const verifyMail = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP ready");
  } catch (err) {
    console.error("❌ SMTP error:", err.message);
  }
};