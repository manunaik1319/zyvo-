const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate an access token
 * @param {Object} payload - { id, email, role }
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

/**
 * Generate a refresh token
 * @param {Object} payload - { id }
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify an access token
 * @param {string} token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Verify a refresh token
 * @param {string} token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object from DB
 */
const generateTokenPair = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ id: user.id }),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
