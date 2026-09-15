const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const Application = require('../models/Application');
const JobSource = require('../models/JobSource');
const JobIngestionLog = require('../models/JobIngestionLog');
const JobReport = require('../models/JobReport');
const { invalidateJobCaches } = require('../services/cacheService');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Get complete platform stats and chart breakdowns for Admin Dashboard
 * @route   GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      expiredJobs,
      walkInJobs,
      jobsAddedToday,
      totalApplications,
      verifiedJobs,
      pendingVerification,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'expired' }),
      Job.countDocuments({ walkIn: true }),
      Job.countDocuments({ createdAt: { $gte: today } }),
      Application.countDocuments(),
      Job.countDocuments({ verified: true }),
      Job.countDocuments({ status: 'pending_verification' }),
    ]);

    // Breakdown: Jobs by Category
    const jobsByCategory = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown: Jobs by City
    const jobsByCity = await Job.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Breakdown: Jobs by Source
    const jobsBySource = await Job.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return success(
      res,
      {
        summary: {
          totalUsers,
          totalCompanies,
          totalJobs,
          activeJobs,
          expiredJobs,
          walkInJobs,
          jobsAddedToday,
          totalApplications,
          verifiedJobs,
          pendingVerification,
        },
        charts: {
          jobsByCategory: jobsByCategory.map((c) => ({ category: c._id, count: c.count })),
          jobsByCity: jobsByCity.map((c) => ({ city: c._id || 'Unknown', count: c.count })),
          jobsBySource: jobsBySource.map((c) => ({ source: c._id, count: c.count })),
        },
      },
      'Admin statistics retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify or reject job
 * @route   POST /api/admin/jobs/:id/verify
 */
const verifyJob = async (req, res, next) => {
  try {
    const { verified, status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    job.verified = verified !== undefined ? verified : true;
    if (status) job.status = status;
    await job.save();
    await invalidateJobCaches();

    return success(res, job, `Job verification updated to ${job.verified}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Archive job
 * @route   POST /api/admin/jobs/:id/archive
 */
const archiveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    job.status = 'closed';
    await job.save();
    await invalidateJobCaches();

    return success(res, job, 'Job archived successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get reported jobs
 * @route   GET /api/admin/reports
 */
const getJobReports = async (req, res, next) => {
  try {
    const reports = await JobReport.find()
      .populate('job')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    return success(res, reports, 'Reports retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get ingestion sources list
 * @route   GET /api/admin/sources
 */
const getSources = async (req, res, next) => {
  try {
    const sources = await JobSource.find().sort({ createdAt: -1 });
    return success(res, sources, 'Ingestion sources retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new ingestion source
 * @route   POST /api/admin/sources
 */
const createSource = async (req, res, next) => {
  try {
    const { name, sourceType, url, apiEndpoint, fetchIntervalMinutes } = req.body;
    const source = await JobSource.create({
      name,
      sourceType,
      url,
      apiEndpoint,
      fetchIntervalMinutes: fetchIntervalMinutes || 30,
    });
    return success(res, source, 'Source created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle ingestion source status
 * @route   PUT /api/admin/sources/:id/toggle
 */
const toggleSource = async (req, res, next) => {
  try {
    const source = await JobSource.findById(req.params.id);
    if (!source) return error(res, 'Source not found', 404);

    source.enabled = !source.enabled;
    await source.save();
    return success(res, source, `Source ${source.enabled ? 'enabled' : 'disabled'}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get ingestion run logs
 * @route   GET /api/admin/ingestion-logs
 */
const getIngestionLogs = async (req, res, next) => {
  try {
    const logs = await JobIngestionLog.find().sort({ createdAt: -1 }).limit(50);
    return success(res, logs, 'Ingestion logs retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  verifyJob,
  archiveJob,
  getJobReports,
  getSources,
  createSource,
  toggleSource,
  getIngestionLogs,
};
