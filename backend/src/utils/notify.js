const notificationService = require('../modules/notifications/notifications.service');
const notificationController = require('../modules/notifications/notifications.controller');
const logger = require('./logger');

/**
 * Helper: send a notification and push it via SSE to the recipient(s).
 * Wraps NotificationService.create/Bulk and pushes via controller.
 *
 * Usage:
 *   const { notify } = require('../../utils/notify');
 *
 *   // Notify a specific user
 *   await notify({ userId: 5, type: 'task_assigned', title: 'New task', message: '...' });
 *
 *   // Notify all admins
 *   await notifyAdmins({ type: 'student_added', title: 'New student', message: '...' });
 *
 *   // Notify by role
 *   await notifyRole({ roles: ['Teacher', 'Director'], type: 'system', title: 'System update', message: '...' });
 */

async function notify({ userId, type, title, message, moduleKey, entityId, createdBy }) {
  try {
    const id = await notificationService.create({ userId, type, title, message, moduleKey, entityId, createdBy });
    const notification = { notification_id: id, type, title, message, module_key: moduleKey, entity_id: entityId, created_by: createdBy, is_read: 0, created_at: new Date().toISOString() };

    // Push via SSE
    await notificationController.pushToUser(userId, notification);
    await notificationController.pushUnreadCount(userId);

    return id;
  } catch (err) {
    logger.error('Failed to send notification', { error: err.message, userId, type });
  }
}

async function notifyBulk({ userIds, type, title, message, moduleKey, entityId, createdBy }) {
  try {
    await notificationService.createBulk({ userIds, type, title, message, moduleKey, entityId, createdBy });

    // Push via SSE to each user
    const notification = { type, title, message, module_key: moduleKey, entity_id: entityId, created_by: createdBy, is_read: 0, created_at: new Date().toISOString() };
    for (const uid of userIds) {
      await notificationController.pushToUser(uid, notification);
      await notificationController.pushUnreadCount(uid);
    }
  } catch (err) {
    logger.error('Failed to send bulk notifications', { error: err.message, type, count: userIds?.length });
  }
}

async function notifyAdmins({ type, title, message, moduleKey, entityId, createdBy, roles = ['Administrator', 'Director'] }) {
  try {
    const placeholders = roles.map(() => '?').join(',');
    const db = require('../config/database');
    const [admins] = await db.query(
      `SELECT u.user_id FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE r.role_name IN (${placeholders}) AND u.deleted_at IS NULL AND u.status = 'active'`,
      roles
    );

    if (admins.length === 0) return;

    const userIds = admins.map((a) => a.user_id);
    await notifyBulk({ userIds, type, title, message, moduleKey, entityId, createdBy });
  } catch (err) {
    logger.error('Failed to notify admins', { error: err.message, type });
  }
}

async function notifyRole({ roles, type, title, message, moduleKey, entityId, createdBy }) {
  try {
    const placeholders = roles.map(() => '?').join(',');
    const db = require('../config/database');
    const [users] = await db.query(
      `SELECT u.user_id FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE r.role_name IN (${placeholders}) AND u.deleted_at IS NULL AND u.status = 'active'`,
      roles
    );

    if (users.length === 0) return;

    const userIds = users.map((u) => u.user_id);
    await notifyBulk({ userIds, type, title, message, moduleKey, entityId, createdBy });
  } catch (err) {
    logger.error('Failed to notify by role', { error: err.message, type, roles });
  }
}

module.exports = { notify, notifyBulk, notifyAdmins, notifyRole };
