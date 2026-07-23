const router = require('express').Router();
const controller = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const multer = require('multer');
const path = require('path');
const env = require('../../config/environment');
const { loginSchema, sendOtpSchema, verifyOtpSchema } = require('./auth.validation');

// Avatar upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Public routes
router.post('/login', validate(loginSchema), controller.login);
router.post('/send-otp', validate(sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), controller.verifyOtp);
router.post('/refresh', controller.refresh);

// Protected routes
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);
router.put('/change-password', authMiddleware, controller.changePassword);
router.put('/profile', authMiddleware, controller.updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), controller.uploadAvatar);

module.exports = router;
