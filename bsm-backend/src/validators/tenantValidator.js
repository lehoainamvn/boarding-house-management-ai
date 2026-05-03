/**
 * Tenant Validators
 * Validates user input for tenant-related endpoints
 */

export const validateAssignTenant = (data) => {
  const errors = {};

  const { userId, roomId, moveInDate, moveOutDate } = data;

  if (!userId || isNaN(userId) || userId <= 0) {
    errors.userId = "Vui lòng chọn người dùng hợp lệ";
  }

  if (!roomId || isNaN(roomId) || roomId <= 0) {
    errors.roomId = "Vui lòng chọn phòng hợp lệ";
  }

  if (!moveInDate) {
    errors.moveInDate = "Vui lòng nhập ngày vào";
  } else {
    const moveInTime = new Date(moveInDate).getTime();
    if (isNaN(moveInTime)) {
      errors.moveInDate = "Ngày vào không hợp lệ";
    }
  }

  if (moveOutDate) {
    const moveOutTime = new Date(moveOutDate).getTime();
    if (isNaN(moveOutTime)) {
      errors.moveOutDate = "Ngày ra không hợp lệ";
    } else if (moveInDate) {
      const moveInTime = new Date(moveInDate).getTime();
      if (moveOutTime <= moveInTime) {
        errors.moveOutDate = "Ngày ra phải sau ngày vào";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateTenant = (data) => {
  const errors = {};

  const { moveOutDate } = data;

  if (moveOutDate) {
    const moveOutTime = new Date(moveOutDate).getTime();
    if (isNaN(moveOutTime)) {
      errors.moveOutDate = "Ngày ra không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCreateTenant = (data) => {
  const errors = {};

  const { name, email, phone, idCard, moveInDate } = data;

  if (!name || name.trim().length === 0) {
    errors.name = "Vui lòng nhập tên người thuê";
  } else if (name.length < 2) {
    errors.name = "Tên phải có ít nhất 2 ký tự";
  } else if (name.length > 100) {
    errors.name = "Tên không được vượt quá 100 ký tự";
  }

  if (email && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  if (idCard && idCard.trim().length > 0) {
    if (!/^[0-9]{9,12}$/.test(idCard.replace(/\D/g, ""))) {
      errors.idCard = "Số CMND/CCCD không hợp lệ";
    }
  }

  if (!moveInDate) {
    errors.moveInDate = "Vui lòng nhập ngày vào";
  } else {
    const moveInTime = new Date(moveInDate).getTime();
    if (isNaN(moveInTime)) {
      errors.moveInDate = "Ngày vào không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
