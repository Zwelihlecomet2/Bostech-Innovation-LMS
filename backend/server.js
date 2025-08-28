const app = require('./src/app');
const { sequelize } = require('./src/models');
const { connectRedis } = require('./src/config/redis');
const authService = require('./src/services/authService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database synchronized successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connection established successfully');

    // Create default admin user
    await authService.createDefaultAdmin();
    logger.info('Default admin user ensured');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();