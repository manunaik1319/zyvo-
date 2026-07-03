const prisma = require('../config/database');
const cloudinaryService = require('../services/cloudinary.service');
const { sendSuccess, sendNotFound, sendBadRequest, sendPaginated } = require('../utils/response');
const { sanitizeUser, getPagination } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        wallet: true,
        _count: { select: { bookings: true, reviews: true, favorites: true } },
      },
    });
    if (!user) return sendNotFound(res, 'User not found');
    return sendSuccess(res, { data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, university, bio } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, university, bio },
    });
    return sendSuccess(res, { message: 'Profile updated successfully', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendBadRequest(res, 'No image file provided');

    const avatarUrl = await cloudinaryService.uploadAvatar(req.file.buffer, req.user.id);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });
    return sendSuccess(res, { message: 'Avatar uploaded successfully', data: { avatarUrl } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return sendBadRequest(res, 'Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: newHash } });
    return sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/wallet
 */
const getWallet = async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    return sendSuccess(res, { data: wallet });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/wallet/transactions
 */
const getWalletTransactions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) return sendNotFound(res, 'Wallet not found');

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return sendPaginated(res, { data: transactions, total, page, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        studyHall: {
          select: {
            id: true, name: true, city: true, category: true,
            pricePerHour: true, rating: true, coverImage: true,
            totalReviews: true, amenities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, { data: favorites });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/favorites/:studyHallId
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { studyHallId } = req.params;
    const existing = await prisma.favorite.findFirst({
      where: { userId: req.user.id, studyHallId },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return sendSuccess(res, { message: 'Removed from favorites', data: { isFavorite: false } });
    } else {
      await prisma.favorite.create({ data: { userId: req.user.id, studyHallId } });
      return sendSuccess(res, { message: 'Added to favorites', data: { isFavorite: true } });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats
 */
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [totalBookings, completedBookings, totalSpent, user] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        where: { userId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { rewardPoints: true, totalHours: true },
      }),
    ]);

    return sendSuccess(res, {
      data: {
        totalBookings,
        completedBookings,
        totalSpent: totalSpent._sum.totalAmount || 0,
        rewardPoints: user?.rewardPoints || 0,
        totalHours: user?.totalHours || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getWallet,
  getWalletTransactions,
  getFavorites,
  toggleFavorite,
  getUserStats,
};
