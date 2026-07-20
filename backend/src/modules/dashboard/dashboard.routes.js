const router = require('express').Router();
const controller = require('./dashboard.controller');
const authMiddleware = require('../../middleware/auth');
const yearContextMiddleware = require('../../middleware/yearContext');

router.use(authMiddleware);
router.get('/stats', yearContextMiddleware, controller.stats);

module.exports = router;
