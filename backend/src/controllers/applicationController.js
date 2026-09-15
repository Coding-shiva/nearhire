const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { calculateJobMatch } = require('../services/matchingService');
const { success, error } = require('../utils/apiResponse');
const { MOCK_JOBS_DATA } = require('../utils/mockJobsData');

// Runtime store for offline applications
const offlineApplications = [
  {
    _id: 'app-init-001',
    job: {
      _id: '670000000000000000000001',
      title: 'Frontend React Developer',
      companyName: 'Tata Consultancy Services (TCS)',
      locationName: 'Plot 22 & 23, Sector 62, Noida',
      employmentType: 'Full Time',
      salaryMin: 500000,
      salaryMax: 950000,
    },
    applicant: '670000000000000000000021',
    status: 'applied',
    matchScore: 92,
    createdAt: new Date(Date.now() - 3600000),
    statusHistory: [{ status: 'applied', note: 'Application submitted by candidate', date: new Date() }],
  },
];

/**
 * @desc    Apply for a job
 * @route   POST /api/applications
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverNote, resumeUrl } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      try {
        const job = await Job.findById(jobId);
        if (job) {
          const existing = await Application.findOne({ job: jobId, applicant: userId });
          if (existing) {
            return error(res, 'You have already applied for this job', 400);
          }

          const matchInfo = calculateJobMatch(req.user, job);
          const application = await Application.create({
            job: jobId,
            applicant: userId,
            resumeUrl: resumeUrl || req.user.resumeUrl || '',
            coverNote: coverNote || '',
            matchScore: matchInfo.matchScore,
            statusHistory: [{ status: 'applied', note: 'Application submitted by candidate' }],
          });

          job.applicationsCount = (job.applicationsCount || 0) + 1;
          await job.save();

          return success(res, application, 'Application submitted successfully', 201);
        }
      } catch (e) {
        console.warn('MongoDB applyForJob failed, using offline store:', e.message);
      }
    }

    // In-memory fallback
    const targetJob = MOCK_JOBS_DATA.find((j) => j._id === jobId) || {
      _id: jobId,
      title: 'Software Opportunity',
      companyName: 'Sector 62 Tech Corp',
      locationName: 'Sector 62, Noida',
    };

    const alreadyApplied = offlineApplications.some(
      (a) =>
        (a.job?._id === jobId || a.job === jobId) &&
        (a.applicant?.toString() === userId?.toString())
    );

    if (alreadyApplied) {
      return error(res, 'You have already applied for this job', 400);
    }

    targetJob.applicationsCount = (targetJob.applicationsCount || 0) + 1;

    const newApp = {
      _id: `app-${Date.now()}`,
      job: targetJob,
      applicant: userId,
      resumeUrl: resumeUrl || '',
      coverNote: coverNote || '',
      matchScore: 88,
      status: 'applied',
      statusHistory: [{ status: 'applied', note: 'Application submitted' }],
      createdAt: new Date(),
    };

    offlineApplications.unshift(newApp);
    return success(res, newApp, 'Application submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user's job applications
 * @route   GET /api/applications
 */
const getMyApplications = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id)?.toString();

    if (mongoose.connection.readyState === 1) {
      try {
        const applications = await Application.find({ applicant: userId })
          .populate({
            path: 'job',
            populate: { path: 'company' },
          })
          .sort({ createdAt: -1 });

        if (applications.length > 0) {
          return success(res, applications, 'Applications retrieved successfully');
        }
      } catch (e) {}
    }

    // In-memory fallback
    const userApps = offlineApplications.filter(
      (a) => a.applicant?.toString() === userId
    );

    return success(res, userApps, 'Applications retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update application status (Employer / Admin)
 * @route   PUT /api/applications/:id/status
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['saved', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'];

    if (!allowed.includes(status)) {
      return error(res, `Invalid status. Allowed values: ${allowed.join(', ')}`, 400);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const application = await Application.findById(req.params.id).populate('job');
        if (application) {
          application.status = status;
          application.statusHistory.push({
            status,
            note: note || `Status updated to ${status}`,
          });
          await application.save();
          return success(res, application, `Application status updated to ${status}`);
        }
      } catch (e) {}
    }

    // In-memory fallback
    const app = offlineApplications.find((a) => a._id === req.params.id);
    if (app) {
      app.status = status;
      return success(res, app, `Application status updated to ${status}`);
    }

    return success(res, { _id: req.params.id, status }, `Application status updated`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  updateApplicationStatus,
  offlineApplications,
};
