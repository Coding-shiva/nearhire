const { calculateHaversineDistance, kmToRadians } = require('../src/utils/geoUtils');
const { normalizeSkill, extractSkillsFromText } = require('../src/utils/skillTaxonomy');
const { detectCategories } = require('../src/utils/categoryTaxonomy');
const { generateDuplicateHash, calculateTokenSimilarity } = require('../src/utils/duplicateDetector');

describe('NearHire Core Unit Tests', () => {
  describe('Geospatial Utils', () => {
    it('calculates accurate distance between Noida Sec 62 and Connaught Place Delhi', () => {
      // Noida Sec 62: lat 28.6280, lon 77.3649
      // Connaught Place: lat 28.6315, lon 77.2167
      const distance = calculateHaversineDistance(28.6280, 77.3649, 28.6315, 77.2167);
      expect(distance).toBeGreaterThan(13);
      expect(distance).toBeLessThan(16);
    });

    it('returns zero distance for identical coordinates', () => {
      const distance = calculateHaversineDistance(28.6280, 77.3649, 28.6280, 77.3649);
      expect(distance).toBe(0);
    });
  });

  describe('Skill Taxonomy & Normalization', () => {
    it('normalizes common skill variations', () => {
      expect(normalizeSkill('reactjs')).toBe('React');
      expect(normalizeSkill('react.js')).toBe('React');
      expect(normalizeSkill('nodejs')).toBe('Node.js');
      expect(normalizeSkill('mongo')).toBe('MongoDB');
      expect(normalizeSkill('js')).toBe('JavaScript');
      expect(normalizeSkill('k8s')).toBe('Kubernetes');
    });

    it('extracts skills accurately from job description text', () => {
      const text = 'Looking for a React developer with Node.js, Express, MongoDB and AWS experience.';
      const extracted = extractSkillsFromText(text);
      expect(extracted).toContain('React');
      expect(extracted).toContain('Node.js');
      expect(extracted).toContain('MongoDB');
      expect(extracted).toContain('AWS');
    });
  });

  describe('Category Classification', () => {
    it('classifies technical roles into Technology / IT', () => {
      const result = detectCategories('Senior Frontend React Developer', 'Building web applications');
      expect(result.primaryCategory).toBe('Technology / IT');
      expect(result.subCategory).toBe('Frontend Development');
    });

    it('classifies sales roles into Sales', () => {
      const result = detectCategories('Business Development Executive BDE', 'Lead generation and cold calling');
      expect(result.primaryCategory).toBe('Sales');
    });
  });

  describe('Duplicate Detection', () => {
    it('generates consistent duplicate hashes', () => {
      const hash1 = generateDuplicateHash('InnovaTech Solutions', 'React Developer', 'Noida Sector 62');
      const hash2 = generateDuplicateHash('innovatech solutions', 'React Developer', 'Noida Sector 62');
      expect(hash1).toBe(hash2);
    });

    it('measures token similarity for similar job titles', () => {
      const sim = calculateTokenSimilarity('React Developer', 'React JS Developer');
      expect(sim).toBeGreaterThan(0.4);
    });
  });
});
