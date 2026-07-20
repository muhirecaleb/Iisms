const router = require('express').Router();
const controller = require('./roles.controller');
const authMiddleware = require('../../../middleware/auth');
const rbacMiddleware = require('../../../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware('system-settings'));

router.get('/', controller.list);
router.get('/:id/permissions', controller.getPermissions);
router.put('/:id/permissions', controller.updatePermissions);

module.exports = router;
