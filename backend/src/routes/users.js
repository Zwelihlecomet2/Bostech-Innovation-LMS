const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateUUID, 
  validatePagination 
} = require('../middleware/validation');

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticateToken, requireAdmin, adminLimiter);

router.get('/', validatePagination, userController.getAllUsers);
router.get('/:id', validateUUID('id'), userController.getUserById);
router.post('/', validateCreateUser, userController.createUser);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.delete('/:id', validateUUID('id'), userController.deleteUser);
router.put('/:id/toggle-status', validateUUID('id'), userController.toggleUserStatus);

module.exports = router;