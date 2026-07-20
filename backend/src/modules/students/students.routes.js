const router = require('express').Router();
const controller = require('./students.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const yearContextMiddleware = require('../../middleware/yearContext');

router.use(authMiddleware);

router.get('/', yearContextMiddleware, rbacMiddleware('students'), controller.list);
router.get('/export', yearContextMiddleware, rbacMiddleware('students'), controller.exportCsv);
router.get('/:id', rbacMiddleware('students'), controller.getById);
router.post('/', rbacMiddleware('students'), controller.create);
router.put('/:id', rbacMiddleware('students'), controller.update);
router.delete('/:id', rbacMiddleware('students'), controller.delete);
router.post('/promote', rbacMiddleware('students'), controller.promote);

module.exports = router;
