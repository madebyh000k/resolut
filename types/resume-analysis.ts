// Sophisticated 5-dimensional resume analysis types

// SIMPLIFIED FLAT STRUCTURE (for reliable Claude JSON parsing)
export interface ResumeAnalysis {
  // Overall
  overallScore: number; // 0-10 average of all dimensions
  customizedResume: string; // The optimized resume text

  // ATS Compatibility (Dimension 1)
  atsScore: number; // 0-10
  atsIssues: string; // Newline-separated list of issues
  atsFixes: string; // Newline-separated list of exact fixes
  atsParseability: string; // "excellent" | "good" | "fair" | "poor"

  // Impact Quantification (Dimension 2)
  impactScore: number; // 0-10
  bulletsWithMetrics: number;
  bulletsWithoutMetrics: number;
  totalBullets: number;
  weakBulletsText: string; // Newline-separated list of weak bullets with suggestions

  // Keyword Optimization (Dimension 3)
  keywordScore: number; // 0-10
  criticalKeywords: string; // Comma-separated list
  keywordsPresent: string; // Comma-separated list
  keywordsMissing: string; // Newline-separated list with priority
  keywordCoverage: number; // 0-100 percentage

  // Narrative Coherence (Dimension 4)
  narrativeScore: number; // 0-10
  currentNarrative: string; // 1-2 sentence summary
  recommendedNarrative: string; // 1-2 sentence summary
  narrativeFixes: string; // Newline-separated list of reframing suggestions

  // Level-Appropriate Language (Dimension 5)
  levelScore: number; // 0-10
  targetLevel: string; // "entry" | "mid" | "senior" | "staff" | "principal" | "executive"
  currentLevel: string; // same as above
  levelIssues: string; // Newline-separated list of language issues with fixes

  // STAR Method Analysis
  starScore: number; // 0-10
  starBulletsStrong: string; // Newline-separated list of bullets that use STAR format well
  starBulletsWeak: string; // Newline-separated list of bullets that lack STAR structure
  starWeakExamples: string; // Newline-separated: '- [weak bullet] → [STAR rewrite]'

  // Ownership Signals
  ownershipFlags: string; // Newline-separated list of phrases showing ownership vs passive voice

  // Length Analysis
  lengthEstimatedPages: number; // Estimated pages (e.g., 1.5, 2.0)
  lengthWithinLimit: boolean; // true if <= 2 pages
  lengthNote: string; // Explanation of length optimization choices
}

// LEGACY TYPES (kept for backwards compatibility, but not used in new simplified structure)
export interface ResumeAnalysisLegacy {
  atsCompatibility: ATSCompatibilityScore;
  impactQuantification: ImpactQuantificationScore;
  keywordOptimization: KeywordOptimizationScore;
  narrativeCoherence: NarrativeCoherenceScore;
  levelAppropriateLanguage: LevelAppropriateLanguageScore;
  lengthAnalysis: LengthAnalysis;
  overallScore: number;
  customizedResume: string;
}

export interface ATSCompatibilityScore {
  score: number; // 0-10
  formattingIssues: string[];
  exactFixes: string[];
  parseability: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ImpactQuantificationScore {
  score: number; // 0-10
  bulletsWithMetrics: number;
  bulletsWithoutMetrics: number;
  totalBullets: number;
  weakestBullets: WeakBullet[];
}

export interface WeakBullet {
  original: string;
  issue: string;
  suggestedMetric: string;
  example: string;
}

export interface KeywordOptimizationScore {
  score: number; // 0-10
  criticalKeywords: string[];
  keywordsPresent: string[];
  keywordsMissing: KeywordGap[];
  coverageRate: number; // percentage
  stuffingRisk: 'none' | 'low' | 'moderate' | 'high';
}

export interface KeywordGap {
  keyword: string;
  priority: 'critical' | 'high' | 'medium';
  suggestedLocation: string;
  integrationExample: string;
}

export interface NarrativeCoherenceScore {
  score: number; // 0-10
  currentNarrative: string;
  recommendedNarrative: string;
  reframingSuggestions: ReframingSuggestion[];
  angleToEmphasize: string;
}

export interface ReframingSuggestion {
  section: string;
  current: string;
  recommended: string;
  rationale: string;
}

export interface LevelAppropriateLanguageScore {
  score: number; // 0-10
  targetLevel: 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
  currentLevel: 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
  languageIssues: LanguageIssue[];
  scopeAssessment: string;
}

export interface LanguageIssue {
  issue: string;
  example: string;
  fix: string;
  impact: 'high' | 'medium' | 'low';
}

export interface LengthAnalysis {
  estimatedLines: number;
  estimatedPages: number;
  withinLimit: boolean;
  itemsRemoved: string[];
  condensingApplied: string[];
  lengthOptimizationNote: string;
}
