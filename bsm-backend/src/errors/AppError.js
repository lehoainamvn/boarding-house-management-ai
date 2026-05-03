/**
 * Custom Application Error Class
 * Extends Error to provide consistent error handling
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = null) {
    super(message, 400, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
