import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Tự động tạo thư mục public/uploads nếu chưa có để tránh lỗi Multer
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu vào public/uploads
  },
  filename: function (req, file, cb) {
    // Tạo tên file độc nhất để không bị đè: thời_gian_hiện_tại + tên_gốc
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file 5MB
});

// 2. Viết API POST /api/upload
// "image" ở đây phải trùng khớp với formData.append("image", ...) ở React
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một file ảnh" });
    }
    
    // Tạo link URL trả về cho Frontend
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Lỗi upload server:", error);
    return res.status(500).json({ message: "Lỗi server khi upload ảnh" });
  }
});

export default router;