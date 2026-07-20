const router = require('express').Router();
const controller = require('./tasks.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');

router.use(authMiddleware);

router.get('/', controller.list);
router.post('/', rbacMiddleware('tasks'), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', rbacMiddleware('tasks'), controller.delete);
router.put('/:id/status', controller.updateStatus);

module.exports = router;
