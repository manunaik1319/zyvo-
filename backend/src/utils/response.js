/**
 * Standardized API response helpers for ZYVO backend
 */

/**
 * Send a success response
 */
const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200, meta = null } = {}) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send a created (201) response
 */
const sendCreated = (res, { message = 'Created successfully', data = null } = {}) => {
  return sendSuccess(res, { message, data, statusCode: 201 });
};

/**
 * Send an error response
 */
const sendError = (res, { message = 'An error occurred', errors = null, statusCode = 500 } = {}) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send a 400 Bad Request response
 */
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, { message, errors, statusCode: 400 });
};

/**
 * Send a 401 Unauthorized response
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, { message, statusCode: 401 });
};

/**
 * Send a 403 Forbidden response
 */
const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, { message, statusCode: 403 });
};

/**
 * Send a 404 Not Found response
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, { message, statusCode: 404 });
};

/**
 * Send a 409 Conflict response
 */
const sendConflict = (res, message = 'Conflict') => {
  return sendError(res, { message, statusCode: 409 });
};

/**
 * Paginated response helper
 */
const sendPaginated = (res, { data, total, page, limit, message = 'Success' }) => {
  const totalPages = Math.ceil(total / limit);
  return sendSuccess(res, {
    message,
    data,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendPaginated,
};
