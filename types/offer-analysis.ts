export interface OfferAnalysisInput {
  baseSalary: number;
  equity?: {
    value: number;
    type: 'shares' | 'rsu' | 'options';
    vestingYears?: number;
  };
  bonus?: number | string; // Can be number or percentage like "15%"
  company: string;
  role: string;
  location: string;
  yearsOfExperience: number;
  currentOffers?: CompetingOffer[];
}

export interface CompetingOffer {
  company: string;
  totalComp: number;
  details?: string;
}

export interface OfferAnalysisOutput {
  marketAnalysis: MarketAnalysis;
  totalCompProjection: TotalCompProjection;
  leverageScore: LeverageAssessment;
  comparableData: ComparableData;
}

export interface MarketAnalysis {
  percentile: number; // e.g., 55 means 55th percentile
  percentileLabel: 'p50' | 'p75' | 'p90' | 'below-market' | 'above-market';
  gapToP75: number; // Dollar amount to reach 75th percentile
  gapToP90: number; // Dollar amount to reach 90th percentile
  marketRange: {
    p50: number;
    p75: number;
    p90: number;
  };
  analysis: string; // Detailed explanation
}

export interface TotalCompProjection {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  fourYearTotal: number;
  assumptions: string[]; // e.g., "Assuming 10% equity growth annually"
  breakdown: {
    baseSalary: number;
    bonus: number;
    equity: number;
  };
}

export interface LeverageAssessment {
  score: number; // 1-10 scale
  explanation: string;
  factors: LeverageFactor[];
  recommendation: string;
}

export interface LeverageFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface ComparableData {
  similarRoles: SimilarRole[];
  companyContext: CompanyContext;
  locationAdjustment: string;
}

export interface SimilarRole {
  company: string;
  role: string;
  totalComp: number;
  yearsOfExperience: number;
  source: string; // e.g., "Industry knowledge", "Public data"
}

export interface CompanyContext {
  companyTier: 'faang' | 'unicorn' | 'public' | 'series-a-to-c' | 'startup' | 'unknown';
  typicalCompStructure: string; // Description of how this company structures comp
  equityLiquidity: string; // When/how equity becomes liquid
  negotiationFlexibility: 'high' | 'medium' | 'low';
  notes: string[];
}

// Negotiation Strategies Types

export interface NegotiationStrategiesOutput {
  conservative: NegotiationStrategy;
  moderate: NegotiationStrategy;
  aggressive: NegotiationStrategy;
  redFlags: string[]; // Pressure tactics, verbal-only offers, etc.
  generalGuidance: string;
}

export interface NegotiationStrategy {
  name: string; // "Conservative", "Moderate", "Aggressive"
  description: string;
  recommendedAsk: CompensationAsk;
  justification: Justification;
  successProbability: number; // 0-100 percentage
  emailTemplate: EmailTemplate;
  pushbackResponses: PushbackResponses;
  psychologicalFraming: string[];
  warnings?: string[];
}

export interface CompensationAsk {
  baseSalary: number;
  equity?: number;
  bonus?: number;
  signingBonus?: number;
  totalComp: number;
  summary: string; // e.g., "$220k base, $100k equity/year, 15% bonus"
}

export interface Justification {
  dataPoints: string[]; // Market data references
  reasoning: string; // Why this is reasonable
  anchoring: string; // How this positions you
  fallbackPosition?: string; // If they can't meet this
}

export interface EmailTemplate {
  subject: string;
  body: string;
  tone: string; // Description of tone
  sendingTips: string[];
}

export interface PushbackResponses {
  aboveBudget: ResponseScript;
  finalOffer: ResponseScript;
  deadlinePressure: ResponseScript;
}

export interface ResponseScript {
  scenario: string;
  response: string;
  explanation: string; // Why this response works
  followUp?: string; // Optional follow-up if needed
}
