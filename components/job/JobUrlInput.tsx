'use client';

import { useState } from 'react';
import { Link as LinkIcon, Loader2, CheckCircle, Briefcase, AlertCircle } from 'lucide-react';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function JobUrlInput() {
  const [url, setUrl] = useState('');
  const { jobDescription, isProcessing, setJobDescription, error, clearError } = useResumeStore();

  const loginWall = error === 'LOGIN_WALL';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (loginWall) clearError();
    await setJobDescription(url.trim());
  };

  if (jobDescription) {
    return (
      <Card className="p-6 border-2 border-success dark:border-green-400">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Briefcase className="h-10 w-10 text-success dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success dark:text-green-400" />
              <h3 className="font-semibold text-lg">Job Description Loaded</h3>
            </div>
            <p className="text-xl font-medium mb-1">{jobDescription.title}</p>
            <p className="text-text-secondary mb-3">{jobDescription.company}</p>
            {jobDescription.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jobDescription.keywords.slice(0, 8).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 dark:bg-green-900/20 text-primary dark:text-green-400 text-xs font-medium"
                  >
                    {keyword.term}
                  </span>
                ))}
                {jobDescription.keywords.length > 8 && (
                  <span className="px-3 py-1 rounded-full bg-surface text-text-secondary text-xs font-medium">
                    +{jobDescription.keywords.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="job-url" className="block text-sm font-medium mb-2">
            Job Posting URL
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                id="job-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-surface border-2 border-text-muted/30 focus:border-primary focus:outline-none transition-colors"
                disabled={isProcessing}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isProcessing || !url.trim()}
              className="px-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch Job'
              )}
            </Button>
          </div>
          {loginWall ? (
            <div className="flex items-start gap-2 mt-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                Unable to preview this job listing — paste the full job description below or try another source
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-secondary mt-2">
              Supports LinkedIn, Indeed, Greenhouse, and most job boards
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
