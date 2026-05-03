/**
 * House & Room Validators
 * Validates user input for house and room-related endpoints
 */

export const validateCreateHouse = (data) => {
  const errors = {};

  const { name, address, city, district, ward, phone, email } = data;

  if (!name || name.trim().length === 0) {
    errors.name = "Vui lòng nhập tên nhà";
  } else if (name.length < 2) {
    errors.name = "Tên nhà phải có ít nhất 2 ký tự";
  } else if (name.length > 100) {
    errors.name = "Tên nhà không được vượt quá 100 ký tự";
  }

  if (!address || address.trim().length === 0) {
    errors.address = "Vui lòng nhập địa chỉ";
  } else if (address.length > 200) {
    errors.address = "Địa chỉ không được vượt quá 200 ký tự";
  }

  if (!city || city.trim().length === 0) {
    errors.city = "Vui lòng chọn thành phố";
  }

  if (!district || district.trim().length === 0) {
    errors.district = "Vui lòng chọn quận/huyện";
  }

  if (!ward || ward.trim().length === 0) {
    errors.ward = "Vui lòng chọn phường/xã";
  }

  if (phone && phone.trim().length > 0) {
    if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
  }

  if (email && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateHouse = (data) => {
  const errors = {};

  const { name, address, city, district, ward, phone, email } = data;

  if (name !== undefined && name !== null) {
    if (name.trim().length === 0) {
      errors.name = "Tên nhà không được để trống";
    } else if (name.length < 2) {
      errors.name = "Tên nhà phải có ít nhất 2 ký tự";
    } else if (name.length > 100) {
      errors.name = "Tên nhà không được vượt quá 100 ký tự";
    }
  }

  if (address !== undefined && address !== null) {
    if (address.trim().length === 0) {
      errors.address = "Địa chỉ không được để trống";
    } else if (address.length > 200) {
      errors.address = "Địa chỉ không được vượt quá 200 ký tự";
    }
  }

  if (phone !== undefined && phone !== null && phone.trim().length > 0) {
    if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }
  }

  if (email !== undefined && email !== null && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCreateRoom = (data) => {
  const errors = {};

  const { name, roomNumber, floor, area, price, status } = data;

  if (!name || name.trim().length === 0) {
    errors.name = "Vui lòng nhập tên phòng";
  } else if (name.length < 2) {
    errors.name = "Tên phòng phải có ít nhất 2 ký tự";
  } else if (name.length > 50) {
    errors.name = "Tên phòng không được vượt quá 50 ký tự";
  }

  if (!roomNumber || roomNumber.trim().length === 0) {
    errors.roomNumber = "Vui lòng nhập số phòng";
  }

  if (floor !== undefined && floor !== null) {
    if (isNaN(floor) || floor < 0) {
      errors.floor = "Tầng phải là số không âm";
    }
  }

  if (!area || isNaN(area) || area <= 0) {
    errors.area = "Diện tích phải là số dương";
  } else if (area > 10000) {
    errors.area = "Diện tích không hợp lệ";
  }

  if (!price || isNaN(price) || price < 0) {
    errors.price = "Giá phòng phải là số không âm";
  } else if (price > 1000000000) {
    errors.price = "Giá phòng không hợp lệ";
  }

  if (status && !["AVAILABLE", "OCCUPIED", "MAINTENANCE"].includes(status)) {
    errors.status = "Trạng thái phòng không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateRoom = (data) => {
  const errors = {};

  const { name, roomNumber, floor, area, price, status } = data;

  if (name !== undefined && name !== null) {
    if (name.trim().length === 0) {
      errors.name = "Tên phòng không được để trống";
    } else if (name.length < 2) {
      errors.name = "Tên phòng phải có ít nhất 2 ký tự";
    } else if (name.length > 50) {
      errors.name = "Tên phòng không được vượt quá 50 ký tự";
    }
  }

  if (area !== undefined && area !== null) {
    if (isNaN(area) || area <= 0) {
      errors.area = "Diện tích phải là số dương";
    } else if (area > 10000) {
      errors.area = "Diện tích không hợp lệ";
    }
  }

  if (price !== undefined && price !== null) {
    if (isNaN(price) || price < 0) {
      errors.price = "Giá phòng phải là số không âm";
    } else if (price > 1000000000) {
      errors.price = "Giá phòng không hợp lệ";
    }
  }

  if (status !== undefined && status !== null) {
    if (!["AVAILABLE", "OCCUPIED", "MAINTENANCE"].includes(status)) {
      errors.status = "Trạng thái phòng không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
