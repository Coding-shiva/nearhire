/**
 * Skill Taxonomy and Normalizer for NearHire
 */

const SKILL_SYNONYMS = {
  // Frontend
  reactjs: 'React',
  'react.js': 'React',
  react: 'React',
  'react native': 'React Native',
  reactnative: 'React Native',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vuejs: 'Vue',
  'vue.js': 'Vue',
  vue: 'Vue',
  angularjs: 'Angular',
  'angular.js': 'Angular',
  angular: 'Angular',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',
  tailwind: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  redux: 'Redux',

  // Backend
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  node: 'Node.js',
  express: 'Express.js',
  'express.js': 'Express.js',
  nestjs: 'NestJS',
  'nest.js': 'NestJS',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  'spring boot': 'Spring Boot',
  springboot: 'Spring Boot',
  spring: 'Spring Boot',
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  go: 'Go',
  csharp: 'C#',
  'c#': 'C#',
  dotnet: '.NET',
  '.net': '.NET',
  php: 'PHP',
  laravel: 'Laravel',

  // Database
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sql: 'SQL',
  redis: 'Redis',
  cassandra: 'Cassandra',
  elasticsearch: 'Elasticsearch',

  // DevOps & Cloud
  aws: 'AWS',
  amazonwebservices: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud (GCP)',
  'google cloud': 'Google Cloud (GCP)',
  docker: 'Docker',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  ci_cd: 'CI/CD',
  'ci/cd': 'CI/CD',
  jenkins: 'Jenkins',
  git: 'Git',
  github: 'GitHub',
  linux: 'Linux',
  terraform: 'Terraform',

  // Testing & QA
  selenium: 'Selenium',
  cypress: 'Cypress',
  jest: 'Jest',
  playwright: 'Playwright',
  qa: 'QA Testing',
  manualtesting: 'Manual Testing',
  'manual testing': 'Manual Testing',
  automation: 'Automation Testing',
  'automation testing': 'Automation Testing',

  // AI & Data
  ml: 'Machine Learning',
  'machine learning': 'Machine Learning',
  dl: 'Deep Learning',
  'deep learning': 'Deep Learning',
  nlp: 'NLP',
  'generative ai': 'Generative AI',
  genai: 'Generative AI',
  openai: 'OpenAI API',
  gemini: 'Gemini API',
  pandas: 'Pandas',
  numpy: 'NumPy',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  powerbi: 'Power BI',
  'power bi': 'Power BI',
  tableau: 'Tableau',
  excel: 'Advanced Excel',

  // Sales
  bde: 'Business Development (BDE)',
  bdm: 'Business Development (BDM)',
  'business development': 'Business Development',
  'inside sales': 'Inside Sales',
  'field sales': 'Field Sales',
  telecalling: 'Telecalling',
  leadgeneration: 'Lead Generation',
  'lead generation': 'Lead Generation',
  crm: 'CRM Management',
  salesforce: 'Salesforce',
  hubspot: 'HubSpot',
  negotiation: 'Negotiation Skills',
  coldcalling: 'Cold Calling',
  'cold calling': 'Cold Calling',

  // Human Resources
  recruitment: 'Recruitment',
  recruiter: 'Recruitment',
  'talent acquisition': 'Talent Acquisition',
  'hr operations': 'HR Operations',
  payroll: 'Payroll Management',
  sourcing: 'Candidate Sourcing',
  onboarding: 'Employee Onboarding',
  screening: 'Resume Screening',

  // Design
  figma: 'Figma',
  ui: 'UI Design',
  ux: 'UX Research',
  'ui/ux': 'UI/UX Design',
  photoshop: 'Adobe Photoshop',
  illustrator: 'Adobe Illustrator',
};

/**
 * Normalize an individual skill name
 */
function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  const clean = skill.trim().toLowerCase();
  if (SKILL_SYNONYMS[clean]) {
    return SKILL_SYNONYMS[clean];
  }
  // Capitalize words if not directly in map
  return skill
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract skills from text (title + description) using taxonomy lookup
 */
function extractSkillsFromText(text) {
  if (!text) return [];
  const normalizedText = ` ${text.toLowerCase().replace(/[^a-z0-9+#./\s]/g, ' ')} `;
  const foundSkills = new Set();

  for (const [synonym, canonical] of Object.entries(SKILL_SYNONYMS)) {
    // Avoid small collisions like 'c' or 'go' without boundaries
    const escapedSynonym = synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s,;:.()/-])${escapedSynonym}([\\s,;:.()/-]|$)`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.add(canonical);
    }
  }

  return Array.from(foundSkills);
}

module.exports = {
  SKILL_SYNONYMS,
  normalizeSkill,
  extractSkillsFromText,
};
