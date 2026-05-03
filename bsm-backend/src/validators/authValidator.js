/**
 * Authentication Validators
 * Validates user input for auth-related endpoints
 */

export const validateLogin = (data) => {
  const errors = {};

  const { phone, email, identifier, password } = data;
  const loginValue = identifier || phone || email;

  if (!loginValue) {
    errors.loginValue = "Vui lòng nhập số điện thoại, email hoặc tên đăng nhập";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegister = (data) => {
  const errors = {};

  const { name, email, phone, password, role } = data;

  if (!name || name.trim().length === 0) {
    errors.name = "Vui lòng nhập tên";
  } else if (name.length < 2) {
    errors.name = "Tên phải có ít nhất 2 ký tự";
  } else if (name.length > 100) {
    errors.name = "Tên không được vượt quá 100 ký tự";
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  if (email && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  if (!password || password.trim().length === 0) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  } else if (password.length > 50) {
    errors.password = "Mật khẩu không được vượt quá 50 ký tự";
  }

  if (role && !["OWNER", "TENANT", "ADMIN"].includes(role)) {
    errors.role = "Vai trò không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateGoogleLogin = (data) => {
  const errors = {};

  const { credential } = data;

  if (!credential || credential.trim().length === 0) {
    errors.credential = "Google credential không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateForgotPassword = (data) => {
  const errors = {};

  const { email } = data;

  if (!email || email.trim().length === 0) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateResetPassword = (data) => {
  const errors = {};

  const { email, otp, newPassword } = data;

  if (!email || email.trim().length === 0) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!otp || otp.trim().length === 0) {
    errors.otp = "Vui lòng nhập OTP";
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = "OTP phải là 6 chữ số";
  }

  if (!newPassword || newPassword.trim().length === 0) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (newPassword.length < 6) {
    errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
  } else if (newPassword.length > 50) {
    errors.newPassword = "Mật khẩu không được vượt quá 50 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
