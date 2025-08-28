const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// User validation
const validateCreateUser = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

const validateUpdateUser = [
  param('id')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Test validation
const validateCreateTest = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Test title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('duration')
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.options.A')
    .trim()
    .notEmpty()
    .withMessage('Option A is required'),
  body('questions.*.options.B')
    .trim()
    .notEmpty()
    .withMessage('Option B is required'),
  body('questions.*.options.C')
    .trim()
    .notEmpty()
    .withMessage('Option C is required'),
  body('questions.*.options.D')
    .trim()
    .notEmpty()
    .withMessage('Option D is required'),
  body('questions.*.correctAnswer')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Correct answer must be A, B, C, or D'),
  handleValidationErrors
];

// Test attempt validation
const validateTestAttempt = [
  body('testId')
    .isUUID()
    .withMessage('Valid test ID is required'),
  body('answers')
    .isObject()
    .withMessage('Answers must be an object'),
  body('timeSpent')
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer'),
  body('submissionType')
    .optional()
    .isIn(['manual', 'auto'])
    .withMessage('Submission type must be manual or auto'),
  handleValidationErrors
];

// Common validations
const validateUUID = (field) => [
  param(field)
    .isUUID()
    .withMessage(`Valid ${field} is required`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateCreateTest,
  validateTestAttempt,
  validateUUID,
  validatePagination
};