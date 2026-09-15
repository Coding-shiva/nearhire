const mongoose = require('mongoose');
const Job = require('../models/Job');
const { calculateHaversineDistance, resolveKnownLocation } = require('../utils/geoUtils');
const { calculateJobMatch } = require('./matchingService');
const { MOCK_JOBS_DATA } = require('../utils/mockJobsData');

/**
 * Service for geospatial search and advanced filtering
 */
class JobService {
  /**
   * Search nearby jobs using MongoDB $geoNear or fallback
   */
  async getNearbyJobs({
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
    sortBy = 'nearest',
    page = 1,
    limit = 20,
    search,
    user = null,
  }) {
    let latitude = parseFloat(lat);
    let longitude = parseFloat(lng);

    // Fallback if coordinates missing
    if (isNaN(latitude) || isNaN(longitude)) {
      const defaultLoc = resolveKnownLocation('noida sector 62');
      latitude = defaultLoc.lat;
      longitude = defaultLoc.lng;
    }

    const radiusInMeters = parseFloat(radius) * 1000;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build match filter for aggregation
    const matchFilter = {
      status: 'active',
      expiresAt: { $gt: new Date() },
    };

    if (walkIn === 'true' || walkIn === true) {
      matchFilter.walkIn = true;
    }

    if (category && category !== 'All') {
      matchFilter.$or = [
        { category: category },
        { categories: category },
      ];
    }

    if (skills) {
      const skillList = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
      matchFilter.skills = { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) };
    }

    if (experienceLevel && experienceLevel !== 'All') {
      matchFilter.experienceLevel = experienceLevel;
    }

    if (employmentType && employmentType !== 'All') {
      matchFilter.employmentType = employmentType;
    }

    if (workMode && workMode !== 'All') {
      matchFilter.workMode = workMode;
    }

    if (salaryMin) {
      matchFilter.salaryMax = { $gte: parseFloat(salaryMin) };
    }

    if (salaryMax) {
      matchFilter.salaryMin = { $lte: parseFloat(salaryMax) };
    }

