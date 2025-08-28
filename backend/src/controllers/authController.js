const authService = require('../services/authService');
const { catchAsync } = require('../utils/errorHandler');

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.login(username, password);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshToken(refreshToken);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  
  await authService.logout(refreshToken);
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = {
  login,
  refreshToken,
  logout,
  getProfile
};