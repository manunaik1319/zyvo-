const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.patch('/read', [
  body('notificationIds').isArray().withMessage('notificationIds must be an array'),
], validate, notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
