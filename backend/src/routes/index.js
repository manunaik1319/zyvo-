const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const studyHallRoutes = require('./studyHall.routes');
const bookingRoutes = require('./booking.routes');
const notificationRoutes = require('./notification.routes');
const ownerRoutes = require('./owner.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ZYVO API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/study-halls', studyHallRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/owner', ownerRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
