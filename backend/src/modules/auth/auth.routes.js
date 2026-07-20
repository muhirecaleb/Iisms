const router = require('express').Router();
const controller = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const rateLimit = require('express-rate-limit');
const { loginSchema, sendOtpSchema, verifyOtpSchema } = require('./auth.validation');

// Rate limiting for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts' } },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many OTP requests' } },
});

// Public routes
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/refresh', controller.refresh);

// Protected routes
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);
router.put('/change-password', authMiddleware, controller.changePassword);

module.exports = router;
