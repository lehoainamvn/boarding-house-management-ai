/**
 * Application Messages
 * Centralized messages for consistent communication
 */

export const MESSAGES = {
  // Auth
  AUTH: {
    LOGIN_SUCCESS: "Đăng nhập thành công",
    LOGIN_FAILED: "Sai số điện thoại hoặc mật khẩu",
    REGISTER_SUCCESS: "Đăng ký thành công",
    REGISTER_FAILED: "Đăng ký thất bại",
    LOGOUT_SUCCESS: "Đăng xuất thành công",
    INVALID_TOKEN: "Token không hợp lệ",
    TOKEN_EXPIRED: "Token đã hết hạn",
    UNAUTHORIZED: "Chưa đăng nhập",
    FORBIDDEN: "Không có quyền truy cập",
    GOOGLE_LOGIN_SUCCESS: "Đăng nhập Google thành công",
    GOOGLE_LOGIN_FAILED: "Đăng nhập Google thất bại"
  },

  // User
  USER: {
    NOT_FOUND: "Người dùng không tồn tại",
    ALREADY_EXISTS: "Người dùng đã tồn tại",
    CREATED: "Tạo người dùng thành công",
    UPDATED: "Cập nhật người dùng thành công",
    DELETED: "Xóa người dùng thành công",
    PASSWORD_CHANGED: "Đổi mật khẩu thành công",
    PASSWORD_INCORRECT: "Mật khẩu không đúng"
  },

  // House
  HOUSE: {
    NOT_FOUND: "Nhà trọ không tồn tại",
    CREATED: "Tạo nhà trọ thành công",
    UPDATED: "Cập nhật nhà trọ thành công",
    DELETED: "Xóa nhà trọ thành công",
    ALREADY_EXISTS: "Nhà trọ đã tồn tại"
  },

  // Room
  ROOM: {
    NOT_FOUND: "Phòng không tồn tại",
    CREATED: "Tạo phòng thành công",
    UPDATED: "Cập nhật phòng thành công",
    DELETED: "Xóa phòng thành công",
    ALREADY_EXISTS: "Phòng đã tồn tại"
  },

  // Tenant
  TENANT: {
    NOT_FOUND: "Khách thuê không tồn tại",
    CREATED: "Tạo khách thuê thành công",
    UPDATED: "Cập nhật khách thuê thành công",
    DELETED: "Xóa khách thuê thành công",
    ALREADY_EXISTS: "Khách thuê đã tồn tại"
  },

  // Invoice
  INVOICE: {
    NOT_FOUND: "Hóa đơn không tồn tại",
    CREATED: "Tạo hóa đơn thành công",
    UPDATED: "Cập nhật hóa đơn thành công",
    DELETED: "Xóa hóa đơn thành công"
  },

  // Message
  MESSAGE: {
    NOT_FOUND: "Tin nhắn không tồn tại",
    CREATED: "Gửi tin nhắn thành công",
    DELETED: "Xóa tin nhắn thành công"
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELD: "Trường này là bắt buộc",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_PHONE: "Số điện thoại không hợp lệ",
    INVALID_FORMAT: "Định dạng không hợp lệ",
    MIN_LENGTH: "Độ dài tối thiểu không đạt",
    MAX_LENGTH: "Độ dài tối đa vượt quá"
  },

  // General
  GENERAL: {
    SUCCESS: "Thành công",
    ERROR: "Lỗi",
    NOT_FOUND: "Không tìm thấy",
    INVALID_REQUEST: "Yêu cầu không hợp lệ",
    SERVER_ERROR: "Lỗi máy chủ",
    OPERATION_FAILED: "Thao tác thất bại"
  }
};
