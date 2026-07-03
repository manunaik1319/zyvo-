const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { generateReferralCode, sanitizeUser } = require('../utils/helpers');
const { sendUnauthorized } = require('../utils/response');
const emailService = require('./email.service');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async ({ name, email, password, phone, referralCode: usedReferralCode }) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const referralCode = generateReferralCode(name);

  // Resolve referrer
  let referredById = null;
  if (usedReferralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: usedReferralCode } });
    if (referrer) referredById = referrer.id;
  }

  // Create user + wallet in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        referralCode,
        referredById,
        role: 'USER',
      },
    });

    // Create wallet with welcome bonus
    await tx.wallet.create({
      data: {
        userId: newUser.id,
        balance: referredById ? 50 : 0, // ₹50 welcome bonus if referred
      },
    });

    // Send welcome notification
    await tx.notification.create({
      data: {
        userId: newUser.id,
        type: 'SYSTEM',
        title: 'Welcome to ZYVO! 🎉',
        body: 'Start exploring study spaces near you and book your first session today.',
      },
    });

    return newUser;
  });

  const tokens = generateTokenPair(user);

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(user).catch((e) => {
    logger.error('Failed to send welcome email:', e.message);
  });

  return { user: sanitizeUser(user), tokens };
};

/**
 * Login with email/password
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact support.');
    err.statusCode = 403;
    throw err;
  }

  const tokens = generateTokenPair(user);
  return { user: sanitizeUser(user), tokens };
};

/**
 * Refresh access token using a valid refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (e) {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.isActive) {
    const err = new Error('User not found or account deactivated');
    err.statusCode = 401;
    throw err;
  }

  const tokens = generateTokenPair(user);
  return { tokens };
};

/**
 * Get current authenticated user profile
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
};

const googleClient = require('../config/google');
const env = require('../config/env');

/**
 * Login or Register a user via Google ID Token
 */
const googleLogin = async (idToken) => {
  if (!googleClient) {
    const err = new Error('Google OAuth is not configured on the server');
    err.statusCode = 501;
    throw err;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      const err = new Error('Invalid Google ID Token payload');
      err.statusCode = 400;
      throw err;
    }

    const { email, name, picture } = payload;

    // Check if user exists by email
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // User doesn't exist, sign up via Google
      const referralCode = generateReferralCode(name);
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: name || 'Google User',
            email,
            avatarUrl: picture || null,
            referralCode,
            role: 'USER',
            isVerified: true,
          },
        });

        // Create wallet
        await tx.wallet.create({
          data: {
            userId: newUser.id,
            balance: 0,
          },
        });

        // Send welcome notification
        await tx.notification.create({
          data: {
            userId: newUser.id,
            type: 'SYSTEM',
            title: 'Welcome to ZYVO! 🎉',
            body: 'Start exploring study spaces near you and book your first session today.',
          },
        });

        return newUser;
      });

      // Send welcome email (non-blocking)
      emailService.sendWelcomeEmail(user).catch((e) => {
        logger.error('Failed to send welcome email for Google signup:', e.message);
      });
    }

    if (!user.isActive) {
      const err = new Error('Your account has been deactivated. Please contact support.');
      err.statusCode = 403;
      throw err;
    }

    const tokens = generateTokenPair(user);
    return { user: sanitizeUser(user), tokens };
  } catch (error) {
    logger.error('Google Sign-In verification error:', error);
    const err = new Error(error.message || 'Google Sign-In verification failed');
    err.statusCode = error.statusCode || 401;
    throw err;
  }
};

module.exports = { register, login, refreshAccessToken, getMe, googleLogin };
