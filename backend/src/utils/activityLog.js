const db = require('../config/database');
const logger = require('./logger');

/**
 * Log an activity to the system_logs table.
 *
 * Usage:
 *   const { logActivity } = require('../../utils/activityLog');
 *
 *   await logActivity({
 *     userId: req.user.id,
 *     action: 'create',
 *     moduleKey: 'students',
 *     entityId: studentId,
 *     entityType: 'student',
 *     description: 'Enrolled student John Doe (INT-26-001)',
 *     ipAddress: req.ip,
 *     userAgent: req.headers['user-agent'],
 *   });
 */
async function logActivity({ userId, action, moduleKey, entityId, entityType, description, ipAddress, userAgent, oldValues, newValues }) {
  try {
    await db.query(
      `INSERT INTO system_logs (user_id, action, module_key, entity_id, entity_type, description, ip_address, user_agent, old_values, new_values)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        moduleKey,
        entityId || null,
        entityType || null,
        description || null,
        ipAddress || null,
        userAgent || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
      ]
    );
  } catch (err) {
    // Don't let logging failures break the main operation
    logger.error('Failed to write activity log', { error: err.message, action, moduleKey });
  }
}

module.exports = { logActivity };
