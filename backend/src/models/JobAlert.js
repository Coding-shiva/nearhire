const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      default: '',
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    locationName: {
      type: String,
      default: 'Noida',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    radiusKm: {
      type: Number,
      default: 25,
    },
    emailNotification: {
      type: Boolean,
      default: true,
    },
    inAppNotification: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastTriggered: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

jobAlertSchema.index({ location: '2dsphere' });
jobAlertSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('JobAlert', jobAlertSchema);
