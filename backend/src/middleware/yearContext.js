const db = require('../config/database');

/**
 * Middleware: Attach academic year context to request.
 * Priority: Header → Query param → Body → Current year default
 */
async function yearContextMiddleware(req, res, next) {
  try {
    const yearId = req.headers['x-academic-year-id']
      || req.query.academicYearId
      || req.body?.academicYearId;

    if (yearId) {
      req.academicYearId = parseInt(yearId, 10);
    } else {
      // Default to current academic year
      const [rows] = await db.query(
        'SELECT year_id FROM academic_years WHERE is_current = 1 LIMIT 1'
      );
      req.academicYearId = rows[0]?.year_id || null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = yearContextMiddleware;
