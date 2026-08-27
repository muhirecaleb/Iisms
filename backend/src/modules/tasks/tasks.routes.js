const router = require('express').Router();
const controller = require('./tasks.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');

router.use(authMiddleware);

router.get('/users', async (req, res, next) => {
  try {
    const db = require('../../config/database');
    const [rows] = await db.query(
      `SELECT user_id, full_name, username FROM users WHERE deleted_at IS NULL AND status = 'active' ORDER BY full_name`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});
router.get('/', rbacMiddleware('tasks', ['canView']), controller.list);
router.post('/', rbacMiddleware('tasks', ['canCreate']), controller.create);
router.put('/:id', rbacMiddleware('tasks', ['canEdit']), controller.update);
router.delete('/:id', rbacMiddleware('tasks', ['canDelete']), controller.delete);
router.put('/:id/status', rbacMiddleware('tasks', ['canEdit']), controller.updateStatus);

module.exports = router;
