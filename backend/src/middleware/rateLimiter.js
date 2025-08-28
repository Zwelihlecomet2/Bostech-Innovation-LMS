const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const testSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 submissions per minute per IP
  message: {
    success: false,
    message: 'Please wait before submitting another test'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: {
    success: false,
    message: 'Too many admin requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { 
  loginLimiter, 
  testSubmissionLimiter, 
  generalLimiter, 
  adminLimiter 
};