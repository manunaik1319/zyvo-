const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Global error handler middleware
 * Must be registered LAST in Express middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error in development
  if (env.NODE_ENV !== 'production') {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  } else {
    logger.error(`${err.name}: ${err.message}`);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      field: err.meta?.target?.join(', '),
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Related record not found',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Multer / file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size too large' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
