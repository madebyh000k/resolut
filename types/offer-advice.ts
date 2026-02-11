// Simplified types for MVP negotiate flow

export interface OfferInput {
  baseSalary: number;
  equity?: string; // e.g., "$400k RSUs over 4 years" or "100k options"
  bonus?: number | string; // e.g., 20000 or "15%"
  company: string;
  role: string;
  location: string;
  yearsOfExperience?: number;
}

export interface NegotiationAdvice {
  marketPosition: MarketPosition;
  recommendedAsk: RecommendedAsk;
  emailTemplate: string;
  pushbackResponses: PushbackResponse[];
  redFlags?: string[];
}

export interface MarketPosition {
  percentile: number; // e.g., 55
  totalCompAnnual: string; // e.g., "$212,500/year"
  totalComp4Year: string; // e.g., "$850,000"
  gap: string; // e.g., "15% below market for this role/level"
}

export interface RecommendedAsk {
  base: string; // e.g., "$215,000"
  equity?: string; // e.g., "$450,000 over 4 years"
  rationale: string; // 2-3 sentence explanation
}

export interface PushbackResponse {
  theySay: string;
  youSay: string;
}
