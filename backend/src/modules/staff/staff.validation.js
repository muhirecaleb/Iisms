const Joi = require('joi');

exports.createSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  dateOfBirth: Joi.date().iso().allow(null),
  gender: Joi.string().valid('M', 'F').required(),
  maritalStatus: Joi.string().allow('', null),
  nationality: Joi.string().max(50).default('Rwandan'),
  idPassportNo: Joi.string().allow('', null),
  staffCategory: Joi.string().valid('Teaching', 'Administrative', 'Support').allow('', null),
  phoneNumber: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  highestQualification: Joi.string().allow('', null),
  domain: Joi.string().allow('', null),
  subDomain: Joi.string().allow('', null),
  fieldOfStudy: Joi.string().allow('', null),
  staffPosition: Joi.string().allow('', null),
  contractType: Joi.string().valid('Permanent', 'Fixed-term', 'Probation', 'Volunteer').allow('', null),
  province: Joi.string().allow('', null),
  district: Joi.string().allow('', null),
  sector: Joi.string().allow('', null),
  cell: Joi.string().allow('', null),
  village: Joi.string().allow('', null),
  detailAddress: Joi.string().allow('', null),
});

exports.updateSchema = Joi.object({
  fullName: Joi.string().min(3).max(100),
  gender: Joi.string().valid('M', 'F'),
  phoneNumber: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  staffPosition: Joi.string().allow('', null),
  contractType: Joi.string().valid('Permanent', 'Fixed-term', 'Probation', 'Volunteer'),
  status: Joi.string().valid('active', 'on_leave', 'resigned', 'terminated'),
}).min(1);

exports.copyForwardSchema = Joi.object({
  fromAcademicYearId: Joi.number().integer().positive().required(),
  toAcademicYearId: Joi.number().integer().positive().required(),
  staffIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});
