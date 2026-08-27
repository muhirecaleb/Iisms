const router = require('express').Router();
const controller = require('./classes.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const yearContextMiddleware = require('../../middleware/yearContext');
const { createClassSchema, updateClassSchema } = require('./classes.validation');

router.use(authMiddleware);

router.get('/', yearContextMiddleware, rbacMiddleware('classes', ['canView']), controller.list);
router.get('/:id', rbacMiddleware('classes', ['canView']), controller.getById);
router.post('/', yearContextMiddleware, rbacMiddleware('classes', ['canCreate']), validate(createClassSchema), controller.create);
router.put('/:id', rbacMiddleware('classes', ['canEdit']), validate(updateClassSchema), controller.update);
router.delete('/:id', rbacMiddleware('classes', ['canDelete']), controller.remove);
router.get('/:id/students', yearContextMiddleware, rbacMiddleware('classes', ['canView']), controller.listStudents);

module.exports = router;
