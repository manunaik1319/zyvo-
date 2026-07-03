const prisma = require('../config/database');
const {
  calculateBookingPrice,
  applyCouponDiscount,
  calculateDurationHours,
  doTimeSlotsOverlap,
  generateBookingQR,
} = require('../utils/helpers');
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const logger = require('../utils/logger');

/**
 * Create a new booking
 */
const createBooking = async (userId, bookingData) => {
  const { studyHallId, seatId, date, startTime, endTime, paymentMethod, couponCode, notes } = bookingData;

  // 1. Verify study hall exists and is active
  const studyHall = await prisma.studyHall.findUnique({ where: { id: studyHallId } });
  if (!studyHall || studyHall.status !== 'ACTIVE') {
    const err = new Error('Study hall not found or not available');
    err.statusCode = 404;
    throw err;
  }

  // 2. Verify seat belongs to this hall
  const seat = await prisma.seat.findFirst({ where: { id: seatId, studyHallId } });
  if (!seat) {
    const err = new Error('Seat not found in this study hall');
    err.statusCode = 404;
    throw err;
  }
  if (seat.status === 'MAINTENANCE') {
    const err = new Error('This seat is under maintenance');
    err.statusCode = 400;
    throw err;
  }

  // 3. Check for conflicting bookings on the same seat/date
  const bookingDate = new Date(date);
  const existingBookings = await prisma.booking.findMany({
    where: {
      seatId,
      date: { gte: new Date(bookingDate.setHours(0, 0, 0, 0)), lt: new Date(bookingDate.setHours(23, 59, 59, 999)) },
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
    },
  });

  const hasConflict = existingBookings.some((b) =>
    doTimeSlotsOverlap(startTime, endTime, b.startTime, b.endTime)
  );

  if (hasConflict) {
    const err = new Error('This seat is already booked for the selected time slot');
    err.statusCode = 409;
    throw err;
  }

  // 4. Check study hall opening hours
  if (startTime < studyHall.openingTime || endTime > studyHall.closingTime) {
    const err = new Error(`Study hall is open from ${studyHall.openingTime} to ${studyHall.closingTime}`);
    err.statusCode = 400;
    throw err;
  }

  // 5. Calculate pricing
  const durationHours = calculateDurationHours(startTime, endTime);
  if (durationHours < 0.5) {
    const err = new Error('Minimum booking duration is 30 minutes');
    err.statusCode = 400;
    throw err;
  }

  // 6. Apply coupon
  let discountAmount = 0;
  let validCoupon = null;
  if (couponCode) {
    validCoupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!validCoupon) {
      const err = new Error('Invalid or expired coupon code');
      err.statusCode = 400;
      throw err;
    }
    const baseAmountForCoupon = studyHall.pricePerHour * durationHours;
    discountAmount = applyCouponDiscount(validCoupon, baseAmountForCoupon);
  }

  const { baseAmount, taxAmount, totalAmount } = calculateBookingPrice(
    studyHall.pricePerHour,
    durationHours,
    discountAmount
  );

  // 7. Handle wallet payment
  if (paymentMethod === 'WALLET') {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < totalAmount) {
      const err = new Error(`Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${wallet?.balance || 0}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 8. Create booking in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    const qrCode = generateBookingQR(userId);

    const newBooking = await tx.booking.create({
      data: {
        userId,
        studyHallId,
        seatId,
        date: new Date(date),
        startTime,
        endTime,
        durationHours,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod,
        baseAmount,
        discountAmount,
        taxAmount,
        totalAmount,
        couponCode: couponCode?.toUpperCase() || null,
        qrCode,
        notes,
      },
      include: {
        studyHall: { select: { name: true } },
        seat: { select: { seatNumber: true } },
        user: true
      },
    });

    // Deduct wallet balance
    if (paymentMethod === 'WALLET') {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          bookingId: newBooking.id,
          type: 'DEBIT',
          amount: totalAmount,
          description: `Booking at ${studyHall.name}`,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - totalAmount,
        },
      });
    }

    // Increment coupon usage
    if (validCoupon) {
      await tx.coupon.update({
        where: { id: validCoupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Award reward points (1 point per ₹10 spent)
    const pointsEarned = Math.floor(totalAmount / 10);
    await tx.user.update({
      where: { id: userId },
      data: { rewardPoints: { increment: pointsEarned } },
    });

    return newBooking;
  });

  // 9. Send confirmation notification & email (non-blocking)
  notificationService.sendBookingConfirmation(userId, booking).catch((e) =>
    logger.error('Push notification failed:', e.message)
  );
  if (booking.user) {
    emailService.sendBookingConfirmationEmail(booking.user, booking).catch((e) =>
      logger.error('Confirmation email failed:', e.message)
    );
  }

  return booking;
};

/**
 * Cancel a booking
 */
const cancelBooking = async (userId, bookingId, reason) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { studyHall: { select: { name: true } }, user: true },
  });

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    const err = new Error('This booking cannot be cancelled');
    err.statusCode = 400;
    throw err;
  }

  // Calculate refund (50% refund if cancelled more than 2 hours before)
  const bookingDateTime = new Date(booking.date);
  const [sh, sm] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(sh, sm, 0, 0);
  const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  const refundAmount = hoursUntilBooking > 2 ? booking.totalAmount * 0.9 : booking.totalAmount * 0.5;

  const updatedBooking = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        refundAmount: parseFloat(refundAmount.toFixed(2)),
      },
    });

    // Process refund to wallet
    if (booking.paymentMethod === 'WALLET' || booking.paymentMethod === 'CARD') {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: refundAmount } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          bookingId,
          type: 'CREDIT',
          amount: refundAmount,
          description: `Refund for booking cancellation at ${booking.studyHall.name}`,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + refundAmount,
        },
      });
    }

    return cancelled;
  });

  notificationService.sendBookingCancellation(userId, updatedBooking).catch((e) =>
    logger.error('Push notification failed:', e.message)
  );
  if (booking.user) {
    emailService.sendBookingCancellationEmail(booking.user, updatedBooking).catch((e) =>
      logger.error('Cancellation email failed:', e.message)
    );
  }

  return { booking: updatedBooking, refundAmount: parseFloat(refundAmount.toFixed(2)) };
};

/**
 * Get all bookings for a user (with filters)
 */
const getUserBookings = async (userId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = { userId, ...(status && { status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        studyHall: { select: { name: true, city: true, coverImage: true, address: true } },
        seat: { select: { seatNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get a single booking by ID (user-scoped)
 */
const getBookingById = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      studyHall: true,
      seat: true,
      session: true,
    },
  });
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
};

module.exports = { createBooking, cancelBooking, getUserBookings, getBookingById };
