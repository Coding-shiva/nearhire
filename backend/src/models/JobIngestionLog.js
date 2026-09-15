const mongoose = require('mongoose');

const jobIngestionLogSchema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobSource',
      default: null,
    },
    sourceName: {
      type: String,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      required: true,
    },
    jobsFetched: {
      type: Number,
      default: 0,
    },
    jobsAdded: {
      type: Number,
      default: 0,
    },
    jobsUpdated: {
      type: Number,
      default: 0,
    },
    duplicatesFound: {
      type: Number,
      default: 0,
    },
    errors: [
      {
        type: String,
      },
    ],
    executionTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobIngestionLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobIngestionLog', jobIngestionLogSchema);
