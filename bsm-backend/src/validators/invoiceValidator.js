/**
 * Invoice & Payment Validators
 * Validates user input for invoice and payment-related endpoints
 */

export const validateCreateInvoice = (data) => {
  const errors = {};

  const { roomId, month, year, amount, description } = data;

  if (!roomId || isNaN(roomId) || roomId <= 0) {
    errors.roomId = "Vui lòng chọn phòng hợp lệ";
  }

  if (!month || isNaN(month) || month < 1 || month > 12) {
    errors.month = "Tháng phải từ 1 đến 12";
  }

  if (!year || isNaN(year) || year < 2000 || year > 2100) {
    errors.year = "Năm không hợp lệ";
  }

  if (!amount || isNaN(amount) || amount < 0) {
    errors.amount = "Số tiền phải là số không âm";
  } else if (amount > 1000000000) {
    errors.amount = "Số tiền không hợp lệ";
  }

  if (description && description.length > 500) {
    errors.description = "Mô tả không được vượt quá 500 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateInvoice = (data) => {
  const errors = {};

  const { amount, description, status } = data;

  if (amount !== undefined && amount !== null) {
    if (isNaN(amount) || amount < 0) {
      errors.amount = "Số tiền phải là số không âm";
    } else if (amount > 1000000000) {
      errors.amount = "Số tiền không hợp lệ";
    }
  }

  if (description !== undefined && description !== null) {
    if (description.length > 500) {
      errors.description = "Mô tả không được vượt quá 500 ký tự";
    }
  }

  if (status !== undefined && status !== null) {
    if (!["PENDING", "PAID", "OVERDUE", "CANCELLED"].includes(status)) {
      errors.status = "Trạng thái hóa đơn không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProcessPayment = (data) => {
  const errors = {};

  const { invoiceId, amount, paymentMethod, transactionId } = data;

  if (!invoiceId || isNaN(invoiceId) || invoiceId <= 0) {
    errors.invoiceId = "Vui lòng chọn hóa đơn hợp lệ";
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    errors.amount = "Số tiền phải là số dương";
  } else if (amount > 1000000000) {
    errors.amount = "Số tiền không hợp lệ";
  }

  if (!paymentMethod || !["CASH", "BANK_TRANSFER", "VNPAY", "MOMO"].includes(paymentMethod)) {
    errors.paymentMethod = "Phương thức thanh toán không hợp lệ";
  }

  if (transactionId && transactionId.length > 100) {
    errors.transactionId = "Mã giao dịch không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMeterReading = (data) => {
  const errors = {};

  const { roomId, meterType, reading, readingDate } = data;

  if (!roomId || isNaN(roomId) || roomId <= 0) {
    errors.roomId = "Vui lòng chọn phòng hợp lệ";
  }

  if (!meterType || !["WATER", "ELECTRIC"].includes(meterType)) {
    errors.meterType = "Loại đồng hồ không hợp lệ";
  }

  if (!reading || isNaN(reading) || reading < 0) {
    errors.reading = "Chỉ số đồng hồ phải là số không âm";
  } else if (reading > 999999999) {
    errors.reading = "Chỉ số đồng hồ không hợp lệ";
  }

  if (!readingDate) {
    errors.readingDate = "Vui lòng nhập ngày ghi chỉ số";
  } else {
    const readingTime = new Date(readingDate).getTime();
    if (isNaN(readingTime)) {
      errors.readingDate = "Ngày ghi chỉ số không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
