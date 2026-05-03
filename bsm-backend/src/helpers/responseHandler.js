/**
 * Response Handler - Centralized response handling
 * Ensures consistent API responses across the application
 */

export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (res, message = "Error", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

export const sendPaginated = (res, data, total, page, limit, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  });
};

export const sendCreated = (res, data, message = "Created successfully") => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res, message = "No content") => {
  return res.status(204).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};
