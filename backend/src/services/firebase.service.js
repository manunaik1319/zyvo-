const admin = require('firebase-admin');
const { getFirebase } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Send a push notification to a single device token via FCM
 * @param {string} token - Device registration token
 * @param {Object} notification - { title, body, data }
 */
const sendToDevice = async (token, { title, body, data = {} }) => {
  const app = getFirebase();
  if (!app) {
    logger.warn(`[Firebase Service - MOCK] Notification to token: ${token} | Title: ${title} | Body: ${body}`);
    return { success: true, messageId: 'mock-msg-id-' + Date.now() };
  }

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };
    const response = await admin.messaging().send(message);
    logger.info(`FCM notification sent to device successfully: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error(`FCM notification sending failed to device: ${error.message}`);
    throw error;
  }
};

/**
 * Send a push notification to multiple device tokens via FCM multicast
 * @param {string[]} tokens - Array of device registration tokens
 * @param {Object} notification - { title, body, data }
 */
const sendToDevices = async (tokens, { title, body, data = {} }) => {
  const app = getFirebase();
  if (!app) {
    logger.warn(`[Firebase Service - MOCK] Multicast to ${tokens.length} tokens | Title: ${title} | Body: ${body}`);
    return { success: true, successCount: tokens.length, failureCount: 0 };
  }

  if (!tokens || tokens.length === 0) {
    return { success: true, successCount: 0, failureCount: 0 };
  }

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info(`FCM multicast sent successfully. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    return response;
  } catch (error) {
    logger.error(`FCM multicast sending failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendToDevice,
  sendToDevices,
};
