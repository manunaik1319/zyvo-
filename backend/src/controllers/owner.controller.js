const prisma = require('../config/database');
const cloudinaryService = require('../services/cloudinary.service');
const { sendSuccess, sendCreated, sendNotFound, sendForbidden, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/helpers');

/**
 * GET /api/owner/study-halls
 * Owner: Get all their own study halls
 */
const getMyStudyHalls = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [studyHalls, total] = await Promise.all([
      prisma.studyHall.findMany({
        where: { ownerId: req.user.id },
        include: {
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studyHall.count({ where: { ownerId: req.user.id } }),
    ]);
    return sendPaginated(res, { data: studyHalls, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/owner/study-halls
 * Owner: Create a new study hall
 */
const createStudyHall = async (req, res, next) => {
  try {
    const { name, description, category, address, city, state, pincode,
      latitude, longitude, pricePerHour, openingTime, closingTime,
      totalSeats, amenities, rules, isInstantBook } = req.body;

    const studyHall = await prisma.$transaction(async (tx) => {
      const hall = await tx.studyHall.create({
        data: {
          ownerId: req.user.id,
          name, description, category, address, city, state, pincode,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          pricePerHour: parseFloat(pricePerHour),
          openingTime, closingTime,
          totalSeats: parseInt(totalSeats),
          amenities: amenities || [],
          rules,
          isInstantBook: isInstantBook ?? true,
          status: 'PENDING_APPROVAL',
        },
      });

      // Auto-generate seats
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = Math.ceil(totalSeats / rows.length);
      const seatData = [];
      let count = 0;
      for (const row of rows) {
        for (let col = 1; col <= seatsPerRow && count < totalSeats; col++) {
          seatData.push({ studyHallId: hall.id, seatNumber: `${row}${col}`, row, column: col });
          count++;
        }
      }
      await tx.seat.createMany({ data: seatData });

      return hall;
    });

    return sendCreated(res, { message: 'Study hall submitted for approval', data: studyHall });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/owner/study-halls/:id
 */
const updateStudyHall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hall = await prisma.studyHall.findUnique({ where: { id } });

    if (!hall) return sendNotFound(res, 'Study hall not found');
    if (hall.ownerId !== req.user.id) return sendForbidden(res, 'Not your study hall');

    const updated = await prisma.studyHall.update({
      where: { id },
      data: {
        ...req.body,
        ...(req.body.pricePerHour && { pricePerHour: parseFloat(req.body.pricePerHour) }),
      },
    });

    return sendSuccess(res, { message: 'Study hall updated', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/owner/study-halls/:id/images
 * Upload images for a study hall
 */
const uploadImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hall = await prisma.studyHall.findUnique({ where: { id } });
    if (!hall) return sendNotFound(res, 'Study hall not found');
    if (hall.ownerId !== req.user.id) return sendForbidden(res);

    if (!req.files || req.files.length === 0) {
      return sendSuccess(res, { message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      cloudinaryService.uploadSpaceImage(file.buffer, id)
    );
    const imageUrls = await Promise.all(uploadPromises);

    const updated = await prisma.studyHall.update({
      where: { id },
      data: {
        images: { push: imageUrls },
        coverImage: hall.coverImage || imageUrls[0],
      },
    });

    return sendSuccess(res, { message: 'Images uploaded', data: { images: updated.images } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/bookings
 * Owner: Get bookings for their study halls
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, studyHallId } = req.query;

    // Get owner's study hall IDs
    const myHalls = await prisma.studyHall.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    const hallIds = myHalls.map((h) => h.id);

    const where = {
      studyHallId: { in: hallIds },
      ...(studyHallId && { studyHallId }),
      ...(status && { status }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          studyHall: { select: { id: true, name: true } },
          seat: { select: { seatNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return sendPaginated(res, { data: bookings, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/owner/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const myHalls = await prisma.studyHall.findMany({
      where: { ownerId: req.user.id },
      select: { id: true, name: true },
    });
    const hallIds = myHalls.map((h) => h.id);

    const [totalBookings, totalRevenue, activeBookings, avgRating] = await Promise.all([
      prisma.booking.count({ where: { studyHallId: { in: hallIds } } }),
      prisma.booking.aggregate({
        where: { studyHallId: { in: hallIds }, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({
        where: { studyHallId: { in: hallIds }, status: { in: ['CONFIRMED', 'ACTIVE'] } },
      }),
      prisma.studyHall.aggregate({
        where: { ownerId: req.user.id },
        _avg: { rating: true },
      }),
    ]);

    return sendSuccess(res, {
      data: {
        totalStudyHalls: myHalls.length,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        activeBookings,
        avgRating: parseFloat((avgRating._avg.rating || 0).toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyStudyHalls, createStudyHall, updateStudyHall, uploadImages, getMyBookings, getAnalytics };
