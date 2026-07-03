const { body, query } = require('express-validator');

const createBookingValidation = [
  body('studyHallId')
    .notEmpty().withMessage('Study hall ID is required')
    .isUUID().withMessage('Invalid study hall ID'),

  body('seatId')
    .notEmpty().withMessage('Seat ID is required')
    .isUUID().withMessage('Invalid seat ID'),

  body('date')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Date must be in ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('Booking date cannot be in the past');
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format')
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['WALLET', 'CARD', 'UPI', 'NET_BANKING']).withMessage('Invalid payment method'),

  body('couponCode')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Coupon code too long'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const cancelBookingValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Cancellation reason cannot exceed 300 characters'),
];

const rescheduleBookingValidation = [
  body('date')
    .notEmpty().withMessage('New booking date is required')
    .isISO8601().withMessage('Date must be in ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('Booking date cannot be in the past');
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('New start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .notEmpty().withMessage('New end time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format'),

  body('seatId')
    .optional()
    .isUUID().withMessage('Invalid seat ID'),
];

module.exports = {
  createBookingValidation,
  cancelBookingValidation,
  rescheduleBookingValidation,
};
