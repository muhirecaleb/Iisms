const router = require('express').Router();
const controller = require('./users.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/roles', controller.listRoles);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/reset-password', controller.resetPassword);
router.delete('/:id', controller.remove);

module.exports = router;
