const { body } = require('express-validator');

const VALID_CATEGORIES = ['FOCUS_ROOM', 'CO_WORKING', 'MEETING_ROOM', 'CREATIVE_STUDIO', 'LIBRARY', 'PRIVATE_CABIN'];
const VALID_AMENITIES = ['wifi', 'ac', 'parking', 'locker', 'coffee', 'snacks', 'printer', 'whiteboard', 'projector', 'speaker', 'water', 'reading-lamp', 'art-supplies'];

const createStudyHallValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Study hall name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Pincode must be a 6-digit number'),

  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),

  body('pricePerHour')
    .notEmpty().withMessage('Price per hour is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  body('openingTime')
    .notEmpty().withMessage('Opening time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Opening time must be in HH:MM format'),

  body('closingTime')
    .notEmpty().withMessage('Closing time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Closing time must be in HH:MM format'),

  body('totalSeats')
    .notEmpty().withMessage('Total seats is required')
    .isInt({ min: 1, max: 500 }).withMessage('Total seats must be between 1 and 500'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array')
    .custom((amenities) => {
      const invalid = amenities.filter((a) => !VALID_AMENITIES.includes(a));
      if (invalid.length > 0) throw new Error(`Invalid amenities: ${invalid.join(', ')}`);
      return true;
    }),

  body('rules')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Rules cannot exceed 1000 characters'),

  body('isInstantBook')
    .optional()
    .isBoolean().withMessage('isInstantBook must be a boolean'),
];

const updateStudyHallValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('pricePerHour')
    .optional()
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  body('openingTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Opening time must be in HH:MM format'),

  body('closingTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Closing time must be in HH:MM format'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array'),

  body('rules')
    .optional()
    .trim()
    .isLength({ max: 1000 }),

  body('isInstantBook')
    .optional()
    .isBoolean(),
];

module.exports = {
  createStudyHallValidation,
  updateStudyHallValidation,
};
