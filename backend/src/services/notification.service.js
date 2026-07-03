const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, type, title, body, data = null }) => {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, body, data },
    });
  } catch (error) {
    logger.error('Failed to create notification:', error.message);
  }
};

/**
 * Send booking confirmation notification
 */
const sendBookingConfirmation = async (userId, booking) => {
  return createNotification({
    userId,
    type: 'BOOKING_CONFIRMED',
    title: '🎉 Booking Confirmed!',
    body: `Your booking at ${booking.studyHall?.name || 'the study hall'} for seat ${booking.seat?.seatNumber || ''} has been confirmed.`,
    data: { bookingId: booking.id },
  });
};

/**
 * Send booking cancellation notification
 */
const sendBookingCancellation = async (userId, booking) => {
  return createNotification({
    userId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    body: `Your booking has been cancelled. Refund of ₹${booking.refundAmount} will be processed.`,
    data: { bookingId: booking.id },
  });
};

/**
 * Send payment success notification
 */
const sendPaymentSuccess = async (userId, amount, bookingId) => {
  return createNotification({
    userId,
    type: 'PAYMENT_SUCCESS',
    title: '💳 Payment Successful',
    body: `₹${amount} has been successfully charged for your booking.`,
    data: { bookingId },
  });
};

/**
 * Send session reminder notification
 */
const sendSessionReminder = async (userId, bookingId, minutesLeft) => {
  return createNotification({
    userId,
    type: 'BOOKING_REMINDER',
    title: '⏰ Session Reminder',
    body: `Your study session starts in ${minutesLeft} minutes. Get ready!`,
    data: { bookingId },
  });
};

/**
 * Get user notifications with pagination
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const skip = (page - 1) * limit;
  const where = { userId, ...(unreadOnly && { isRead: false }) };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Mark notifications as read
 */
const markAsRead = async (userId, notificationIds) => {
  return prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId, // Security: only own notifications
    },
    data: { isRead: true },
  });
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

module.exports = {
  createNotification,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendPaymentSuccess,
  sendSessionReminder,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
