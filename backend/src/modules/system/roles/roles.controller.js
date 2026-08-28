const db = require('../../../config/database');
const { notifyAdmins } = require('../../../utils/notify');
const { logActivity } = require('../../../utils/activityLog');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM roles ORDER BY role_id');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getPermissions = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT rp.*, m.label FROM role_permissions rp JOIN modules m ON rp.module_key = m.module_key WHERE rp.role_id = ?',
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { roleName, description } = req.body;
    if (!roleName) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Role name is required' } });
    }
    // Check for duplicate
    const [existing] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [roleName]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Role already exists' } });
    }
    const [result] = await db.query(
      'INSERT INTO roles (role_name, description) VALUES (?, ?)',
      [roleName, description || null]
    );
    // Copy permissions from Administrator as default
    const [adminRole] = await db.query("SELECT role_id FROM roles WHERE role_name = 'Administrator' LIMIT 1");
    if (adminRole.length > 0) {
      const [adminPerms] = await db.query(
        'SELECT module_key, can_view, can_create, can_edit, can_delete FROM role_permissions WHERE role_id = ?',
        [adminRole[0].role_id]
      );
      for (const p of adminPerms) {
        await db.query(
          'INSERT INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 0, 0, 0, 0)',
          [result.insertId, p.module_key]
        );
      }
    }
    const [newRole] = await db.query('SELECT * FROM roles WHERE role_id = ?', [result.insertId]);
    await logActivity({ userId: req.user.id, action: 'create', moduleKey: 'system-settings', entityId: result.insertId, entityType: 'role', description: `Created role "${roleName}"` });

    // Notify admins about new role creation
    const [actor] = await db.query('SELECT full_name FROM users WHERE user_id = ?', [req.user.id]);
    const actorName = actor.length > 0 ? actor[0].full_name : 'Someone';
    await notifyAdmins({
      type: 'system',
      title: 'New role created',
      message: `${actorName} created a new role "${roleName}"`,
      moduleKey: 'system-settings',
      entityId: result.insertId,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: newRole[0] });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Prevent deleting built-in roles
    const [role] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [id]);
    if (role.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } });
    }
    const builtIn = ['Administrator', 'Director', 'DOS', 'Registrar', 'Teacher', 'Discipline Officer', 'Accountant', 'Cashier', 'Finance Manager', 'HR Officer', 'Librarian'];
    if (builtIn.includes(role[0].role_name)) {
      return res.status(400).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete built-in roles' } });
    }
    // Check if any users have this role
    const [users] = await db.query('SELECT COUNT(*) as cnt FROM users WHERE role_id = ? AND deleted_at IS NULL', [id]);
    if (users[0].cnt > 0) {
      return res.status(400).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete role with assigned users. Reassign them first.' } });
    }
    await db.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);
    await db.query('DELETE FROM roles WHERE role_id = ?', [id]);
    await logActivity({ userId: req.user.id, action: 'delete', moduleKey: 'system-settings', entityId: parseInt(id), entityType: 'role', description: `Deleted role "${role[0].role_name}"` });
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) { next(error); }
};

exports.updatePermissions = async (req, res, next) => {
  try {
    await db.query('DELETE FROM role_permissions WHERE role_id = ?', [req.params.id]);
    const perms = req.body.permissions || {};
    for (const [moduleKey, ops] of Object.entries(perms)) {
      await db.query(
        'INSERT INTO role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, moduleKey, ops.canView || false, ops.canCreate || false, ops.canEdit || false, ops.canDelete || false]
      );
    }

    await logActivity({ userId: req.user.id, action: 'update', moduleKey: 'system-settings', entityId: parseInt(req.params.id), entityType: 'role', description: `Updated permissions for role #${req.params.id}` });

    // Notify admins about permission changes
    const [role] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [req.params.id]);
    if (role.length > 0) {
      const [actor] = await db.query('SELECT full_name FROM users WHERE user_id = ?', [req.user.id]);
      const actorName = actor.length > 0 ? actor[0].full_name : 'Someone';
      await notifyAdmins({
        type: 'role_changed',
        title: 'Role permissions updated',
        message: `${actorName} updated permissions for "${role[0].role_name}"`,
        moduleKey: 'system-settings',
        entityId: parseInt(req.params.id),
        createdBy: req.user.id,
      });
    }

    res.json({ success: true, message: 'Permissions updated' });
  } catch (error) { next(error); }
};
