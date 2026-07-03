const authService = require('../services/auth.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendCreated(res, {
      message: 'Account created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, {
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, { message: 'Token refreshed', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { message: 'Profile fetched', data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * (Client-side: just discard the token. Server-side: no-op unless using token blacklist)
 */
const logout = async (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
};

/**
 * POST /api/auth/google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID Token (idToken) is required' });
    }
    const result = await authService.googleLogin(idToken);
    return sendSuccess(res, {
      message: 'Google login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, getMe, logout, googleLogin };
