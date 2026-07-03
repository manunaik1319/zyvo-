const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);

// Study Halls
router.get('/study-halls', adminController.getStudyHalls);
router.patch('/study-halls/:id/approve', adminController.approveStudyHall);
router.patch('/study-halls/:id/reject', adminController.rejectStudyHall);

// Bookings
router.get('/bookings', adminController.getAllBookings);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.patch('/coupons/:id/toggle', adminController.toggleCoupon);

module.exports = router;
