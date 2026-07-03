const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
} = require('../validations/auth.validation');

const router = Router();

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', refreshTokenValidation, validate, authController.refreshToken);
router.post('/google', authController.googleLogin);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
