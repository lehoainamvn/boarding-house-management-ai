import jwt from "jsonwebtoken";

/**
 * Middleware xác thực JWT
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

/* ✅ EXPORT CẢ HAI KIỂU */
export { verifyToken };
export default verifyToken;
