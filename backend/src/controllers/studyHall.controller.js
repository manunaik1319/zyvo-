const prisma = require('../config/database');
const cloudinaryService = require('../services/cloudinary.service');
const { sendSuccess, sendCreated, sendNotFound, sendPaginated } = require('../utils/response');
const { getPagination, parseBoolean } = require('../utils/helpers');

/**
 * GET /api/study-halls
 * Public: List all active study halls with filters
 */
const getStudyHalls = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const {
      city,
      category,
      minPrice,
      maxPrice,
      amenities,
      search,
      sortBy = 'rating',
      sortOrder = 'desc',
      instantBook,
    } = req.query;

    const where = {
      status: 'ACTIVE',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(category && { category }),
      ...(minPrice || maxPrice) && {
        pricePerHour: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      },
      ...(amenities && { amenities: { hasSome: amenities.split(',') } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(instantBook !== undefined && { isInstantBook: parseBoolean(instantBook) }),
    };

    const orderBy = { [sortBy === 'price' ? 'pricePerHour' : sortBy]: sortOrder };

    const [studyHalls, total] = await Promise.all([
      prisma.studyHall.findMany({
        where,
        select: {
          id: true, name: true, category: true, address: true, city: true,
          state: true, pricePerHour: true, rating: true, totalReviews: true,
          coverImage: true, amenities: true, totalSeats: true, isInstantBook: true,
          openingTime: true, closingTime: true, latitude: true, longitude: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.studyHall.count({ where }),
    ]);

    return sendPaginated(res, { data: studyHalls, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-halls/:id
 * Public: Get a single study hall with full details
 */
const getStudyHallById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studyHall = await prisma.studyHall.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        seats: { orderBy: [{ row: 'asc' }, { column: 'asc' }] },
        reviews: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });

    if (!studyHall || studyHall.status === 'INACTIVE') {
      return sendNotFound(res, 'Study hall not found');
    }

    return sendSuccess(res, { data: studyHall });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-halls/:id/seats
 * Public: Get seat availability for a date
 */
const getSeatAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const studyHall = await prisma.studyHall.findUnique({
      where: { id },
      include: { seats: { orderBy: [{ row: 'asc' }, { column: 'asc' }] } },
    });
    if (!studyHall) return sendNotFound(res, 'Study hall not found');

    // If date provided, overlay with bookings
    let bookedSeatIds = new Set();
    if (date) {
      const bookingDate = new Date(date);
      const bookings = await prisma.booking.findMany({
        where: {
          studyHallId: id,
          date: {
            gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
            lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
          },
          status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
        select: { seatId: true },
      });
      bookedSeatIds = new Set(bookings.map((b) => b.seatId));
    }

    const seatsWithAvailability = studyHall.seats.map((seat) => ({
      ...seat,
      isAvailable: seat.status === 'AVAILABLE' && !bookedSeatIds.has(seat.id),
    }));

    return sendSuccess(res, { data: seatsWithAvailability });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-halls/:id/reviews
 */
const getReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, skip } = getPagination(req.query);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { studyHallId: id },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { studyHallId: id } }),
    ]);

    return sendPaginated(res, { data: reviews, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/study-halls/:id/reviews
 * Authenticated: Submit a review
 */
const createReview = async (req, res, next) => {
  try {
    const { id: studyHallId } = req.params;
    const { rating, comment, tags } = req.body;
    const userId = req.user.id;

    // Verify user has a completed booking
    const completedBooking = await prisma.booking.findFirst({
      where: { userId, studyHallId, status: 'COMPLETED' },
    });

    const existingReview = await prisma.review.findFirst({ where: { userId, studyHallId } });
    if (existingReview) {
      const err = new Error('You have already reviewed this study hall');
      err.statusCode = 409;
      throw err;
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId,
          studyHallId,
          rating: parseInt(rating),
          comment,
          tags: tags || [],
          isVerified: !!completedBooking,
        },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });

      // Recalculate average rating
      const stats = await tx.review.aggregate({
        where: { studyHallId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.studyHall.update({
        where: { id: studyHallId },
        data: {
          rating: parseFloat((stats._avg.rating || 0).toFixed(1)),
          totalReviews: stats._count.rating,
        },
      });

      return newReview;
    });

    return sendCreated(res, { message: 'Review submitted successfully', data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudyHalls,
  getStudyHallById,
  getSeatAvailability,
  getReviews,
  createReview,
};
