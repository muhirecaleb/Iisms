const db = require('../../config/database');
const logger = require('../../utils/logger');

class NotificationService {
  /**
   * List notifications for a user with pagination and filters.
   */
  async list({ userId, page = 1, limit = 20, isRead, type }) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    let where = 'WHERE n.user_id = ?';
    const params = [userId];

    if (isRead !== undefined) {
      where += ' AND is_read = ?';
      params.push(isRead === 'true' || isRead === true ? 1 : 0);
    }
    if (type) {
      where += ' AND type = ?';
      params.push(type);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM notifications n ${where}`,
      params
    );
    const total = countResult[0].total;

    const [rows] = await db.query(
      `SELECT n.*, u.full_name as created_by_name
       FROM notifications n
       LEFT JOIN users u ON n.created_by = u.user_id
       ${where}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread count for a user.
   */
  async getUnreadCount(userId, moduleKey) {
    let query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
    const params = [userId];
    if (moduleKey) {
      query += ' AND module_key = ?';
      params.push(moduleKey);
    }
    const [result] = await db.query(query, params);
    return result[0].count;
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId, userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return result.affectedRows;
  }

  /**
   * Delete a single notification.
   */
  async delete(notificationId, userId) {
    const [result] = await db.query(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Create a notification for a single user.
   */
  async create({ userId, type, title, message, moduleKey, entityId, createdBy }) {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, module_key, entity_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, moduleKey || null, entityId || null, createdBy || null]
    );
    return result.insertId;
  }

  /**
   * Create notifications for multiple users at once.
   */
  async createBulk({ userIds, type, title, message, moduleKey, entityId, createdBy }) {
    if (!userIds || userIds.length === 0) return [];

    const values = userIds.map((uid) => [uid, type, title, message, moduleKey || null, entityId || null, createdBy || null]);
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, module_key, entity_id, created_by)
       VALUES ?`,
      [values]
    );
    return result;
  }

  /**
   * Notify all Administrators (and optionally Directors).
   */
  async notifyAdmins({ type, title, message, moduleKey, entityId, createdBy, roles = ['Administrator', 'Director'] }) {
    const placeholders = roles.map(() => '?').join(',');
    const [admins] = await db.query(
      `SELECT u.user_id
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE r.role_name IN (${placeholders}) AND u.deleted_at IS NULL AND u.status = 'active'`,
      roles
    );

    if (admins.length === 0) return;

    const userIds = admins.map((a) => a.user_id);
    return this.createBulk({ userIds, type, title, message, moduleKey, entityId, createdBy });
  }

  /**
   * Notify specific users by role.
   */
  async notifyByRole({ type, title, message, moduleKey, entityId, createdBy, roles }) {
    if (!roles || roles.length === 0) return;
    const placeholders = roles.map(() => '?').join(',');
    const [users] = await db.query(
      `SELECT u.user_id
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE r.role_name IN (${placeholders}) AND u.deleted_at IS NULL AND u.status = 'active'`,
      roles
    );

    if (users.length === 0) return;

    const userIds = users.map((u) => u.user_id);
    return this.createBulk({ userIds, type, title, message, moduleKey, entityId, createdBy });
  }
}

module.exports = new NotificationService();
