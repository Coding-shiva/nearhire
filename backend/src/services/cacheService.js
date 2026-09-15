const { cacheGet, cacheSet, cacheDelete } = require('../config/redis');

/**
 * Build deterministic cache key for nearby search
 */
function buildNearbyCacheKey(params) {
  const roundedLat = parseFloat(params.lat || 28.628).toFixed(2);
  const roundedLng = parseFloat(params.lng || 77.365).toFixed(2);
  const radius = params.radius || 25;
  const category = params.category || 'all';
  const skills = params.skills || '';
  const page = params.page || 1;
  const sort = params.sortBy || 'nearest';

  return `jobs:nearby:${roundedLat}_${roundedLng}_${radius}_${category}_${skills}_${sort}_${page}`;
}

async function getCachedNearbyJobs(params) {
  const key = buildNearbyCacheKey(params);
  return await cacheGet(key);
}

async function setCachedNearbyJobs(params, data, ttlSeconds = 180) {
  const key = buildNearbyCacheKey(params);
  await cacheSet(key, data, ttlSeconds);
}

async function invalidateJobCaches() {
  await cacheDelete('jobs:*');
}

module.exports = {
  buildNearbyCacheKey,
  getCachedNearbyJobs,
  setCachedNearbyJobs,
  invalidateJobCaches,
};
