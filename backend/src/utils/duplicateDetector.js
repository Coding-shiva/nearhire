const crypto = require('crypto');

/**
 * Clean string for hashing and comparison
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Generate a deterministic duplicate hash for quick index lookup
 */
function generateDuplicateHash(companyName, title, locationName) {
  const normCompany = normalizeString(companyName);
  const normTitle = normalizeString(title).replace(/developer|engineer|lead|senior|jr|junior/g, '');
  const normLoc = normalizeString(locationName).slice(0, 10);

  const key = `${normCompany}_${normTitle}_${normLoc}`;
  return crypto.createHash('md5').update(key).digest('hex');
}

/**
 * Calculate Jaccard similarity between two token sets
 */
function calculateTokenSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }

  const union = new Set([...set1, ...set2]).size;
  return intersection / union;
}

/**
 * Check if a candidate job is a duplicate of existing jobs
 */
function isDuplicateCandidate(existingJob, newJob) {
  // 1. Exact Source Job ID match
  if (
    existingJob.sourceJobId &&
    newJob.sourceJobId &&
    existingJob.source === newJob.source &&
    existingJob.sourceJobId === newJob.sourceJobId
  ) {
    return { isDuplicate: true, reason: 'exact_source_id_match' };
  }

  // 2. Exact application URL match
  if (
    existingJob.applyUrl &&
    newJob.applyUrl &&
    existingJob.applyUrl.toLowerCase().trim() === newJob.applyUrl.toLowerCase().trim()
  ) {
    return { isDuplicate: true, reason: 'exact_apply_url_match' };
  }

  // 3. Normalized company + title + location match
  const comp1 = normalizeString(existingJob.companyName);
  const comp2 = normalizeString(newJob.companyName);

  if (comp1 === comp2) {
    const titleSim = calculateTokenSimilarity(existingJob.title, newJob.title);
    const descSim = calculateTokenSimilarity(existingJob.description, newJob.description);

    if (titleSim >= 0.7 && descSim >= 0.6) {
      return {
        isDuplicate: true,
        reason: 'high_title_and_description_similarity',
        confidence: Math.round(((titleSim + descSim) / 2) * 100),
      };
    }
  }

  return { isDuplicate: false };
}

module.exports = {
  normalizeString,
  generateDuplicateHash,
  calculateTokenSimilarity,
  isDuplicateCandidate,
};
