const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware.
 * Catches all errors thrown via next(error) and returns
 * a consistent JSON error response.
 */
function errorHandler(err, req, res, _next) {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.statusCode || (err.isOperational ? 400 : 500);

  // Build response
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'Internal server error' : err.message,
    },
  };

  // Add validation details if present
  if (err.details) {
    response.error.details = err.details;
  }

  // In development, include stack trace
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
