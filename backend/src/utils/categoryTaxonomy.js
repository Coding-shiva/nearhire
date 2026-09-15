/**
 * Category Taxonomy and Automatic Classifier for NearHire
 */

const CATEGORIES = {
  'Technology / IT': {
    keywords: [
      'developer', 'software', 'engineer', 'frontend', 'backend', 'fullstack', 'full stack',
      'react', 'node', 'python', 'java', 'devops', 'cloud', 'aws', 'data science',
      'machine learning', 'ai', 'qa', 'testing', 'database', 'cyber security', 'mobile',
      'android', 'ios', 'system admin', 'network', 'programmer', 'architect'
    ],
    subCategories: [
      'Software Development', 'Full Stack Development', 'Frontend Development',
      'Backend Development', 'Mobile Development', 'DevOps & Cloud',
      'Cyber Security', 'Data Science & AI', 'QA / Testing', 'IT Support'
    ],
  },
  'Sales': {
    keywords: [
      'sales', 'bde', 'bdm', 'business development', 'inside sales', 'field sales',
      'telecalling', 'lead generation', 'account manager', 'client relations', 'revenue',
      'territory manager', 'presales', 'pre-sales'
    ],
    subCategories: [
      'Sales Executive', 'Business Development (BDE)', 'Inside Sales',
      'Field Sales', 'Sales Management', 'Account Management'
    ],
  },
  'Human Resources': {
    keywords: [
      'hr', 'human resources', 'recruiter', 'recruitment', 'talent acquisition',
      'talent', 'payroll', 'onboarding', 'hr generalist', 'hr executive', 'people partner'
    ],
    subCategories: [
      'HR Executive', 'Recruiter / Talent Acquisition', 'HR Generalist',
      'HR Operations & Payroll', 'Talent Management'
    ],
  },
  'Finance': {
    keywords: [
      'accountant', 'finance', 'financial', 'banking', 'audit', 'taxation',
      'gst', 'ca', 'tally', 'accounts executive', 'treasury', 'bookkeeping'
    ],
    subCategories: [
      'Accountant', 'Financial Analyst', 'Taxation & GST', 'Banking Operations', 'Auditor'
    ],
  },
  'Marketing': {
    keywords: [
      'marketing', 'digital marketing', 'seo', 'sem', 'social media', 'content writer',
      'copywriter', 'growth hacker', 'branding', 'campaign', 'email marketing'
    ],
    subCategories: [
      'Digital Marketing', 'SEO / SEM', 'Social Media Marketing', 'Content & Copywriting'
    ],
  },
  'Operations': {
    keywords: [
      'operations', 'back office', 'process associate', 'supply chain', 'logistics',
      'procurement', 'admin executive', 'data entry', 'inventory'
    ],
    subCategories: [
      'Operations Executive', 'Back Office', 'Process Associate', 'Logistics & Supply Chain'
    ],
  },
  'Customer Support': {
    keywords: [
      'customer support', 'customer service', 'customer care', 'call center', 'bpo',
      'voice process', 'non voice', 'technical support', 'chat support'
    ],
    subCategories: [
      'Voice Support', 'Non-Voice / Chat Support', 'Technical Support', 'Client Support'
    ],
  },
  'Design': {
    keywords: [
      'ui', 'ux', 'ui/ux', 'graphic designer', 'product designer', 'figma', 'creative',
      'motion graphics', 'visual designer', 'illustrator'
    ],
    subCategories: [
      'UI/UX Design', 'Graphic Design', 'Product Design', 'Visual & Motion Design'
    ],
  },
  'Other': {
    keywords: [
      'legal', 'counsel', 'teaching', 'teacher', 'healthcare', 'nurse', 'doctor',
      'hospitality', 'hotel', 'chef', 'management'
    ],
    subCategories: [
      'Healthcare', 'Education & Teaching', 'Legal', 'Hospitality'
    ],
  },
};

/**
 * Automatically determine categories from title and description
 */
function detectCategories(title, description = '') {
  const combined = `${title || ''} ${description || ''}`.toLowerCase();
  const matchedCategories = [];

  for (const [categoryName, data] of Object.entries(CATEGORIES)) {
    const matchCount = data.keywords.filter((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(combined);
    }).length;

    if (matchCount > 0) {
      matchedCategories.push({ category: categoryName, score: matchCount });
    }
  }

  // Sort by match frequency
  matchedCategories.sort((a, b) => b.score - a.score);

  if (matchedCategories.length === 0) {
    return {
      primaryCategory: 'Other',
      allCategories: ['Other'],
      subCategory: 'General',
    };
  }

  const primary = matchedCategories[0].category;
  const all = matchedCategories.map((m) => m.category);

  // Pick subCategory
  let detectedSub = '';
  const subList = CATEGORIES[primary]?.subCategories || [];
  for (const sub of subList) {
    const subClean = sub.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const subTerms = subClean.split(/\s+/).filter((w) => !['development', 'management', 'operations', 'design', 'services'].includes(w) && w.length > 2);
    if (combined.includes(sub.toLowerCase()) || subTerms.some((t) => combined.includes(t))) {
      detectedSub = sub;
      break;
    }
  }
  if (!detectedSub && subList.length > 0) {
    detectedSub = subList[0];
  }

  return {
    primaryCategory: primary,
    allCategories: all,
    subCategory: detectedSub,
  };
}

module.exports = {
  CATEGORIES,
  detectCategories,
};
