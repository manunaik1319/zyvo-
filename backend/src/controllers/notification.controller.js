const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });
    return sendSuccess(res, {
      data: result.notifications,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        unreadCount: result.unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read
 * Mark specific notifications as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    await notificationService.markAsRead(req.user.id, notificationIds);
    return sendSuccess(res, { message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
