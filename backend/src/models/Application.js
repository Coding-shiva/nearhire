const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'],
      default: 'applied',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    coverNote: {
      type: String,
      default: '',
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
