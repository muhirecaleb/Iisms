const router = require('express').Router();
const controller = require('./system-logs.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware('system-settings'));

router.get('/stats', controller.getStats);
router.get('/actions', controller.getActionTypes);
router.get('/modules', controller.getModuleKeys);
router.get('/', controller.list);

module.exports = router;
