const router = require('express').Router();
const controller = require('./students.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const yearContextMiddleware = require('../../middleware/yearContext');

router.use(authMiddleware);

router.get('/', yearContextMiddleware, rbacMiddleware('students', ['canView']), controller.list);
router.get('/export', yearContextMiddleware, rbacMiddleware('students', ['canView']), controller.exportCsv);
router.get('/:id', rbacMiddleware('students', ['canView']), controller.getById);
router.post('/', rbacMiddleware('students', ['canCreate']), controller.create);
router.put('/:id', rbacMiddleware('students', ['canEdit']), controller.update);
router.delete('/:id', rbacMiddleware('students', ['canDelete']), controller.delete);
router.post('/promote', rbacMiddleware('students', ['canCreate']), controller.promote);

module.exports = router;
