const { error } = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const errorMessages = validationError.details.map((d) => d.message.replace(/['"]/g, ''));
      return error(res, 'Validation error', 400, errorMessages);
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
