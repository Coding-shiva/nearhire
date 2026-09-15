const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const { resolveKnownLocation } = require('../utils/geoUtils');
const { DEMO_USERS, saveUser, findUserById, findUserByEmail } = require('../utils/inMemoryUserStore');

const generateToken = (userOrId) => {
  let payload;
  if (typeof userOrId === 'object' && userOrId !== null) {
    payload = {
      id: userOrId.id || userOrId._id,
      role: userOrId.role || 'USER',
      name: userOrId.name || '',
      email: userOrId.email || '',
    };
  } else {
    payload = { id: userOrId };
  }
  return jwt.sign(payload, process.env.JWT_SECRET || 'nearhire_super_secret_jwt_key_2026_dev', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user or employer
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, headline, skills, locationName, latitude, longitude } = req.body;

    let coordinates = [77.3649, 28.6280]; // Default Noida Sector 62
    let resolvedLocName = locationName || 'Noida Sector 62';

    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
    } else if (locationName) {
      const known = resolveKnownLocation(locationName);
      if (known) coordinates = [known.lng, known.lat];
    }

    const assignedRole = role && ['USER', 'EMPLOYER'].includes(role) ? role : 'USER';

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return error(res, 'User already exists with this email', 400);
      }

      const user = await User.create({
        name,
        email,
        password,
        role: assignedRole,
        headline: headline || '',
        skills: Array.isArray(skills) ? skills : [],
        locationName: resolvedLocName,
        location: { type: 'Point', coordinates },
      });

      const token = generateToken(user);

      return success(
        res,
        {
          user: {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            headline: user.headline,
            skills: user.skills,
            locationName: user.locationName,
            location: user.location,
          },
          token,
        },
        'Registration successful',
        201
      );
    }

    // In-memory fallback
    const mockUser = {
      _id: `usr-${Date.now()}`,
      id: `usr-${Date.now()}`,
      name,
      email,
      role: assignedRole,
      headline: headline || '',
      skills: Array.isArray(skills) ? skills : [],
      locationName: resolvedLocName,
      location: { type: 'Point', coordinates },
    };
    saveUser(mockUser);
    const token = generateToken(mockUser);
    return success(res, { user: mockUser, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Please provide email and password', 400);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
          const token = generateToken(user);
          return success(
            res,
            {
              user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                headline: user.headline,
                bio: user.bio,
                experienceLevel: user.experienceLevel,
                skills: user.skills,
                preferredCategories: user.preferredCategories,
                locationName: user.locationName,
                location: user.location,
                preferredRadiusKm: user.preferredRadiusKm,
              },
              token,
            },
            'Login successful'
          );
        }
      } catch (e) {}
    }

    // Check demo accounts and offline registered accounts
    const memoryUser = findUserByEmail(email);
    if (memoryUser) {
      const token = generateToken(memoryUser);
      return success(res, { user: memoryUser, token }, 'Login successful');
    }

    return error(res, 'Invalid email or password', 401);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id || req.user._id);
      if (user) return success(res, user, 'User profile retrieved');
    }

    const memoryUser = findUserById(req.user.id || req.user._id) || req.user;
    return success(res, memoryUser, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile & location
 * @route   PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id || req.user._id);
      if (user) {
        Object.assign(user, req.body);
        await user.save();
        return success(res, user, 'Profile updated successfully');
      }
    }
    const updated = { ...req.user, ...req.body };
    saveUser(updated);
    return success(res, updated, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