    if (postedWithin) {
      const now = new Date();
      let pastDate = new Date();
      if (postedWithin === '1h') pastDate.setHours(now.getHours() - 1);
      else if (postedWithin === 'today' || postedWithin === '24h') pastDate.setDate(now.getDate() - 1);
      else if (postedWithin === '3d') pastDate.setDate(now.getDate() - 3);
      else if (postedWithin === '7d') pastDate.setDate(now.getDate() - 7);
      else if (postedWithin === '30d') pastDate.setDate(now.getDate() - 30);
      matchFilter.postedAt = { $gte: pastDate };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchFilter.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { skills: searchRegex },
        { locationName: searchRegex },
      ];
    }

    // If MongoDB is not connected, use in-memory fallback directly
    if (mongoose.connection.readyState !== 1) {
      return this.fallbackNearbySearch(latitude, longitude, radius, {
        category,
        skills,
        experienceLevel,
        workMode,
        walkIn,
        search,
      }, sortBy, page, limit, user);
    }

    // Determine Sort Stage
    let sortStage = { distanceMeters: 1 }; // Default nearest
    if (sortBy === 'latest') {
      sortStage = { postedAt: -1 };
    } else if (sortBy === 'salary_desc') {
      sortStage = { salaryMax: -1 };
    } else if (sortBy === 'salary_asc') {
      sortStage = { salaryMin: 1 };
    }

    // Geospatial Aggregation Pipeline using $geoNear
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusInMeters,
          spherical: true,
          query: matchFilter,
        },
      },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          jobs: [{ $skip: skip }, { $limit: parseInt(limit) }],
        },
      },
    ];

    try {
      const results = await Job.aggregate(pipeline);
      const total = results[0]?.metadata[0]?.total || 0;
      const rawJobs = results[0]?.jobs || [];

      if (total === 0 && (await Job.countDocuments()) === 0) {
        // Empty DB, fall back to mock data
        return this.fallbackNearbySearch(latitude, longitude, radius, {
          category,
          skills,
          experienceLevel,
          workMode,
          walkIn,
          search,
        }, sortBy, page, limit, user);
      }

      // Format distance in km and attach AI match scores
      const jobs = rawJobs.map((job) => {
        const distanceKm = Math.round((job.distanceMeters / 1000) * 10) / 10;
        const matchInfo = calculateJobMatch(user, job);

        return {
          ...job,
          distance: distanceKm,
          distanceUnit: 'km',
          matchScore: matchInfo.matchScore,
          matchedSkills: matchInfo.matchedSkills,
          missingSkills: matchInfo.missingSkills,
          matchReason: matchInfo.reason,
        };
      });

      return {
        jobs,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit) || 1,
        userLocation: { lat: latitude, lng: longitude, radiusKm: parseFloat(radius) },
      };
    } catch (err) {
      return this.fallbackNearbySearch(latitude, longitude, radius, {
        category,
        skills,
        experienceLevel,
        workMode,
        walkIn,
        search,
      }, sortBy, page, limit, user);
    }
  }

  /**
   * Fallback in-memory distance calculator
   */
  async fallbackNearbySearch(lat, lng, radiusKm, filterOpts = {}, sortBy, page, limit, user) {
    let pool = [...MOCK_JOBS_DATA];

    if (mongoose.connection.readyState === 1) {
      try {
        const dbJobs = await Job.find({ status: 'active' }).lean();
        if (dbJobs.length > 0) pool = dbJobs;
      } catch (e) {}
    }

    // Apply filters to memory pool
    let filtered = pool.filter((job) => {
      if (filterOpts.walkIn === 'true' || filterOpts.walkIn === true) {
        if (!job.walkIn) return false;
      }
      if (filterOpts.category && filterOpts.category !== 'All') {
        const catMatch =
          job.category === filterOpts.category ||
          (job.categories && job.categories.includes(filterOpts.category));
        if (!catMatch) return false;
      }
      if (filterOpts.skills) {
        const reqSkills = filterOpts.skills.split(',').map((s) => s.trim().toLowerCase());
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
        const hasSkill = reqSkills.some((s) => jobSkills.includes(s));
        if (!hasSkill) return false;
      }
      if (filterOpts.experienceLevel && filterOpts.experienceLevel !== 'All') {
        if (job.experienceLevel !== filterOpts.experienceLevel) return false;
      }
      if (filterOpts.workMode && filterOpts.workMode !== 'All') {
        if (job.workMode !== filterOpts.workMode) return false;
      }
      if (filterOpts.search) {
        const s = filterOpts.search.toLowerCase();
        const text = `${job.title} ${job.companyName} ${job.skills?.join(' ')} ${job.locationName}`.toLowerCase();
        if (!text.includes(s)) return false;
      }
      return true;
    });

    const jobsWithDistance = filtered
      .map((job) => {
        let dist = null;
        if (job.location?.coordinates && job.location.coordinates.length === 2) {
          dist = calculateHaversineDistance(lat, lng, job.location.coordinates[1], job.location.coordinates[0]);
        }
        const matchInfo = calculateJobMatch(user, job);
        return {
          ...job,
          distance: dist,
          distanceUnit: 'km',
          matchScore: matchInfo.matchScore,
          matchedSkills: matchInfo.matchedSkills,
          missingSkills: matchInfo.missingSkills,
          matchReason: matchInfo.reason,
        };
      })
      .filter((j) => j.distance === null || j.distance <= radiusKm);

    // Sort
    if (sortBy === 'latest') {
      jobsWithDistance.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    } else if (sortBy === 'salary_desc') {
      jobsWithDistance.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (sortBy === 'salary_asc') {
      jobsWithDistance.sort((a, b) => a.salaryMin - b.salaryMin);
    } else {
      jobsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    const total = jobsWithDistance.length;
    const skip = (page - 1) * limit;
    const paginated = jobsWithDistance.slice(skip, skip + limit);

    return {
      jobs: paginated,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1,
      userLocation: { lat, lng, radiusKm },
    };
  }

  /**
   * Get dedicated Walk-in jobs
   */
  async getWalkInJobs({ filter = 'all', page = 1, limit = 20, lat, lng }) {
    let pool = MOCK_JOBS_DATA.filter((j) => j.walkIn);

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          walkIn: true,
          status: 'active',
          expiresAt: { $gt: new Date() },
        };
        const dbWalkIns = await Job.find(query).sort({ walkInDate: 1 }).lean();
        if (dbWalkIns.length > 0) pool = dbWalkIns;
      } catch (e) {}
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfTomorrow = new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    let filtered = pool;
    if (filter === 'today') {
      filtered = pool.filter((j) => new Date(j.walkInDate) >= startOfToday && new Date(j.walkInDate) < endOfToday);
    } else if (filter === 'tomorrow') {
      filtered = pool.filter((j) => new Date(j.walkInDate) >= endOfToday && new Date(j.walkInDate) < endOfTomorrow);
    } else if (filter === 'week') {
      filtered = pool.filter((j) => new Date(j.walkInDate) >= startOfToday && new Date(j.walkInDate) < endOfWeek);
    }

    const jobsWithDist = filtered.map((j) => {
      let distance = null;
      if (lat && lng && j.location?.coordinates) {
        distance = calculateHaversineDistance(lat, lng, j.location.coordinates[1], j.location.coordinates[0]);
      }
      return {
        ...j,
        distance,
        distanceUnit: 'km',
      };
    });

    const total = jobsWithDist.length;
    const paginated = jobsWithDist.slice((page - 1) * limit, page * limit);

    return {
      jobs: paginated,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

module.exports = new JobService();
