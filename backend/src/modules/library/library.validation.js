const Joi = require('joi');

const createBookSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  author: Joi.string().min(1).max(255).required(),
  isbn: Joi.string().max(20).allow('', null).optional(),
  publisher: Joi.string().max(255).allow('', null).optional(),
  publicationYear: Joi.number().integer().min(1900).max(2100).allow(null).optional(),
  category: Joi.string().min(1).max(100).required(),
  totalCopies: Joi.number().integer().min(1).max(10000).default(1),
  location: Joi.string().max(100).allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
});

const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  author: Joi.string().min(1).max(255).optional(),
  isbn: Joi.string().max(20).allow('', null).optional(),
  publisher: Joi.string().max(255).allow('', null).optional(),
  publicationYear: Joi.number().integer().min(1900).max(2100).allow(null).optional(),
  category: Joi.string().min(1).max(100).optional(),
  totalCopies: Joi.number().integer().min(1).max(10000).optional(),
  location: Joi.string().max(100).allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('active', 'retired').optional(),
}).min(1);

const borrowBookSchema = Joi.object({
  bookId: Joi.number().integer().required(),
  borrowerType: Joi.string().valid('student', 'staff').required(),
  borrowerId: Joi.number().integer().required(),
  dueDate: Joi.date().iso().required(),
  notes: Joi.string().allow('', null).optional(),
});

const returnBookSchema = Joi.object({
  notes: Joi.string().allow('', null).optional(),
});

module.exports = { createBookSchema, updateBookSchema, borrowBookSchema, returnBookSchema };
