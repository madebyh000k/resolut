export interface JobDescription {
  url: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  keywords: Keyword[];
  rawHtml?: string;
  fetchedAt: Date;
}

export interface Keyword {
  term: string;
  category: 'hard_skill' | 'soft_skill' | 'industry_term' | 'qualification' | 'action_verb';
  priority: 'high' | 'medium' | 'low';
}
