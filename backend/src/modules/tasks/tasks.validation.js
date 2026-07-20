const Joi = require('joi');

exports.createSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  moduleKey: Joi.string().allow('', null),
  assignedTo: Joi.number().integer().positive().allow(null),
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
});

exports.updateSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow('', null),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled'),
  dueDate: Joi.date().iso().allow(null),
}).min(1);

exports.statusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required(),
});
