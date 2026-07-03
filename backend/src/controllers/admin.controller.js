const prisma = require('../config/database');
const { sendSuccess, sendNotFound, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/helpers');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalOwners, totalStudyHalls, totalBookings,
      totalRevenue, pendingApprovals, activeBookings, totalCoupons,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.studyHall.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.studyHall.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
      prisma.coupon.count({ where: { isActive: true } }),
    ]);

    return sendSuccess(res, {
      data: {
        totalUsers, totalOwners, totalStudyHalls, totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingApprovals, activeBookings, totalCoupons,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { role, search } = req.query;

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          isActive: true, isVerified: true, rewardPoints: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return sendPaginated(res, { data: users, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/toggle-active
 */
const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendNotFound(res, 'User not found');

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return sendSuccess(res, {
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: updated.id, isActive: updated.isActive },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/study-halls
 */
const getStudyHalls = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [halls, total] = await Promise.all([
      prisma.studyHall.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studyHall.count({ where }),
    ]);

    return sendPaginated(res, { data: halls, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/study-halls/:id/approve
 */
const approveStudyHall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hall = await prisma.studyHall.findUnique({
      where: { id },
      include: { owner: true }
    });
    if (!hall) return sendNotFound(res, 'Study hall not found');

    const updated = await prisma.studyHall.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    if (hall.owner) {
      emailService.sendOwnerApprovalEmail(hall.owner, updated).catch((e) => {
        logger.error('Failed to send owner approval email:', e.stack || e.message);
      });
    }

    return sendSuccess(res, { message: 'Study hall approved successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/study-halls/:id/reject
 */
const rejectStudyHall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await prisma.studyHall.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    return sendSuccess(res, { message: 'Study hall rejected', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/bookings
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const where = { ...(status && { status }) };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
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
 * POST /api/admin/coupons
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return sendSuccess(res, { message: 'Coupon created', data: coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/coupons
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, { data: coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/coupons/:id/toggle
 */
const toggleCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return sendNotFound(res, 'Coupon not found');

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
    return sendSuccess(res, { message: `Coupon ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  toggleUserActive,
  getStudyHalls,
  approveStudyHall,
  rejectStudyHall,
  getAllBookings,
  createCoupon,
  getCoupons,
  toggleCoupon,
};
