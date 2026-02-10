export interface CompanyNews {
  company: string;
  articles: NewsArticle[];
  fetchedAt: Date;
  source: 'company_website' | 'google_news' | 'industry_general';
}

export interface NewsArticle {
  title: string;
  summary: string;
  date?: string;
  url?: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface InterviewBrief {
  id: string;
  format: '30min' | '60min';
  sections: BriefSection[];
  generatedAt: Date;
}

export interface BriefSection {
  title: string;
  content: string;
  tips?: string[];
}
