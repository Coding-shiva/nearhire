const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');
const { findUserById, DEMO_USERS } = require('../utils/inMemoryUserStore');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nearhire_super_secret_jwt_key_2026_dev');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {}
    }

    if (!user) {
      user = findUserById(decoded.id);
    }

    if (!user) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'USER',
        name: decoded.name || 'User',
        email: decoded.email || '',
      };
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized, token invalid or expired', 401);
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nearhire_super_secret_jwt_key_2026_dev');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {}
    }

    if (!user) {
      user = findUserById(decoded.id);
    }

    if (!user) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'USER',
        name: decoded.name || 'User',
      };
    }

    if (user) {
      req.user = user;
    }
  } catch (e) {}
  next();
};

module.exports = {
  protect,
  optionalAuth,
};
