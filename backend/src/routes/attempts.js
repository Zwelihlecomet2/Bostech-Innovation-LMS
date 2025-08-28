const express = require('express');
const attemptController = require('../controllers/attemptController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { testSubmissionLimiter, generalLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { validateTestAttempt, validateUUID, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.post('/', testSubmissionLimiter, validateTestAttempt, attemptController.submitTestAttempt);
router.get('/my-attempts', generalLimiter, attemptController.getUserAttempts);
router.get('/stats', generalLimiter, attemptController.getAttemptStats);
router.get('/:id', validateUUID('id'), generalLimiter, attemptController.getAttemptById);

// Admin only routes
router.get('/', requireAdmin, adminLimiter, validatePagination, attemptController.getAllAttempts);

module.exports = router;