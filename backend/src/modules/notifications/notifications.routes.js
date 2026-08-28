const router = require('express').Router();
const controller = require('./notifications.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/unread-count', controller.getUnreadCount);
router.get('/stream', controller.getStream);
router.get('/', controller.list);
router.put('/read-all', controller.markAllAsRead);
router.put('/:id/read', controller.markAsRead);
router.delete('/:id', controller.delete);

module.exports = router;
