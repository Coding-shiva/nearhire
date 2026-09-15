const Job = require('../../backend/src/models/Job');
const { invalidateJobCaches } = require('../../backend/src/services/cacheService');

/**
 * Scan and archive expired jobs
 */
async function runExpirySweeper() {
  console.log('[Expiry Sweeper] Checking for expired job postings...');
  try {
    const now = new Date();

    const result = await Job.updateMany(
      {
        status: 'active',
        $or: [
          { expiresAt: { $lt: now } },
          { applicationDeadline: { $ne: null, $lt: now } },
        ],
      },
      {
        $set: { status: 'expired' },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Expiry Sweeper] Marked ${result.modifiedCount} jobs as expired.`);
      await invalidateJobCaches();
    } else {
      console.log('[Expiry Sweeper] No expired jobs found.');
    }
  } catch (err) {
    console.error('[Expiry Sweeper] Error running expiry sweep:', err.message);
  }
}

module.exports = {
  runExpirySweeper,
};
