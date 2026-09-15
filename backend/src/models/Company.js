const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: 'Uttar Pradesh' },
      pincode: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ location: '2dsphere' });
companySchema.index({ name: 'text', industry: 'text' });

module.exports = mongoose.model('Company', companySchema);
