const { User } = require('../models');
const { AppError, catchAsync } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;
  
  const whereClause = {};
  
  // Exclude admin users from regular user list
  whereClause.role = 'user';
  
  if (search) {
    whereClause[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  if (isActive !== undefined) {
    whereClause.isActive = isActive === 'true';
  }

  const offset = (page - 1) * limit;
  
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['passwordHash'] }
  });

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: offset + users.length < count,
        hasPrev: page > 1
      }
    }
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] }
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: { user }
  });
});

const createUser = catchAsync(async (req, res) => {
  const { username, email, password, isActive = true } = req.body;
  
  // Check if username or email already exists
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email }
      ]
    }
  });
  
  if (existingUser) {
    const field = existingUser.username === username ? 'Username' : 'Email';
    throw new AppError(`${field} already exists`, 400);
  }
  
  const user = await User.create({
    username,
    email,
    password, // Will be hashed by the model hook
    role: 'user',
    isActive
  });
  
  logger.info('User created successfully', { 
    userId: user.id, 
    createdBy: req.user.id 
  });
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user }
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { username, email, password, isActive } = req.body;
  
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check for duplicate username/email (excluding current user)
  if (username || email) {
    const whereClause = {
      id: { [Op.ne]: id }
    };
    
    const orConditions = [];
    if (username) orConditions.push({ username });
    if (email) orConditions.push({ email });
    
    whereClause[Op.or] = orConditions;
    
    const existingUser = await User.findOne({ where: whereClause });
    
    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      throw new AppError(`${field} already exists`, 400);
    }
  }
  
  const updateData = {};
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined) updateData.password = password;
  if (isActive !== undefined) updateData.isActive = isActive;
  
  // Reset login attempts if activating user
  if (isActive === true && !user.isActive) {
    updateData.loginAttempts = 0;
  }
  
  await user.update(updateData);
  
  logger.info('User updated successfully', { 
    userId: user.id, 
    updatedBy: req.user.id 
  });
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  if (user.role === 'admin') {
    throw new AppError('Cannot delete admin user', 400);
  }
  
  await user.destroy();
  
  logger.info('User deleted successfully', { 
    userId: id, 
    deletedBy: req.user.id 
  });
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  if (user.role === 'admin') {
    throw new AppError('Cannot modify admin user status', 400);
  }
  
  const newStatus = !user.isActive;
  await user.update({ 
    isActive: newStatus,
    loginAttempts: newStatus ? 0 : user.loginAttempts // Reset attempts if activating
  });
  
  logger.info('User status toggled', { 
    userId: id, 
    newStatus, 
    updatedBy: req.user.id 
  });
  
  res.status(200).json({
    success: true,
    message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};