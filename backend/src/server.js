const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');
const { initFirebase } = require('./config/firebase');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

// Ensure uploads/temp and uploads/logs directories exist
const dirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/temp'),
  path.join(__dirname, '../uploads/logs'),
];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Initialize external services
initFirebase();

const server = app.listen(env.PORT, async () => {
  logger.info('─────────────────────────────────────────────────');
  logger.info(`🌌 ZYVO API Server started`);
  logger.info(`🌍 Environment : ${env.NODE_ENV}`);
  logger.info(`🚀 Port        : ${env.PORT}`);
  logger.info(`📡 URL         : http://localhost:${env.PORT}`);
  logger.info(`🩺 Health      : http://localhost:${env.PORT}/api/health`);
  logger.info('─────────────────────────────────────────────────');

  // Test database connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    logger.warn('⚠️  Server running without database connection');
  }
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`\n📴 ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('🔌 HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('🗄️  Database disconnected');
    } catch (e) {
      logger.error('Error disconnecting from DB:', e.message);
    }
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('❌ Could not close gracefully. Forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
