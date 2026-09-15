const mongoose = require('mongoose');
const MockJobProvider = require('../fetchers/mockProvider');
const RSSJobFetcher = require('../fetchers/rssFetcher');

// Note: Reusing backend models and utils
const Job = require('../../backend/src/models/Job');
const JobSource = require('../../backend/src/models/JobSource');
const JobIngestionLog = require('../../backend/src/models/JobIngestionLog');
const { generateDuplicateHash, isDuplicateCandidate } = require('../../backend/src/utils/duplicateDetector');
const { detectCategories } = require('../../backend/src/utils/categoryTaxonomy');
const { extractSkillsFromText, normalizeSkill } = require('../../backend/src/utils/skillTaxonomy');
const { resolveKnownLocation } = require('../../backend/src/utils/geoUtils');
const { processJobAlertsForNewJob } = require('../../backend/src/services/alertService');
const { invalidateJobCaches } = require('../../backend/src/services/cacheService');

/**
 * Execute job ingestion pipeline
 */
async function runIngestionPipeline() {
  const startTime = Date.now();
  console.log('[Ingestion Pipeline] Starting job ingestion run...');

  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;
  let duplicatesFound = 0;
  const errors = [];

  try {
    const sources = await JobSource.find({ enabled: true });
    const mockProvider = new MockJobProvider();
    const rssFetcher = new RSSJobFetcher();

    let incomingJobs = [];

    // 1. Fetch from mock provider
    const mockJobs = await mockProvider.fetchJobs();
    incomingJobs.push(...mockJobs);

    // 2. Fetch from configured RSS sources
    for (const source of sources) {
      if (source.sourceType === 'RSS' && source.url) {
        const rssJobs = await rssFetcher.fetch(source.url);
        incomingJobs.push(...rssJobs);
      }
    }

    totalFetched = incomingJobs.length;
    console.log(`[Ingestion Pipeline] Fetched ${totalFetched} raw job listings.`);

    // 3. Process each job through Normalize -> Validate -> Deduplicate -> Classify -> Store
    for (const raw of incomingJobs) {
      try {
        if (!raw.title || !raw.companyName) {
          continue; // Skip invalid
        }

        // Location Normalization
        let coordinates = [77.3649, 28.6280]; // Default Noida Sec 62
        let locationName = raw.locationName || 'Noida Sector 62';
        let city = raw.city || 'Noida';

        if (raw.latitude && raw.longitude) {
          coordinates = [parseFloat(raw.longitude), parseFloat(raw.latitude)];
        } else {
          const known = resolveKnownLocation(locationName || city);
          if (known) {
            coordinates = [known.lng, known.lat];
            city = known.city;
          }
        }

        // Category Classification
        const catInfo = detectCategories(raw.title, raw.description);
        const primaryCat = raw.category || catInfo.primaryCategory;

        // Skill Extraction & Normalization
        let skills = [];
        if (Array.isArray(raw.skills) && raw.skills.length > 0) {
          skills = raw.skills.map((s) => normalizeSkill(s)).filter(Boolean);
        } else {
          skills = extractSkillsFromText(`${raw.title} ${raw.description}`);
        }

        // Duplicate Detection via Hash and Source ID
        const dupHash = generateDuplicateHash(raw.companyName, raw.title, locationName);

        const existingJob = await Job.findOne({
          $or: [
            { duplicateHash: dupHash },
            { sourceJobId: raw.sourceJobId, source: raw.source },
          ],
        });

        if (existingJob) {
          duplicatesFound++;
          // Update freshness if already present
          existingJob.postedAt = new Date();
          await existingJob.save();
          totalUpdated++;
          continue;
        }

        // Insert new normalized job
        const newJob = await Job.create({
          title: raw.title,
          companyName: raw.companyName,
          companyLogo: raw.companyLogo || undefined,
          description: raw.description || `Position for ${raw.title} at ${raw.companyName}`,
          skills: [...new Set(skills)],
          category: primaryCat,
          categories: catInfo.allCategories,
          subCategory: catInfo.subCategory,
          salaryMin: raw.salaryMin || 350000,
          salaryMax: raw.salaryMax || 700000,
          experienceLevel: raw.experienceLevel || 'Fresher',
          workMode: raw.workMode || 'On-site',
          locationName,
          city,
          location: {
            type: 'Point',
            coordinates,
          },
          applyUrl: raw.applyUrl || '',
          source: raw.source || 'API',
          sourceJobId: raw.sourceJobId || '',
          duplicateHash: dupHash,
          verified: false, // Ingested jobs marked unverified until checked
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        totalAdded++;

        // Trigger alert matches
        processJobAlertsForNewJob(newJob).catch(() => {});
      } catch (err) {
        errors.push(`Error processing ${raw.title}: ${err.message}`);
      }
    }

    // Invalidate Redis caches
    await invalidateJobCaches();

    const executionTimeMs = Date.now() - startTime;

    // Log ingestion execution
    await JobIngestionLog.create({
      sourceName: 'Automated Multi-Source Pipeline',
      status: errors.length === 0 ? 'success' : 'partial',
      jobsFetched: totalFetched,
      jobsAdded: totalAdded,
      jobsUpdated: totalUpdated,
      duplicatesFound,
      errors: errors.slice(0, 10),
      executionTimeMs,
    });

    console.log(
      `[Ingestion Pipeline] Finished in ${executionTimeMs}ms. Added: ${totalAdded}, Updated: ${totalUpdated}, Duplicates: ${duplicatesFound}`
    );
  } catch (error) {
    console.error('[Ingestion Pipeline] Execution Failed:', error);
  }
}

module.exports = {
  runIngestionPipeline,
};
