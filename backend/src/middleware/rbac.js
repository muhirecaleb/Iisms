const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware: Check user has required module permission(s).
 * Usage: rbacMiddleware('students', ['canView'])
 *        rbacMiddleware('finance')  // defaults to ['canView']
 */
function rbacMiddleware(moduleKey, operations = ['canView']) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || {};
    const modulePerms = permissions[moduleKey];

    if (!modulePerms) {
      return next(
        new ForbiddenError(`Access denied: "${moduleKey}" module not available to your role`)
      );
    }

    for (const op of operations) {
      if (!modulePerms[op]) {
        return next(
          new ForbiddenError(
            `Access denied: "${op}" operation not permitted on "${moduleKey}"`
          )
        );
      }
    }

    next();
  };
}

module.exports = rbacMiddleware;
