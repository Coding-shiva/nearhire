const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'EMPLOYER', 'ADMIN'],
      default: 'USER',
    },
    avatar: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: '',
      maxlength: 150,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    phone: {
      type: String,
      default: '',
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '0-1 year', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    locationName: {
      type: String,
      default: 'Noida Sector 62',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.3649, 28.6280], // Default Noida Sector 62
      },
    },
    preferredRadiusKm: {
      type: Number,
      default: 25,
    },
    preferredSalaryMin: {
      type: Number,
      default: 0,
    },
    preferredWorkMode: {
      type: String,
      enum: ['Any', 'On-site', 'Hybrid', 'Remote'],
      default: 'Any',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
