const db = require('../../config/database');
const bcrypt = require('bcrypt');
const { notifyAdmins, notify } = require('../../utils/notify');

class UserService {
  async list({ page = 1, limit = 20, search, role, status }) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;
    let query = `FROM users u LEFT JOIN roles r ON u.role_id = r.role_id WHERE u.deleted_at IS NULL`;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (role) { query += ' AND u.role_id = ?'; params.push(role); }
    if (status) { query += ' AND u.status = ?'; params.push(status); }

    const [countResult] = await db.query(`SELECT COUNT(*) as total ${query}`, params);
    const total = countResult[0].total;

    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.status, u.role_id,
              r.role_name, u.created_at, u.last_login_at
       ${query} ORDER BY u.full_name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id) {
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.status, u.role_id,
              r.role_name, u.created_at, u.last_login_at
       FROM users u LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  async create({ username, fullName, email, phone, password, roleId, status }) {
    // Check duplicates
    const [[existing]] = await db.query(
      'SELECT user_id FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL',
      [username, email]
    );
    if (existing) {
      const err = new Error('Username or email already exists');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      `INSERT INTO users (username, full_name, email, phone, password_hash, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, fullName, email, phone || null, passwordHash, roleId, status || 'active']
    );

    // Notify admins about new user creation
    await notifyAdmins({
      type: 'user_created',
      title: 'New user account created',
      message: `User "${fullName}" (${username}) was created with role "${roleId}"`,
      moduleKey: 'user-management',
      entityId: result.insertId,
      createdBy: result.insertId,
    });

    return { userId: result.insertId, username };
  }

  async update(id, { fullName, email, phone, roleId, status, password }) {
    const [[existing]] = await db.query(
      'SELECT user_id FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]
    );
    if (!existing) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Check email/username duplicates
    if (email) {
      const [[dup]] = await db.query(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ? AND deleted_at IS NULL',
        [email, id]
      );
      if (dup) {
        const err = new Error('Email already in use');
        err.statusCode = 409;
        throw err;
      }
    }

    const fields = [];
    const params = [];

    if (fullName) { fields.push('full_name = ?'); params.push(fullName); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone || null); }
    if (roleId) { fields.push('role_id = ?'); params.push(roleId); }
    if (status) { fields.push('status = ?'); params.push(status); }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      fields.push('password_hash = ?'); params.push(passwordHash);
    }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      params.push(id);
      await db.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ? AND deleted_at IS NULL`, params);

      // Notify user about role change
      if (roleId) {
        const [role] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [roleId]);
        if (role.length > 0) {
          await notify({
            userId: parseInt(id),
            type: 'role_changed',
            title: 'Your role was updated',
            message: `Your role has been changed to "${role[0].role_name}".`,
            moduleKey: 'user-management',
            entityId: parseInt(id),
          });
        }
      }
      // Notify user about password reset
      if (password) {
        await notify({
          userId: parseInt(id),
          type: 'warning',
          title: 'Password was reset',
          message: 'Your password was reset by an administrator. Please log in and change your password.',
          moduleKey: 'user-management',
          entityId: parseInt(id),
        });
      }
    }

    return { userId: parseInt(id) };
  }

  async remove(id) {
    const [[existing]] = await db.query(
      'SELECT user_id FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]
    );
    if (!existing) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    await db.query('UPDATE users SET deleted_at = NOW() WHERE user_id = ?', [id]);
    return { userId: parseInt(id) };
  }

  async listRoles() {
    const [rows] = await db.query('SELECT role_id, role_name FROM roles ORDER BY role_id');
    return rows;
  }

  async resetPassword(id, newPassword) {
    const [[existing]] = await db.query(
      'SELECT user_id FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]
    );
    if (!existing) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?', [passwordHash, id]);
    return { userId: parseInt(id) };
  }
}

module.exports = new UserService();
