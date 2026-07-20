const Joi = require('joi');

exports.loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(1).required(),
});

exports.sendOtpSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

exports.verifyOtpSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
});

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});
