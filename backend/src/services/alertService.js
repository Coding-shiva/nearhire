const JobAlert = require('../models/JobAlert');
const Notification = require('../models/Notification');
const { calculateHaversineDistance } = require('../utils/geoUtils');
const logger = require('../config/logger');

/**
 * Check a newly added or updated job against active user job alerts
 */
async function processJobAlertsForNewJob(job) {
  try {
    const activeAlerts = await JobAlert.find({ active: true }).populate('user');
    if (!activeAlerts || activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      if (!alert.user) continue;

      let isMatch = true;

      // 1. Check Category match
      if (alert.category && alert.category !== 'All') {
        const catMatch =
          alert.category.toLowerCase() === job.category.toLowerCase() ||
          (job.categories && job.categories.some((c) => c.toLowerCase() === alert.category.toLowerCase()));
        if (!catMatch) isMatch = false;
      }

      // 2. Check Skills match
      if (isMatch && alert.skills && alert.skills.length > 0) {
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
        const matchesAnySkill = alert.skills.some((s) => jobSkills.includes(s.toLowerCase()));
        if (!matchesAnySkill) isMatch = false;
      }

      // 3. Check Experience match
      if (isMatch && alert.experienceLevel && alert.experienceLevel !== 'Any') {
        if (job.experienceLevel !== alert.experienceLevel) isMatch = false;
      }

      // 4. Check Location distance
      if (
        isMatch &&
        alert.location?.coordinates &&
        job.location?.coordinates &&
        alert.location.coordinates.length === 2 &&
        job.location.coordinates.length === 2
      ) {
        const dist = calculateHaversineDistance(
          alert.location.coordinates[1],
          alert.location.coordinates[0],
          job.location.coordinates[1],
          job.location.coordinates[0]
        );
        if (dist !== null && dist > alert.radiusKm) {
          isMatch = false;
        }
      }

      // If matched, create notification
      if (isMatch) {
        if (alert.inAppNotification) {
          await Notification.create({
            user: alert.user._id,
            type: 'job_alert',
            title: `New Job Match: ${job.title}`,
            message: `${job.title} at ${job.companyName} matches your alert '${alert.title}'.`,
            job: job._id,
            link: `/jobs/${job._id}`,
          });
        }

        // Update alert lastTriggered timestamp
        alert.lastTriggered = new Date();
        await alert.save();
        logger.info(`Job Alert triggered for user ${alert.user.email}: ${job.title}`);
      }
    }
  } catch (err) {
    logger.error(`Error processing job alerts: ${err.message}`);
  }
}

module.exports = {
  processJobAlertsForNewJob,
};
