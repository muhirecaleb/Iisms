const Joi = require('joi');

exports.feeRateSchema = Joi.object({
  academicYearId: Joi.number().integer().positive().required(),
  level: Joi.string().required(),
  termId: Joi.number().integer().positive().required(),
  feeItemId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
});

exports.generateInvoiceSchema = Joi.object({
  academicYearId: Joi.number().integer().positive().required(),
  termId: Joi.number().integer().positive().required(),
  feeItemId: Joi.number().integer().positive().required(),
});

exports.paymentSchema = Joi.object({
  invoiceId: Joi.number().integer().positive().required(),
  studentId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().iso().required(),
  paymentMethod: Joi.string().valid('Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other').required(),
  referenceNo: Joi.string().allow('', null),
  comment: Joi.string().allow('', null),
});

exports.sponsorshipSchema = Joi.object({
  studentId: Joi.number().integer().positive().required(),
  academicYearId: Joi.number().integer().positive().required(),
  sponsorName: Joi.string().min(2).max(200).required(),
  coveragePercent: Joi.number().min(0).max(100).required(),
  notes: Joi.string().allow('', null),
});
