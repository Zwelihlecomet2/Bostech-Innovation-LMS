const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, UserSession } = require('../models');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
  }

  async login(username, password) {
    try {
      // Find user by username or email
      const user = await User.findOne({
        where: {
          $or: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AppError('Account has been deactivated. Please contact an administrator.', 401);
      }

      // Check login attempts
      if (user.loginAttempts >= 3) {
        throw new AppError('Account locked due to too many failed attempts. Please contact an administrator.', 401);
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await user.update({
          loginAttempts: user.loginAttempts + 1,
          isActive: user.loginAttempts + 1 >= 3 ? false : user.isActive
        });

        const remainingAttempts = 3 - (user.loginAttempts + 1);
        if (remainingAttempts > 0) {
          throw new AppError(`Invalid credentials. ${remainingAttempts} attempts remaining.`, 401);
        } else {
          throw new AppError('Account has been deactivated due to too many failed attempts.', 401);
        }
      }

      // Reset login attempts and update last login
      await user.update({
        loginAttempts: 0,
        lastLogin: new Date()
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user.id);

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await UserSession.create({
        userId: user.id,
        refreshToken,
        expiresAt
      });

      logger.info(`User logged in successfully`, { userId: user.id, username: user.username });

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find session
      const session = await UserSession.findOne({
        where: {
          refreshToken,
          userId: decoded.userId,
          isActive: true,
          expiresAt: {
            $gt: new Date()
          }
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!session || !session.user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(session.userId);

      // Update session with new refresh token
      await session.update({
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return {
        user: session.user.toJSON(),
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh failed', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await UserSession.update(
          { isActive: false },
          { where: { refreshToken } }
        );
      }
      
      logger.info('User logged out successfully');
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  }

  async createDefaultAdmin() {
    try {
      const adminExists = await User.findOne({
        where: { role: 'admin' }
      });

      if (!adminExists) {
        const defaultAdmin = await User.create({
          username: 'admin',
          email: 'admin@bostech.com',
          password: 'admin123',
          role: 'admin',
          isActive: true
        });

        logger.info('Default admin created', { userId: defaultAdmin.id });
        return defaultAdmin;
      }

      return adminExists;
    } catch (error) {
      logger.error('Failed to create default admin', error);
      throw error;
    }
  }
}

module.exports = new AuthService();