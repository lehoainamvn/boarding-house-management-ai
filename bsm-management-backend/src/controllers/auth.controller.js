import { loginService, registerService } from "../services/auth.service.js";

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