const express = require('express');
const testController = require('../controllers/testController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generalLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { validateCreateTest, validateUUID } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tests (users see active only, admins see all)
router.get('/', generalLimiter, testController.getAllTests);

// Get specific test
router.get('/:id', validateUUID('id'), generalLimiter, testController.getTestById);

// Admin only routes
router.use(requireAdmin, adminLimiter);

router.post('/', validateCreateTest, testController.createTest);
router.put('/:id', validateUUID('id'), validateCreateTest, testController.updateTest);
router.delete('/:id', validateUUID('id'), testController.deleteTest);

module.exports = router;