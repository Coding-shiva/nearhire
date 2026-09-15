const mongoose = require('mongoose');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const JobReport = require('../models/JobReport');
const jobService = require('../services/jobService');
const { calculateJobMatch } = require('../services/matchingService');
const { getCachedNearbyJobs, setCachedNearbyJobs } = require('../services/cacheService');
const { calculateHaversineDistance } = require('../utils/geoUtils');
const { success, error } = require('../utils/apiResponse');
const { MOCK_JOBS_DATA } = require('../utils/mockJobsData');

/**
 * @desc    Get nearby jobs based on user coordinates & radius
 * @route   GET /api/jobs/nearby
 */
const getNearbyJobs = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 25,
      category,
      skills,
      experienceLevel,
      employmentType,
      workMode,
      salaryMin,
      salaryMax,
      postedWithin,
      walkIn,
      sortBy,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    // Check Redis cache if no user-specific auth needed
    if (!req.user && !search) {
      const cached = await getCachedNearbyJobs(req.query);
      if (cached) {
        return success(res, cached, 'Nearby jobs retrieved (cached)');
      }
    }

    const result = await jobService.getNearbyJobs({
      lat,
      lng,
      radius,
      category,
      skills,
      experienceLevel,
      employmentType,
      workMode,
      salaryMin,
      salaryMax,
      postedWithin,
      walkIn,
      sortBy,
      page,
      limit,
      search,
      user: req.user,
    });

    if (!req.user && !search) {
      await setCachedNearbyJobs(req.query, result, 120);
    }

    return success(res, result, 'Nearby jobs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Global jobs search & directory
 * @route   GET /api/jobs
 */
const getAllJobs = async (req, res, next) => {
  try {
    return await getNearbyJobs(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get walk-in interviews
 * @route   GET /api/jobs/walk-ins
 */
const getWalkInJobs = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 20, lat, lng } = req.query;
    const result = await jobService.getWalkInJobs({ filter, page, limit, lat, lng });
    return success(res, result, 'Walk-in jobs retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single job details by ID + AI match score
 * @route   GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    let job = null;

    if (mongoose.connection.readyState === 1) {
      try {
        job = await Job.findById(req.params.id).populate('company');
        if (job) {
          job.viewsCount = (job.viewsCount || 0) + 1;
          await job.save();
          job = job.toObject();
        }
      } catch (e) {}
    }

    // Fallback to in-memory dataset
    if (!job) {
      const mockFound = MOCK_JOBS_DATA.find((j) => j._id === req.params.id || j._id.toString() === req.params.id);
      if (mockFound) {
        job = { ...mockFound };
      }
    }

    if (!job) {
      return error(res, 'Job not found', 404);
    }

    // Calculate AI match score if user is logged in
    const matchInfo = calculateJobMatch(req.user, job);

    // Calculate distance if user has coordinates or lat/lng passed
    let distance = null;
    const lat = req.query.lat || req.user?.location?.coordinates?.[1];
    const lng = req.query.lng || req.user?.location?.coordinates?.[0];
    if (lat && lng && job.location?.coordinates) {
      distance = calculateHaversineDistance(
        parseFloat(lat),
        parseFloat(lng),
        job.location.coordinates[1],
        job.location.coordinates[0]
      );
    }

    // Check if saved by current user
    let isSaved = false;
    if (req.user && mongoose.connection.readyState === 1) {
      try {
        const saved = await SavedJob.findOne({ user: req.user._id, job: job._id });
        isSaved = !!saved;
      } catch (e) {}
    }

    const jobData = {
      ...job,
      distance,
      distanceUnit: 'km',
      matchScore: matchInfo.matchScore,
      matchedSkills: matchInfo.matchedSkills,
      missingSkills: matchInfo.missingSkills,
      matchReason: matchInfo.reason,
      isSaved,
    };

    return success(res, jobData, 'Job details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Save / bookmark job
 * @route   POST /api/jobs/:id/save
 */
const saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const job = await Job.findById(jobId);
      if (job) {
        const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });
        if (existing) {
          await SavedJob.deleteOne({ _id: existing._id });
          return success(res, { saved: false }, 'Job removed from saved list');
        }
        await SavedJob.create({ user: req.user._id, job: jobId });
        return success(res, { saved: true }, 'Job saved successfully');
      }
    }
    // Fallback mock toggle
    return success(res, { saved: true }, 'Job saved successfully (local)');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user saved jobs
 * @route   GET /api/jobs/user/saved
 */
const getSavedJobs = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const saved = await SavedJob.find({ user: req.user._id })
        .populate('job')
        .sort({ createdAt: -1 });

      const jobs = saved
        .filter((s) => s.job)
        .map((s) => ({
          ...s.job.toObject(),
          savedAt: s.createdAt,
          isSaved: true,
        }));

      return success(res, jobs, 'Saved jobs retrieved');
    }

    // Fallback
    const mockSaved = MOCK_JOBS_DATA.slice(0, 3).map((j) => ({ ...j, isSaved: true }));
    return success(res, mockSaved, 'Saved jobs retrieved (fallback)');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Report a job for scam / expiry
 * @route   POST /api/jobs/:id/report
 */
const reportJob = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    const jobId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const report = await JobReport.create({
        job: jobId,
        reportedBy: req.user ? req.user._id : null,
        reason: reason || 'other',
        description: description || '',
      });
      return success(res, report, 'Job report submitted. Our team will review it.', 201);
    }

    return success(res, { jobId, reason }, 'Job report submitted (fallback mode).', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Home page recommendations and sections
 * @route   GET /api/jobs/home-feed
 */
const getHomeFeed = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6280;
    const lng = parseFloat(req.query.lng) || 77.3649;

    // 1. Nearby Jobs (within 25km)
    const nearby = await jobService.getNearbyJobs({
      lat,
      lng,
      radius: 25,
      limit: 6,
      user: req.user,
    });

    // 2. Walk-ins Near You
    const walkIns = await jobService.getWalkInJobs({
      filter: 'all',
      limit: 4,
      lat,
      lng,
    });

    let freshers = [];
    let postedToday = [];

    if (mongoose.connection.readyState === 1) {
      try {
        freshers = await Job.find({
          status: 'active',
          experienceLevel: 'Fresher',
          expiresAt: { $gt: new Date() },
        })
          .sort({ postedAt: -1 })
          .limit(6)
          .lean();

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        postedToday = await Job.find({
          status: 'active',
          postedAt: { $gte: todayDate },
          expiresAt: { $gt: new Date() },
        })
          .sort({ postedAt: -1 })
          .limit(6)
          .lean();
      } catch (e) {}
    }

    // Fallback if DB empty or offline
    if (freshers.length === 0) {
      freshers = MOCK_JOBS_DATA.filter((j) => j.experienceLevel === 'Fresher').slice(0, 6);
    }
    if (postedToday.length === 0) {
      postedToday = MOCK_JOBS_DATA.slice(0, 4);
    }

    return success(
      res,
      {
        nearbyJobs: nearby.jobs,
        walkIns: walkIns.jobs,
        fresherJobs: freshers,
        todayJobs: postedToday,
      },
      'Home feed data retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyJobs,
  getAllJobs,
  getWalkInJobs,
  getJobById,
  saveJob,
  getSavedJobs,
  reportJob,
  getHomeFeed,
};
