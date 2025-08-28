const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin } = require('../middleware/validation');

const router = express.Router();

router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;