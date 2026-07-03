const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createBookingValidation,
  cancelBookingValidation,
} = require('../validations/booking.validation');
const { body } = require('express-validator');

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBookingValidation, validate, bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);

router.post('/:id/cancel', cancelBookingValidation, validate, bookingController.cancelBooking);
router.post('/:id/checkin', [
  body('qrCode').notEmpty().withMessage('QR code is required'),
], validate, bookingController.checkIn);
router.post('/:id/checkout', bookingController.checkOut);

module.exports = router;
