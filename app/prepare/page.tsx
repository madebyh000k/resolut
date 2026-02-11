'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { FormatSelector } from '@/components/prepare/FormatSelector';
import { CompanyNewsDisplay } from '@/components/prepare/CompanyNewsDisplay';
import { BriefViewer } from '@/components/prepare/BriefViewer';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { JobUrlInput } from '@/components/job/JobUrlInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Sparkles, Loader2, Check } from 'lucide-react';

export default function PreparePage() {
  const router = useRouter();
  const {
    originalResume,
    jobDescription,
    customizedResume,
    companyNews,
    interviewBrief,
    briefFormat,
    isProcessing,
    error,
    fetchCompanyNews,
    generateInterviewBrief,
    setBriefFormat,
    clearError,
  } = useResumeStore();

  const [localFormat, setLocalFormat] = useState<'30min' | '60min'>(briefFormat);
  const [showResumeUploader, setShowResumeUploader] = useState(false);

  // Check beta access on page load
  useEffect(() => {
    const hasAccess = localStorage.getItem('resolut_beta_access') === 'true';
    if (!hasAccess) {
      router.push('/');
    }
  }, [router]);

  // Fetch company news when job description is added
  useEffect(() => {
    if (jobDescription && !companyNews && !isProcessing) {
      fetchCompanyNews(jobDescription.company);
    }
  }, [jobDescription, companyNews, isProcessing, fetchCompanyNews]);

  const handleGenerateBrief = async () => {
    setBriefFormat(localFormat);
    await generateInterviewBrief(localFormat);
  };

  const handleUseOptimizedResume = () => {
    setShowResumeUploader(false);
  };

  // Determine what resume text to use for the brief
  const resumeText = customizedResume?.customizedText || originalResume?.originalText;
  const canGenerateBrief = resumeText && jobDescription && companyNews;
  const hasOptimizedResume = !!customizedResume;

  return (
    <AppLayout>
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-error font-medium">
              {typeof error === 'string' ? error : error.error || 'An error occurred'}
            </p>
          </div>
          <button
            onClick={clearError}
            className="text-error hover:text-error/80 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
        {jobDescription ? (
          <p className="text-text-secondary">
            Prepare for your interview at {jobDescription.company} for the {jobDescription.title}{' '}
            position
          </p>
        ) : (
          <p className="text-text-secondary">
            Get a personalized interview brief with company insights, talking points, and strategic questions
          </p>
        )}
      </div>

      {/* Step 1: Add Job Posting (always first) */}
      {!jobDescription && (
        <section className="mb-8">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  1
                </span>
                Add Job Posting
              </h2>
              <p className="text-text-secondary ml-10 mt-1">
                Start by pasting the URL of the job you're interviewing for
              </p>
            </div>
            <JobUrlInput />
          </Card>
        </section>
      )}

      {/* Step 2: Choose Resume Source (after job is added) */}
      {jobDescription && !originalResume && !showResumeUploader && (
        <section className="mb-8">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  2
                </span>
                Add Your Resume
              </h2>
              <p className="text-text-secondary ml-10 mt-1">
                Upload your resume to get personalized interview preparation
              </p>
            </div>
            <div className="ml-10">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowResumeUploader(true)}
              >
                Upload Resume
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Resume Uploader (if user clicks upload) */}
      {jobDescription && showResumeUploader && !originalResume && (
        <section className="mb-8">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  2
                </span>
                Upload Your Resume
              </h2>
              <p className="text-text-secondary ml-10 mt-1">
                Upload your resume in PDF or DOCX format
              </p>
            </div>
            <ResumeUploader />
          </Card>
        </section>
      )}

      {/* Resume Choice Card (if coming from Optimize flow) */}
      {jobDescription && hasOptimizedResume && !interviewBrief && (
        <Card className="p-6 mb-8 bg-primary/5 border-2 border-primary/30">
          <div className="flex items-start gap-3">
            <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Using Optimized Resume</h2>
              <p className="text-text-secondary mb-4">
                We'll use your optimized resume for {jobDescription.company} to generate personalized interview strategies that align with your tailored application.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/optimize')}
              >
                View Optimized Resume
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Company News Section */}
      {jobDescription && companyNews && !interviewBrief && (
        <div className="mb-8">
          <CompanyNewsDisplay news={companyNews} />
        </div>
      )}

      {/* Brief Generation (when both job and resume exist) */}
      {jobDescription && resumeText && !interviewBrief && (
        <div className="space-y-6">
          {/* Format Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Interview Format</h2>
            <FormatSelector
              selectedFormat={localFormat}
              onFormatChange={setLocalFormat}
              disabled={isProcessing}
            />
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateBrief}
              disabled={isProcessing || !canGenerateBrief}
              className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Generating Your Interview Brief...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-3" />
                  Generate Interview Brief
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="text-center py-8">
              <p className="text-sm text-text-secondary">
                Analyzing your resume • Researching company • Creating personalized strategies
              </p>
            </div>
          )}
        </div>
      )}

      {/* Brief Display */}
      {interviewBrief && (
        <div className="space-y-6">
          <BriefViewer brief={interviewBrief} />

          {/* Regenerate Option */}
          <div className="text-center pt-6 border-t border-text-muted/20">
            <p className="text-text-secondary mb-4">
              Want to adjust your preparation format?
            </p>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Generate New Brief
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
