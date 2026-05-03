/**
 * Global Error Handling Middleware
 * Catches and handles all errors in the application
 */

import { AppError } from "../errors/AppError.js";
import { sendError } from "../helpers/responseHandler.js";

export const errorMiddleware = (err, req, res, next) => {
  console.error("❌ Error:", {
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return sendError(res, "Validation failed", 400, err.errors);
  }

  // Handle database errors
  if (err.code === "EREQUEST" || err.code === "ELOGIN") {
    return sendError(res, "Database error", 500);
  }

  // Handle multer errors
  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return sendError(res, "File too large", 400);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return sendError(res, "Too many files", 400);
    }
    return sendError(res, "File upload error", 400);
  }

  // Default error
  return sendError(res, err.message || "Internal server error", err.statusCode || 500);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
