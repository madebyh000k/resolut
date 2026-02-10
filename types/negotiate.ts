export interface JobOffer {
  id: string;
  company: string;
  jobTitle: string;
  baseSalary: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  bonus?: number;
  equity?: {
    amount: number;
    type: 'shares' | 'options' | 'rsu';
  };
  benefits?: string[];
  location: string;
  remote: 'fully-remote' | 'hybrid' | 'on-site';
  yearsOfExperience: number;
  roleLevel: 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
  offerDeadline?: Date;
  createdAt: Date;
}

export interface NegotiationStrategy {
  id: string;
  offerId: string;
  sections: StrategySection[];
  generatedAt: Date;
  marketInsights: MarketInsight[];
  bottomLine: BottomLine;
}

export interface StrategySection {
  title: string;
  content: string;
  tips?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface MarketInsight {
  category: 'salary' | 'equity' | 'benefits' | 'total-comp';
  insight: string;
  recommendation?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface BottomLine {
  recommendation: 'ACCEPT' | 'ACCEPT with minor tweaks' | 'NEGOTIATE modest increase' | 'NEGOTIATE significantly OR decline';
  reasoning: string;
  oneLineAdvice: string;
}
