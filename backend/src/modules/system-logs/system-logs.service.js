const db = require('../../config/database');

class SystemLogsService {
  /**
   * List logs with pagination, filters, and search.
   */
  async list({ page = 1, limit = 50, action, moduleKey, userId, search, startDate, endDate }) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];

    if (action) {
      where += ' AND l.action = ?';
      params.push(action);
    }
    if (moduleKey) {
      where += ' AND l.module_key = ?';
      params.push(moduleKey);
    }
    if (userId) {
      where += ' AND l.user_id = ?';
      params.push(userId);
    }
    if (search) {
      where += ' AND (l.description LIKE ? OR u.full_name LIKE ? OR u.username LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (startDate) {
      where += ' AND l.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      where += ' AND l.created_at <= ?';
      params.push(endDate);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM system_logs l LEFT JOIN users u ON l.user_id = u.user_id ${where}`,
      params
    );
    const total = countResult[0].total;

    const [rows] = await db.query(
      `SELECT l.*, u.full_name as user_name, u.username
       FROM system_logs l
       LEFT JOIN users u ON l.user_id = u.user_id
       ${where}
       ORDER BY l.created_at DESC
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
   * Get summary stats: total logs, today's logs, active users today.
   */
  async getStats() {
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM system_logs');
    const [todayResult] = await db.query(
      'SELECT COUNT(*) as total FROM system_logs WHERE DATE(created_at) = CURDATE()'
    );
    const [activeUsersResult] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as total FROM system_logs WHERE DATE(created_at) = CURDATE() AND user_id IS NOT NULL'
    );
    const [recentActions] = await db.query(
      `SELECT action, COUNT(*) as count
       FROM system_logs
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY action ORDER BY count DESC LIMIT 5`
    );

    return {
      totalLogs: totalResult[0].total,
      todayLogs: todayResult[0].total,
      activeUsers: activeUsersResult[0].total,
      recentActions,
    };
  }

  /**
   * Get distinct action types (for filter dropdown).
   */
  async getActionTypes() {
    const [rows] = await db.query(
      'SELECT DISTINCT action FROM system_logs ORDER BY action'
    );
    return rows.map((r) => r.action);
  }

  /**
   * Get distinct module keys (for filter dropdown).
   */
  async getModuleKeys() {
    const [rows] = await db.query(
      'SELECT DISTINCT module_key FROM system_logs ORDER BY module_key'
    );
    return rows.map((r) => r.module_key);
  }
}

module.exports = new SystemLogsService();
