const Parser = require('rss-parser');

/**
 * Public RSS/Atom feed parser for permitted career feeds
 */
class RSSJobFetcher {
  constructor() {
    this.parser = new Parser();
  }

  async fetch(url) {
    try {
      const feed = await this.parser.parseURL(url);
      const items = (feed.items || []).map((item, idx) => ({
        sourceJobId: item.guid || item.id || `rss-${idx}-${Date.now()}`,
        title: item.title || 'Untitled Job',
        companyName: item.creator || item.author || 'Company Feed',
        description: item.contentSnippet || item.content || item.summary || '',
        applyUrl: item.link || '',
        postedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        source: 'RSS',
      }));
      return items;
    } catch (err) {
      console.warn(`[RSSFetcher] Failed to parse RSS feed ${url}: ${err.message}`);
      return [];
    }
  }
}

module.exports = RSSJobFetcher;
