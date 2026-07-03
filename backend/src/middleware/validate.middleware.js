const { validationResult } = require('express-validator');
const { sendBadRequest } = require('../utils/response');

/**
 * Middleware: Run after express-validator rules to check for validation errors
 * Usage: router.post('/route', [...validationRules], validate, controllerFn)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendBadRequest(res, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = { validate };
