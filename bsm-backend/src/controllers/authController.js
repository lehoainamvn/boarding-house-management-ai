import { loginService, registerService, forgotPasswordService,
  resetPasswordService, googleLoginService } from "../services/auth.service.js";

/* ================= LOGIN ================= */
export async function login(req, res) {
  try {
    const { phone, email, identifier, password } = req.body;

    // Ưu tiên identifier → fallback phone/email
    const loginValue = identifier || phone || email;

    if (!loginValue || !password) {
      return res.status(400).json({
        message: "Thiếu thông tin đăng nhập"
      });
    }

    const data = await loginService(loginValue, password);

    res.json(data);

  } catch (err) {
    res.status(401).json({
      message: err.message
    });
  }
}

/* ================= GOOGLE LOGIN ================= */
export async function googleLogin(req, res) {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: "Thiếu Google credential"
      });
    }

    const data = await googleLoginService(credential, role || "OWNER");
    res.json(data);
  } catch (err) {
    res.status(401).json({
      message: err.message || "Google login failed"
    });
  }
}


/* ================= REGISTER ================= */
export async function register(req, res) {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Thiếu thông tin đăng ký"
      });
    }

    await registerService({
      name,
      email,
      phone,
      password,
      role: role || "OWNER"
    });

    res.json({
      message: "Đăng ký thành công"
    });

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
}

export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);
    res.json({ message: "Đã gửi OTP" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.body);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};