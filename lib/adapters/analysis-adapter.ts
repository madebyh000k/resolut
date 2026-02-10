/**
 * Adapter to convert flat JSON structure to nested structure for UI compatibility
 * This allows us to use a simpler JSON format from Claude while keeping the existing UI
 */

import { ResumeAnalysis, ResumeAnalysisLegacy } from '@/types/resume-analysis';

export function adaptFlatToNested(flat: ResumeAnalysis): ResumeAnalysisLegacy {
  // Defensive: ensure all fields exist with defaults
  const safeFlat = {
    overallScore: flat.overallScore || 0,
    customizedResume: flat.customizedResume || '',
    atsScore: flat.atsScore || 0,
    atsIssues: flat.atsIssues || '',
    atsFixes: flat.atsFixes || '',
    atsParseability: flat.atsParseability || 'good',
    impactScore: flat.impactScore || 0,
    bulletsWithMetrics: flat.bulletsWithMetrics || 0,
    bulletsWithoutMetrics: flat.bulletsWithoutMetrics || 0,
    totalBullets: flat.totalBullets || 0,
    weakBulletsText: flat.weakBulletsText || '',
    keywordScore: flat.keywordScore || 0,
    criticalKeywords: flat.criticalKeywords || '',
    keywordsPresent: flat.keywordsPresent || '',
    keywordsMissing: flat.keywordsMissing || '',
    keywordCoverage: flat.keywordCoverage || 0,
    narrativeScore: flat.narrativeScore || 0,
    currentNarrative: flat.currentNarrative || '',
    recommendedNarrative: flat.recommendedNarrative || '',
    narrativeFixes: flat.narrativeFixes || '',
    levelScore: flat.levelScore || 0,
    targetLevel: flat.targetLevel || 'mid',
    currentLevel: flat.currentLevel || 'mid',
    levelIssues: flat.levelIssues || '',
    lengthEstimatedPages: flat.lengthEstimatedPages || 1,
    lengthWithinLimit: flat.lengthWithinLimit ?? true,
    lengthNote: flat.lengthNote || '',
  };

  return {
    overallScore: safeFlat.overallScore,
    customizedResume: safeFlat.customizedResume,

    atsCompatibility: {
      score: safeFlat.atsScore,
      formattingIssues: safeFlat.atsIssues.split('\n').filter(Boolean),
      exactFixes: safeFlat.atsFixes.split('\n').filter(Boolean),
      parseability: (safeFlat.atsParseability as 'excellent' | 'good' | 'fair' | 'poor'),
    },

    impactQuantification: {
      score: safeFlat.impactScore,
      bulletsWithMetrics: safeFlat.bulletsWithMetrics,
      bulletsWithoutMetrics: safeFlat.bulletsWithoutMetrics,
      totalBullets: safeFlat.totalBullets,
      weakestBullets: parseWeakBullets(safeFlat.weakBulletsText),
    },

    keywordOptimization: {
      score: safeFlat.keywordScore,
      criticalKeywords: safeFlat.criticalKeywords.split(',').map(k => k.trim()).filter(Boolean),
      keywordsPresent: safeFlat.keywordsPresent.split(',').map(k => k.trim()).filter(Boolean),
      keywordsMissing: parseKeywordGaps(safeFlat.keywordsMissing),
      coverageRate: safeFlat.keywordCoverage,
      stuffingRisk: 'none',
    },

    narrativeCoherence: {
      score: safeFlat.narrativeScore,
      currentNarrative: safeFlat.currentNarrative,
      recommendedNarrative: safeFlat.recommendedNarrative,
      reframingSuggestions: parseReframingSuggestions(safeFlat.narrativeFixes),
      angleToEmphasize: safeFlat.recommendedNarrative,
    },

    levelAppropriateLanguage: {
      score: safeFlat.levelScore,
      targetLevel: safeFlat.targetLevel as any,
      currentLevel: safeFlat.currentLevel as any,
      languageIssues: parseLanguageIssues(safeFlat.levelIssues),
      scopeAssessment: `Target level: ${safeFlat.targetLevel}, Current level: ${safeFlat.currentLevel}`,
    },

    lengthAnalysis: {
      estimatedLines: Math.round(safeFlat.lengthEstimatedPages * 60),
      estimatedPages: safeFlat.lengthEstimatedPages,
      withinLimit: safeFlat.lengthWithinLimit,
      itemsRemoved: [],
      condensingApplied: [],
      lengthOptimizationNote: safeFlat.lengthNote,
    },
  };
}

function parseWeakBullets(text: string): Array<{
  original: string;
  issue: string;
  suggestedMetric: string;
  example: string;
}> {
  if (!text) return [];

  const bullets = text.split('\n').filter(Boolean);
  return bullets.map(line => {
    // Parse format: "- [original] → Suggestion: [improvement]"
    const match = line.match(/^-\s*(.+?)\s*→\s*Suggestion:\s*(.+)$/);
    if (match) {
      return {
        original: match[1].trim(),
        issue: 'Lacks quantifiable metrics',
        suggestedMetric: 'Add specific numbers, percentages, or timeframes',
        example: match[2].trim(),
      };
    }
    return {
      original: line,
      issue: 'Needs improvement',
      suggestedMetric: 'Add metrics',
      example: 'Add specific achievements',
    };
  }).slice(0, 5); // Limit to top 5
}

function parseKeywordGaps(text: string): Array<{
  keyword: string;
  priority: 'critical' | 'high' | 'medium';
  suggestedLocation: string;
  integrationExample: string;
}> {
  if (!text) return [];

  const gaps = text.split('\n').filter(Boolean);
  return gaps.map(line => {
    // Parse format: "- [keyword] (priority) - where to add it"
    const match = line.match(/^-\s*(.+?)\s*\((critical|high|medium)\)\s*-\s*(.+)$/i);
    if (match) {
      return {
        keyword: match[1].trim(),
        priority: match[2].toLowerCase() as 'critical' | 'high' | 'medium',
        suggestedLocation: match[3].trim(),
        integrationExample: `Incorporate "${match[1].trim()}" naturally in ${match[3].trim()}`,
      };
    }
    return {
      keyword: line.replace(/^-\s*/, '').trim(),
      priority: 'medium' as const,
      suggestedLocation: 'Skills or experience section',
      integrationExample: `Add this keyword where relevant`,
    };
  }).slice(0, 10); // Limit to top 10
}

function parseReframingSuggestions(text: string): Array<{
  section: string;
  current: string;
  recommended: string;
  rationale: string;
}> {
  if (!text) return [];

  const suggestions = text.split('\n').filter(Boolean);
  return suggestions.map(line => {
    // Simple parse - treat each line as a suggestion
    return {
      section: 'General',
      current: 'Current framing',
      recommended: line.replace(/^-\s*/, '').trim(),
      rationale: 'Improves alignment with role requirements',
    };
  }).slice(0, 5);
}

function parseLanguageIssues(text: string): Array<{
  issue: string;
  example: string;
  fix: string;
  impact: 'high' | 'medium' | 'low';
}> {
  if (!text) return [];

  const issues = text.split('\n').filter(Boolean);
  return issues.map(line => {
    // Parse format: "- [issue]: [fix]"
    const match = line.match(/^-\s*(.+?):\s*(.+)$/);
    if (match) {
      return {
        issue: match[1].trim(),
        example: 'See resume for examples',
        fix: match[2].trim(),
        impact: 'high' as const,
      };
    }
    return {
      issue: line.replace(/^-\s*/, '').trim(),
      example: 'Review language usage',
      fix: 'Use more senior-appropriate language',
      impact: 'medium' as const,
    };
  }).slice(0, 5);
}
