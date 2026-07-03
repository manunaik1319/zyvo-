const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('../utils/logger');

let transporter = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
  logger.info('✅ Email SMTP Transporter configured successfully');
} else {
  logger.warn('⚠️  Email credentials not configured in env. Emails will be mock-logged.');
}

module.exports = transporter;
