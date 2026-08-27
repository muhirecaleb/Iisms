const router = require('express').Router();
const controller = require('./classes.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const yearContextMiddleware = require('../../middleware/yearContext');
const { createClassSchema, updateClassSchema } = require('./classes.validation');

router.use(authMiddleware);

router.get('/', yearContextMiddleware, controller.list);
router.get('/:id', controller.getById);
router.post('/', yearContextMiddleware, rbacMiddleware('classes'), validate(createClassSchema), controller.create);
router.put('/:id', rbacMiddleware('classes'), validate(updateClassSchema), controller.update);
router.delete('/:id', rbacMiddleware('classes'), controller.remove);
router.get('/:id/students', yearContextMiddleware, controller.listStudents);

module.exports = router;
