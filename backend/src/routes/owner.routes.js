const { Router } = require('express');
const ownerController = require('../controllers/owner.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadSpaceImages } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createStudyHallValidation,
  updateStudyHallValidation,
} = require('../validations/studyHall.validation');

const router = Router();

// All owner routes require authentication + OWNER or ADMIN role
router.use(authenticate, authorize('OWNER', 'ADMIN'));

router.get('/study-halls', ownerController.getMyStudyHalls);
router.post('/study-halls', createStudyHallValidation, validate, ownerController.createStudyHall);
router.patch('/study-halls/:id', updateStudyHallValidation, validate, ownerController.updateStudyHall);
router.post('/study-halls/:id/images', uploadSpaceImages, ownerController.uploadImages);

router.get('/bookings', ownerController.getMyBookings);
router.get('/analytics', ownerController.getAnalytics);

module.exports = router;
