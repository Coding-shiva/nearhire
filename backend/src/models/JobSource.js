const mongoose = require('mongoose');

const jobSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['API', 'RSS', 'ATOM', 'CAREER_PAGE', 'EMPLOYER', 'ADMIN', 'MOCK'],
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    apiEndpoint: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    fetchIntervalMinutes: {
      type: Number,
      default: 30,
    },
    lastFetched: {
      type: Date,
      default: null,
    },
    lastSuccessfulFetch: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'success', 'error'],
      default: 'idle',
    },
    totalJobsFetched: {
      type: Number,
      default: 0,
    },
    totalJobsAdded: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobSource', jobSourceSchema);
