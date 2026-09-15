const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    query: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: '',
    },
    locationName: {
      type: String,
      default: '',
    },
    radiusKm: {
      type: Number,
      default: 25,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
