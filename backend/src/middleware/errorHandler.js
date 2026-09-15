const logger = require('../config/logger');
const { error } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return error(res, `Resource not found with id ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return error(res, `Duplicate field value entered for '${field}'`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return error(res, 'Validation Error', 400, messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token provided', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token has expired', 401);
  }

  return error(
    res,
    err.message || 'Server Error',
    err.statusCode || 500,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = errorHandler;
