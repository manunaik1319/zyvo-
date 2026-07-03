const bookingService = require('../services/booking.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

/**
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    return sendCreated(res, { message: 'Booking created successfully', data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await bookingService.getUserBookings(req.user.id, { status, page, limit });
    return sendPaginated(res, { ...result, data: result.bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.user.id, req.params.id);
    return sendSuccess(res, { data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await bookingService.cancelBooking(req.user.id, req.params.id, reason);
    return sendSuccess(res, { message: 'Booking cancelled successfully', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/:id/checkin
 * Simulate QR check-in
 */
const checkIn = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const { id: bookingId } = req.params;

    const prisma = require('../config/database');
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user.id, status: 'CONFIRMED' },
    });

    if (!booking) {
      const err = new Error('Booking not found or not in confirmed state');
      err.statusCode = 404;
      throw err;
    }

    if (booking.qrCode !== qrCode) {
      const err = new Error('Invalid QR code');
      err.statusCode = 400;
      throw err;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'ACTIVE', checkInTime: new Date() },
      });
      await tx.session.create({
        data: { bookingId, userId: req.user.id },
      });
      return b;
    });

    return sendSuccess(res, { message: 'Check-in successful! Enjoy your study session.', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/:id/checkout
 */
const checkOut = async (req, res, next) => {
  try {
    const { id: bookingId } = req.params;
    const prisma = require('../config/database');

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user.id, status: 'ACTIVE' },
    });

    if (!booking) {
      const err = new Error('Active booking not found');
      err.statusCode = 404;
      throw err;
    }

    const checkOutTime = new Date();
    const sessionDuration = (checkOutTime - booking.checkInTime) / (1000 * 60 * 60);

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED', checkOutTime },
      });
      await tx.session.update({
        where: { bookingId },
        data: { endedAt: checkOutTime, isActive: false },
      });
      await tx.user.update({
        where: { id: req.user.id },
        data: { totalHours: { increment: sessionDuration } },
      });
      return b;
    });

    return sendSuccess(res, { message: 'Checked out successfully. Thank you!', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, checkIn, checkOut };
