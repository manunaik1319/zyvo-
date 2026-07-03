const tokenService = require('../services/token.service');
const { sendUnauthorized, sendForbidden } = require('../utils/response');
const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware: Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    // Fetch fresh user from DB to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        avatarUrl: true,
      },
    });

    if (!user) return sendUnauthorized(res, 'User not found');
    if (!user.isActive) return sendForbidden(res, 'Your account has been deactivated');

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Access token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid access token');
    }
    logger.error('Auth middleware error:', error);
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware factory: Require specific roles
 * @param {...string} roles - e.g. authorize('ADMIN'), authorize('OWNER', 'ADMIN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendUnauthorized(res);
    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

/**
 * Middleware: Optional authentication (attaches user if token present, continues anyway)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (user && user.isActive) req.user = user;
  } catch (_) {
    // silently fail
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
