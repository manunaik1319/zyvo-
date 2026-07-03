const { OAuth2Client } = require('google-auth-library');
const env = require('./env');
const logger = require('../utils/logger');

let client = null;

if (env.GOOGLE_CLIENT_ID) {
  client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );
  logger.info('✅ Google OAuth Client configured');
} else {
  logger.warn('⚠️  Google Client ID/Secret not configured. Google auth will be disabled.');
}

module.exports = client;
