const axios = require('axios');
const logger = require('../config/logger');
const { extractSkillsFromText, normalizeSkill } = require('../utils/skillTaxonomy');

/**
 * AI Provider abstraction for NearHire
 * Supports Google Gemini, OpenAI, or intelligent rule-based fallback
 */
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'rule_fallback';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  /**
   * Extract skills and categorize using Gemini or Rule-based Taxonomy
   */
  async extractSkillsAndAnalysis(jobTitle, jobDescription) {
    // 1. If Gemini API key is provided, attempt AI extraction
    if (this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `Analyze this job posting:
Title: ${jobTitle}
Description: ${jobDescription.slice(0, 1500)}

Return a strict JSON object with:
{
  "skills": ["Skill1", "Skill2"],
  "summary": "One sentence summary"
}`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          },
          { timeout: 6000 }
        );

        const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          if (Array.isArray(parsed.skills)) {
            const normalized = parsed.skills.map((s) => normalizeSkill(s)).filter(Boolean);
            return {
              skills: [...new Set(normalized)],
              summary: parsed.summary || '',
            };
          }
        }
      } catch (err) {
        logger.warn(`Gemini API call failed (${err.message}). Using taxonomy extraction.`);
      }
    }

    // 2. High performance Rule-based Taxonomy Fallback
    const extracted = extractSkillsFromText(`${jobTitle} ${jobDescription}`);
    return {
      skills: extracted,
      summary: `Hiring for ${jobTitle}`,
    };
  }

  /**
   * Generate explanation reason for profile match
   */
  generateMatchExplanation(score, matchedSkills, missingSkills) {
    if (score >= 80) {
      return `Strong Match! You have ${matchedSkills.length} key required skills (${matchedSkills.slice(0, 3).join(', ')}).`;
    } else if (score >= 50) {
      return `Good Potential Match. You match on ${matchedSkills.slice(0, 2).join(', ')}. Learning ${missingSkills.slice(0, 2).join(', ')} will boost your chances.`;
    } else {
      return `Partial Match. Key skills needed: ${missingSkills.slice(0, 3).join(', ')}.`;
    }
  }
}

module.exports = new AIService();
