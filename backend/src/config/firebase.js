const admin = require('firebase-admin');
const env = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  // Skip initialization if Firebase credentials are not configured
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    logger.warn('⚠️  Firebase credentials not configured. Firebase auth will be disabled.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    logger.info('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error.message);
    return null;
  }
};

/**
 * Verify a Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
  if (!firebaseApp) throw new Error('Firebase is not initialized');
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { initFirebase, verifyFirebaseToken, getFirebase: () => firebaseApp };
