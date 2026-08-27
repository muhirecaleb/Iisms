const router = require('express').Router();
const controller = require('./roles.controller');
const db = require('../../../config/database');
const authMiddleware = require('../../../middleware/auth');
const rbacMiddleware = require('../../../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware('system-settings'));

router.get('/modules', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT module_key, label FROM modules ORDER BY sort_order, label');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});
router.get('/', controller.list);
router.get('/:id/permissions', controller.getPermissions);
router.put('/:id/permissions', controller.updatePermissions);

module.exports = router;
