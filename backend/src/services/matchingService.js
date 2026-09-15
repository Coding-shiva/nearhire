const aiService = require('./aiService');
const { calculateHaversineDistance } = require('../utils/geoUtils');

/**
 * Match a user profile against a job posting
 */
function calculateJobMatch(user, job) {
  if (!user) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: job.skills || [],
      reason: 'Sign in to see your personalized AI match score.',
    };
  }

  const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map((s) => s.trim());

  let matchedSkills = [];
  let missingSkills = [];

  // 1. Skill Match Weight: 60%
  let skillScore = 0;
  if (jobSkills.length > 0) {
    jobSkills.forEach((skill) => {
      if (userSkills.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
    skillScore = (matchedSkills.length / jobSkills.length) * 60;
  } else {
    skillScore = 40; // Neutral baseline if no skills specified
  }

  // 2. Category Match Weight: 20%
  let categoryScore = 0;
  const userCategories = (user.preferredCategories || []).map((c) => c.toLowerCase());
  if (
    userCategories.length === 0 ||
    userCategories.includes(job.category.toLowerCase()) ||
    (job.categories && job.categories.some((c) => userCategories.includes(c.toLowerCase())))
  ) {
    categoryScore = 20;
  }

  // 3. Work Mode & Experience Match: 10%
  let expScore = 0;
  if (!user.experienceLevel || user.experienceLevel === 'Any' || user.experienceLevel === job.experienceLevel) {
    expScore += 5;
  }
  if (!user.preferredWorkMode || user.preferredWorkMode === 'Any' || user.preferredWorkMode === job.workMode) {
    expScore += 5;
  }

  // 4. Location Proximity: 10%
  let locationScore = 0;
  if (
    user.location?.coordinates &&
    job.location?.coordinates &&
    user.location.coordinates.length === 2 &&
    job.location.coordinates.length === 2
  ) {
    const dist = calculateHaversineDistance(
      user.location.coordinates[1],
      user.location.coordinates[0],
      job.location.coordinates[1],
      job.location.coordinates[0]
    );
    const radius = user.preferredRadiusKm || 25;
    if (dist !== null && dist <= radius) {
      locationScore = 10;
    } else if (dist !== null && dist <= radius * 2) {
      locationScore = 5;
    }
  } else {
    locationScore = 5;
  }

  const rawScore = Math.round(skillScore + categoryScore + expScore + locationScore);
  const matchScore = Math.min(Math.max(rawScore, 10), 98); // Bounds between 10% and 98%

  const reason = aiService.generateMatchExplanation(matchScore, matchedSkills, missingSkills);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    reason,
  };
}

module.exports = {
  calculateJobMatch,
};
