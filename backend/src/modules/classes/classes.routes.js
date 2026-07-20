const router = require('express').Router();
const controller = require('./classes.controller');
const authMiddleware = require('../../middleware/auth');
const yearContextMiddleware = require('../../middleware/yearContext');

router.use(authMiddleware);
router.get('/', yearContextMiddleware, controller.list);
router.get('/:id', controller.getById);

module.exports = router;
