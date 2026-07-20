const router = require('express').Router();
const controller = require('./academic-years.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);
router.get('/', controller.list);
router.put('/:id/current', controller.setCurrent);

module.exports = router;
