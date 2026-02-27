'use client';

import { Newspaper, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CompanyNews } from '@/types/prepare';
import { cn } from '@/lib/utils/cn';

interface CompanyNewsDisplayProps {
  news: CompanyNews;
}

export function CompanyNewsDisplay({ news }: CompanyNewsDisplayProps) {
  if (news.articles.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="h-5 w-5 text-text-secondary" />
          <h3 className="font-semibold">Recent Company News</h3>
        </div>
        <p className="text-text-secondary text-sm">
          No recent news found for {news.company}. The interview brief will focus on your
          resume and job requirements.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Newspaper className="h-5 w-5 text-primary dark:text-green-400" />
        <h3 className="font-semibold">Recent Company News</h3>
        <span className="text-xs text-text-secondary">
          {news.articles.length} {news.articles.length === 1 ? 'article' : 'articles'}
        </span>
      </div>

      <div className="space-y-4">
        {news.articles.map((article, index) => (
          <div
            key={index}
            className="pb-4 border-b border-text-muted/20 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{article.title}</h4>
                <p className="text-sm text-text-secondary">{article.summary}</p>
              </div>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary dark:text-green-400 hover:text-primary-hover dark:hover:text-green-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {article.relevance && (
              <span
                className={cn(
                  'inline-block mt-2 px-2 py-1 rounded text-xs font-medium',
                  article.relevance === 'high' && 'bg-success/20 text-success dark:text-green-400',
                  article.relevance === 'medium' && 'bg-warning/20 text-warning',
                  article.relevance === 'low' && 'bg-surface text-text-secondary'
                )}
              >
                {article.relevance} relevance
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
