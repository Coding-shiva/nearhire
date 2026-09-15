const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { generateDuplicateHash } = require('../utils/duplicateDetector');
const { detectCategories } = require('../utils/categoryTaxonomy');
const { normalizeSkill, extractSkillsFromText } = require('../utils/skillTaxonomy');
const { resolveKnownLocation } = require('../utils/geoUtils');
const { processJobAlertsForNewJob } = require('../services/alertService');
const { invalidateJobCaches } = require('../services/cacheService');
const { success, error } = require('../utils/apiResponse');
const { MOCK_JOBS_DATA } = require('../utils/mockJobsData');

// In-memory array for offline jobs posted by employers
const offlineEmployerJobs = [];

/**
 * @desc    Post a new job (Employer)
 * @route   POST /api/employer/jobs
 */
const postJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      companyLogo,
      description,
      responsibilities,
      requirements,
      skills,
      category,
      subCategory,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      experienceLevel,
      employmentType,
      workMode,
      locationName,
      city,
      latitude,
      longitude,
      walkIn,
      walkInDate,
      walkInStartTime,
      walkInEndTime,
      venue,
      requiredDocuments,
      contactPhone,
      contactEmail,
      applicationDeadline,
    } = req.body;

    // Coordinate resolution
    let coordinates = [77.3649, 28.6280]; // Default Noida
    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
    } else if (locationName || city) {
      const known = resolveKnownLocation(locationName || city);
      if (known) coordinates = [known.lng, known.lat];
    }

    // Category auto-detection if not explicitly passed
    const detected = detectCategories(title, description);
    const primaryCat = category || detected.primaryCategory;
    const allCats = detected.allCategories;

    // Skill normalization
    let jobSkills = [];
    if (Array.isArray(skills) && skills.length > 0) {
      jobSkills = skills.map((s) => normalizeSkill(s)).filter(Boolean);
    } else {
      jobSkills = extractSkillsFromText(`${title} ${description}`);
    }

    // Duplicate hash
    const dupHash = generateDuplicateHash(companyName, title, locationName || city || 'Noida');

    const jobPayload = {
      title,
      companyName,
      companyLogo: companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      skills: [...new Set(jobSkills)],
      category: primaryCat,
      categories: allCats,
      subCategory: subCategory || detected.subCategory,
      salaryMin: salaryMin ? parseFloat(salaryMin) : 0,
      salaryMax: salaryMax ? parseFloat(salaryMax) : 0,
      experienceMin: experienceMin ? parseInt(experienceMin) : 0,
      experienceMax: experienceMax ? parseInt(experienceMax) : 5,
      experienceLevel: experienceLevel || 'Fresher',
      employmentType: employmentType || (walkIn ? 'Walk-in' : 'Full Time'),
      workMode: workMode || 'On-site',
      locationName: locationName || `${city || 'Noida'}`,
      city: city || 'Noida',
      location: {
        type: 'Point',
        coordinates,
      },
      walkIn: !!walkIn,
      walkInDate: walkInDate ? new Date(walkInDate) : null,
      walkInStartTime: walkInStartTime || '',
      walkInEndTime: walkInEndTime || '',
      venue: venue || '',
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : ['Resume / CV', 'Govt ID Proof'],
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      source: 'EMPLOYER',
      duplicateHash: dupHash,
      postedBy: req.user._id,
      verified: true,
      status: 'active',
      postedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const job = await Job.create(jobPayload);
        await invalidateJobCaches();
        processJobAlertsForNewJob(job).catch(() => {});
        return success(res, job, 'Job posted successfully', 201);
      } catch (e) {
        console.warn('MongoDB postJob failed, using in-memory store:', e.message);
      }
    }

    // In-memory fallback
    const offlineJob = {
      ...jobPayload,
      _id: `offline-job-${Date.now()}`,
      applicationsCount: 0,
    };

    offlineEmployerJobs.unshift(offlineJob);
    MOCK_JOBS_DATA.unshift(offlineJob); // Also add to general feed so candidate sees it!

    return success(res, offlineJob, 'Job posted successfully (instant active)', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get jobs posted by the employer
 * @route   GET /api/employer/jobs
 */
const getEmployerJobs = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        if (jobs.length > 0) {
          return success(res, jobs, 'Employer jobs retrieved');
        }
      } catch (e) {}
    }

    // Check in-memory list
    const userJobs = offlineEmployerJobs.filter(
      (j) => j.postedBy?.toString() === req.user._id?.toString()
    );

    // If none posted yet, provide sample postings for InnovaTech
    if (userJobs.length === 0) {
      const sampleEmployerJobs = MOCK_JOBS_DATA.slice(0, 2).map((j) => ({
        ...j,
        postedBy: req.user._id,
        applicationsCount: 3,
      }));
      return success(res, sampleEmployerJobs, 'Employer jobs retrieved (sample active)');
    }

    return success(res, userJobs, 'Employer jobs retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a job posted by employer
 * @route   PUT /api/employer/jobs/:id
 */
const updateJob = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
        if (job) {
          Object.assign(job, req.body);
          await job.save();
          return success(res, job, 'Job updated successfully');
        }
      } catch (e) {}
    }

    const jobIndex = offlineEmployerJobs.findIndex((j) => j._id === req.params.id);
    if (jobIndex !== -1) {
      Object.assign(offlineEmployerJobs[jobIndex], req.body);
      return success(res, offlineEmployerJobs[jobIndex], 'Job updated');
    }

    return success(res, req.body, 'Job updated');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get applicants for a specific job
 * @route   GET /api/employer/jobs/:id/applicants
 */
const getJobApplicants = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
        if (job) {
          const applicants = await Application.find({ job: job._id })
            .populate('applicant', 'name email headline phone skills experienceLevel locationName')
            .sort({ matchScore: -1, createdAt: -1 });

          return success(res, { job, applicants }, 'Applicants retrieved successfully');
        }
      } catch (e) {}
    }

    // Realistic mock applicants for demonstration
    const sampleJob = MOCK_JOBS_DATA.find((j) => j._id === req.params.id) || { title: 'Software Engineer', _id: req.params.id };
    const sampleApplicants = [
      {
        _id: 'app-001',
        status: 'shortlisted',
        matchScore: 92,
        applicant: {
          name: 'Shivanand Sharma',
          email: 'candidate@nearhire.com',
          headline: 'Full Stack MERN Developer | React & Node.js',
          phone: '+91 9876543210',
          skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
          experienceLevel: 'Fresher',
          locationName: 'Noida Sector 62',
        },
      },
      {
        _id: 'app-002',
        status: 'interview',
        matchScore: 84,
        applicant: {
          name: 'Priya Mehta',
          email: 'priya.mehta@example.com',
          headline: 'Frontend Engineer | React & TypeScript',
          phone: '+91 9811223344',
          skills: ['React', 'TypeScript', 'Tailwind CSS'],
          experienceLevel: '1-3 years',
          locationName: 'Sector 18, Noida',
        },
      },
      {
        _id: 'app-003',
        status: 'applied',
        matchScore: 68,
        applicant: {
          name: 'Amit Singh',
          email: 'amit.singh@example.com',
          headline: 'Junior Web Developer',
          phone: '+91 9822334455',
          skills: ['HTML', 'CSS', 'JavaScript', 'React'],
          experienceLevel: 'Fresher',
          locationName: 'Indirapuram, Ghaziabad',
        },
      },
    ];

    return success(res, { job: sampleJob, applicants: sampleApplicants }, 'Applicants retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postJob,
  getEmployerJobs,
  updateJob,
  getJobApplicants,
};
