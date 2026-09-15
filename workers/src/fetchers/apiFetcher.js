const axios = require('axios');

/**
 * Public Job Board API Fetcher
 * Integrates with free, publicly accessible job board APIs
 * (e.g., Arbeitnow, Jobicy) to discover live hiring opportunities.
 */
class APIJobFetcher {
  constructor() {
    this.name = 'Public Job Boards API';
  }

  /**
   * Fetch live jobs from free public job APIs
   */
  async fetchLiveJobs() {
    const jobs = [];

    // 1. Fetch from Arbeitnow Public API
    try {
      const res = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 6000,
        headers: { 'User-Agent': 'NearHire-Aggregator/1.0' },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        for (const item of res.data.data.slice(0, 15)) {
          jobs.push({
            sourceJobId: item.slug || `arbeit-${Date.now()}-${Math.random()}`,
            title: item.title,
            companyName: item.company_name,
            companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
            description: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 800) || '',
            skills: Array.isArray(item.tags) ? item.tags : [],
            category: 'Technology / IT',
            locationName: item.location || 'Noida Sector 62',
            city: 'Noida',
            latitude: 28.6280,
            longitude: 77.3649,
            applyUrl: item.url || '',
            source: 'API',
            workMode: item.remote ? 'Remote' : 'On-site',
            postedAt: item.created_at ? new Date(item.created_at * 1000) : new Date(),
          });
        }
      }
    } catch (err) {
      console.warn(`[APIJobFetcher] Arbeitnow API fetch skipped: ${err.message}`);
    }

    return jobs;
  }
}

module.exports = APIJobFetcher;
