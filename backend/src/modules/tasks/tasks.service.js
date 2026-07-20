const db = require('../../config/database');

class TaskService {
  async list({ page = 1, limit = 20, status, priority, assignedTo, moduleKey, userId, role }) {
    let query = 'SELECT t.*, u1.full_name as assigned_to_name, u2.full_name as assigned_by_name FROM tasks t LEFT JOIN users u1 ON t.assigned_to = u1.user_id LEFT JOIN users u2 ON t.assigned_by = u2.user_id WHERE 1=1';
    const params = [];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (moduleKey) { query += ' AND t.module_key = ?'; params.push(moduleKey); }
    const isManager = ['Administrator', 'Director'].includes(role);
    if (assignedTo) { query += ' AND t.assigned_to = ?'; params.push(assignedTo); }
    else if (!isManager) { query += ' AND (t.assigned_to = ? OR t.assigned_by = ?)'; params.push(userId, userId); }
    const offset = (page - 1) * limit;
    const [rows] = await db.query(query + ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?', [...params, limit, offset]);
    return { data: rows, pagination: { page, limit, total: rows.length, totalPages: Math.ceil(rows.length / limit) } };
  }

  async create(data, userId) {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, module_key, assigned_to, assigned_by, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [data.title, data.description, data.moduleKey, data.assignedTo, userId, data.dueDate, data.priority || 'normal']
    );
    return { taskId: result.insertId };
  }

  async update(id, data, userId) {
    const fields = []; const params = [];
    for (const [k, v] of Object.entries(data)) { fields.push(`${k} = ?`); params.push(v); }
    if (data.status === 'completed') { fields.push('completed_at = NOW()'); }
    params.push(id);
    await db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE task_id = ?`, params);
    return { taskId: parseInt(id) };
  }

  async delete(id, userId) { await db.query('DELETE FROM tasks WHERE task_id = ?', [id]); return true; }

  async updateStatus(id, status, userId) {
    const completedAt = status === 'completed' ? ' NOW()' : ' NULL';
    await db.query(`UPDATE tasks SET status = ?, completed_at = ${completedAt} WHERE task_id = ?`, [status, id]);
    return { taskId: parseInt(id), status };
  }
}

module.exports = new TaskService();
