const router = require('express').Router();
const controller = require('./academic-years.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', controller.list);
router.post('/ensure-current', controller.ensureCurrent);
router.post('/', controller.create);
router.put('/:id/current', controller.setCurrent);
router.delete('/:id', controller.remove);

module.exports = router;
