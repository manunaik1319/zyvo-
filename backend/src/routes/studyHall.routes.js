const { Router } = require('express');
const studyHallController = require('../controllers/studyHall.controller');
const { optionalAuth, authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body } = require('express-validator');

const router = Router();

// Public routes (optionally authenticated for personalization)
router.get('/', optionalAuth, studyHallController.getStudyHalls);
router.get('/:id', optionalAuth, studyHallController.getStudyHallById);
router.get('/:id/seats', studyHallController.getSeatAvailability);
router.get('/:id/reviews', studyHallController.getReviews);

// Authenticated: Submit a review
router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('tags').optional().isArray(),
], validate, studyHallController.createReview);

module.exports = router;
