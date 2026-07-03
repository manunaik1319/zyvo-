const jwt = require('../utils/jwt');

/**
 * Generate auth tokens for user
 * @param {Object} user - User record
 */
const generateAuthTokens = (user) => {
  return jwt.generateTokenPair(user);
};

/**
 * Verify access token
 * @param {string} token
 */
const verifyAccessToken = (token) => {
  return jwt.verifyAccessToken(token);
};

/**
 * Verify refresh token
 * @param {string} token
 */
const verifyRefreshToken = (token) => {
  return jwt.verifyRefreshToken(token);
};

/**
 * Generate single access token for custom payloads or refreshes
 * @param {Object} payload
 */
const generateAccessToken = (payload) => {
  return jwt.generateAccessToken(payload);
};

module.exports = {
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
};
