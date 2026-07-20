const { ValidationError } = require('../utils/errors');

/**
 * Middleware: Validate request against a Joi schema.
 * Usage: validate(schema)             → validates req.body
 *        validate(schema, 'query')    → validates req.query
 *        validate(schema, 'params')   → validates req.params
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(new ValidationError(details));
    }

    // Replace request data with validated (and stripped) data
    req[source] = value;
    next();
  };
}

module.exports = validate;
