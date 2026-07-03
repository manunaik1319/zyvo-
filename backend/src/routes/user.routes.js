const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const { changePasswordValidation } = require('../validations/auth.validation');

const router = Router();

// All user routes are protected
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', uploadAvatar, userController.uploadAvatar);
router.patch('/password', changePasswordValidation, validate, userController.changePassword);

router.get('/wallet', userController.getWallet);
router.get('/wallet/transactions', userController.getWalletTransactions);

router.get('/favorites', userController.getFavorites);
router.post('/favorites/:studyHallId', userController.toggleFavorite);

router.get('/stats', userController.getUserStats);

module.exports = router;
