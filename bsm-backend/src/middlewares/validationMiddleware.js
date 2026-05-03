/**
 * Validation Middleware
 * Provides middleware functions for request validation
 */

import { sendError } from "../helpers/responseHandler.js";

/**
 * Creates a validation middleware
 * @param {Function} validatorFn - Validator function that returns { isValid, errors }
 * @returns {Function} Express middleware
 */
export const createValidationMiddleware = (validatorFn) => {
  return (req, res, next) => {
    const validation = validatorFn(req.body);

    if (!validation.isValid) {
      return sendError(res, 400, "Dữ liệu không hợp lệ", validation.errors);
    }

    next();
  };
};

/**
 * Validates request body using a validator function
 * @param {Function} validatorFn - Validator function
 * @param {Object} data - Data to validate (defaults to req.body)
 * @returns {Object} Validation result { isValid, errors }
 */
export const validateRequest = (validatorFn, data) => {
  return validatorFn(data);
};

/**
 * Validates multiple fields
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result { isValid, errors }
 */
export const validateFields = (data, rules) => {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Check required
    if (rule.required && (!value || (typeof value === "string" && value.trim().length === 0))) {
      errors[field] = rule.requiredMessage || `${field} là bắt buộc`;
      continue;
    }

    // Check type
    if (value !== undefined && value !== null && rule.type) {
      if (typeof value !== rule.type) {
        errors[field] = rule.typeMessage || `${field} phải là ${rule.type}`;
        continue;
      }
    }

    // Check min length
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.minLengthMessage || `${field} phải có ít nhất ${rule.minLength} ký tự`;
      continue;
    }

    // Check max length
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || `${field} không được vượt quá ${rule.maxLength} ký tự`;
      continue;
    }

    // Check pattern
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} không hợp lệ`;
      continue;
    }

    // Check custom validator
    if (value && rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
