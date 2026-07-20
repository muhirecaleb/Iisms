const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware: Verify JWT access token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions || {},
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'));
    }
    logger.warn('JWT verification failed', { error: error.message });
    return next(new UnauthorizedError('Invalid access token'));
  }
}

module.exports = authMiddleware;
