const db = require('../../config/database');
const { notify } = require('../../utils/notify');
const { logActivity } = require('../../utils/activityLog');

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

    // Notify the assigned user
    if (data.assignedTo && data.assignedTo !== userId) {
      const [creator] = await db.query('SELECT full_name FROM users WHERE user_id = ?', [userId]);
      const creatorName = creator.length > 0 ? creator[0].full_name : 'Someone';
      const priorityLabel = data.priority === 'urgent' ? '🔴 Urgent' : data.priority === 'high' ? '🟠 High' : '';
      const dueLabel = data.dueDate ? ` (due ${new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : '';
      await notify({
        userId: data.assignedTo,
        type: 'task_assigned',
        title: 'New task assigned',
        message: `${creatorName} assigned you "${data.title}"${priorityLabel}${dueLabel}`,
        moduleKey: 'tasks',
        entityId: result.insertId,
        createdBy: userId,
      });
    }
    await logActivity({ userId, action: 'create', moduleKey: 'tasks', entityId: result.insertId, entityType: 'task', description: `Created task "${data.title}"${data.assignedTo ? ` assigned to user #${data.assignedTo}` : ''}` });
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

  async delete(id, userId) { await db.query('DELETE FROM tasks WHERE task_id = ?', [id]); await logActivity({ userId, action: 'delete', moduleKey: 'tasks', entityId: parseInt(id), entityType: 'task', description: `Deleted task #${id}` }); return true; }

  async updateStatus(id, status, userId) {
    const completedAt = status === 'completed' ? ' NOW()' : ' NULL';
    await db.query(`UPDATE tasks SET status = ?, completed_at = ${completedAt} WHERE task_id = ?`, [status, id]);

    // Notify the task creator if someone else changed the status
    const [task] = await db.query('SELECT title, assigned_by, assigned_to FROM tasks WHERE task_id = ?', [id]);
    if (task.length > 0) {
      const t = task[0];
      const [actor] = await db.query('SELECT full_name FROM users WHERE user_id = ?', [userId]);
      const actorName = actor.length > 0 ? actor[0].full_name : 'Someone';
      const statusLabel = status === 'completed' ? '✅ completed' : status === 'cancelled' ? '❌ cancelled' : `changed to ${status}`;

      // Notify the creator if the changer is not the creator
      if (t.assigned_by && t.assigned_by !== userId) {
        await notify({
          userId: t.assigned_by,
          type: 'task_completed',
          title: `Task ${status === 'completed' ? 'completed' : 'updated'}`,
          message: `${actorName} ${statusLabel} "${t.title}"`,
          moduleKey: 'tasks',
          entityId: parseInt(id),
          createdBy: userId,
        });
      }
      // Notify the assignee if the changer is not the assignee
      if (t.assigned_to && t.assigned_to !== userId && t.assigned_to !== t.assigned_by) {
        await notify({
          userId: t.assigned_to,
          type: 'task_updated',
          title: `Task ${status === 'completed' ? 'completed' : 'updated'}`,
          message: `${actorName} ${statusLabel} "${t.title}"`,
          moduleKey: 'tasks',
          entityId: parseInt(id),
          createdBy: userId,
        });
      }
    }
    return { taskId: parseInt(id), status };
  }
}

module.exports = new TaskService();
