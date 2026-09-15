const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 150,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    subCategory: {
      type: String,
      default: '',
      trim: true,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'INR',
    },
    salaryPeriod: {
      type: String,
      enum: ['yearly', 'monthly', 'hourly'],
      default: 'yearly',
    },
    experienceMin: {
      type: Number,
      default: 0,
    },
    experienceMax: {
      type: Number,
      default: 10,
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '0-1 year', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher',
    },
    education: {
      type: String,
      default: 'Any Graduate / B.Tech / BCA / MCA / B.Sc',
    },
    employmentType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Apprenticeship', 'Walk-in'],
      default: 'Full Time',
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'On-site',
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Noida',
      trim: true,
    },
    state: {
      type: String,
      default: 'Uttar Pradesh',
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
    postedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    // Walk-in specific attributes
    walkIn: {
      type: Boolean,
      default: false,
    },
    walkInDate: {
      type: Date,
      default: null,
    },
    walkInStartTime: {
      type: String,
      default: '',
    },
    walkInEndTime: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      default: '',
    },
    requiredDocuments: [
      {
        type: String,
      },
    ],
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    applyUrl: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['API', 'RSS', 'CAREER_PAGE', 'EMPLOYER', 'ADMIN', 'MOCK'],
      default: 'ADMIN',
    },
    sourceJobId: {
      type: String,
      default: '',
    },
    duplicateHash: {
      type: String,
      default: '',
      index: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'closed', 'pending_verification'],
      default: 'active',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location search
jobSchema.index({ location: '2dsphere' });

// Compound indexes for fast multi-filter queries
jobSchema.index({ status: 1, postedAt: -1 });
jobSchema.index({ status: 1, category: 1, postedAt: -1 });
jobSchema.index({ status: 1, walkIn: 1, walkInDate: 1 });
jobSchema.index({ status: 1, experienceLevel: 1 });
jobSchema.index({ status: 1, workMode: 1 });

// Full text index for global search
jobSchema.index({
  title: 'text',
  companyName: 'text',
  skills: 'text',
  description: 'text',
  locationName: 'text',
});

module.exports = mongoose.model('Job', jobSchema);
