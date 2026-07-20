const db = require('../../../config/database');

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
    res.json({ success: true, message: 'Permissions updated' });
  } catch (error) { next(error); }
};
