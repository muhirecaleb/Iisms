const router = require('express').Router();
const controller = require('./staff.controller');
const authMiddleware = require('../../middleware/auth');
const rbacMiddleware = require('../../middleware/rbac');
const yearContextMiddleware = require('../../middleware/yearContext');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // optional, just use timestamp
const env = require('../../config/environment');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => cb(null, `staff_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(authMiddleware);

router.get('/', yearContextMiddleware, rbacMiddleware('staff'), controller.list);
router.get('/:id', rbacMiddleware('staff'), controller.getById);
router.post('/', rbacMiddleware('staff'), controller.create);
router.put('/:id', rbacMiddleware('staff'), controller.update);
router.delete('/:id', rbacMiddleware('staff'), controller.delete);
router.post('/:id/photo', rbacMiddleware('staff'), upload.single('photo'), controller.uploadPhoto);
router.post('/copy-forward', rbacMiddleware('staff'), controller.copyForward);

module.exports = router;
