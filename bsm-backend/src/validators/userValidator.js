/**
 * User Validators
 * Validates user input for user-related endpoints
 */

export const validateChangePassword = (data) => {
  const errors = {};

  const { oldPassword, newPassword } = data;

  if (!oldPassword || oldPassword.trim().length === 0) {
    errors.oldPassword = "Vui lòng nhập mật khẩu cũ";
  } else if (oldPassword.length < 6) {
    errors.oldPassword = "Mật khẩu cũ không hợp lệ";
  }

  if (!newPassword || newPassword.trim().length === 0) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (newPassword.length < 6) {
    errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
  } else if (newPassword.length > 50) {
    errors.newPassword = "Mật khẩu mới không được vượt quá 50 ký tự";
  }

  if (oldPassword === newPassword) {
    errors.newPassword = "Mật khẩu mới phải khác mật khẩu cũ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateProfile = (data) => {
  const errors = {};

  const { name, email, phone, avatar } = data;

  if (name !== undefined && name !== null) {
    if (name.trim().length === 0) {
      errors.name = "Tên không được để trống";
    } else if (name.length < 2) {
      errors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (name.length > 100) {
      errors.name = "Tên không được vượt quá 100 ký tự";
    }
  }

  if (email !== undefined && email !== null) {
    if (email.trim().length === 0) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  if (phone !== undefined && phone !== null) {
    if (phone.trim().length === 0) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
  }

  if (avatar !== undefined && avatar !== null) {
    if (typeof avatar !== "string" || avatar.length === 0) {
      errors.avatar = "Avatar không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCreateUser = (data) => {
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

  if (!role || !["OWNER", "TENANT", "ADMIN"].includes(role)) {
    errors.role = "Vai trò không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
