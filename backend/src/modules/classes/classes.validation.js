const Joi = require('joi');

exports.createClassSchema = Joi.object({
  className: Joi.string().min(2).max(50).required(),
  trade: Joi.string().max(80).allow('', null),
  level: Joi.string().max(20).allow('', null),
});

exports.updateClassSchema = Joi.object({
  className: Joi.string().min(2).max(50),
  trade: Joi.string().max(80).allow('', null),
  level: Joi.string().max(20).allow('', null),
}).min(1);
