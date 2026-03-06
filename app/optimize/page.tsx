'use client';

import { Sparkles, AlertCircle, Loader2, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { JobUrlInput } from '@/components/job/JobUrlInput';
import { ResumeComparison } from '@/components/resume/ResumeComparison';
import { AnalysisDisplay } from '@/components/resume/AnalysisDisplay';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

export default function CustomizePage() {
  const router = useRouter();
  const {
    originalResume,
    jobDescription,
    customizedResume,
    isProcessing,
    error,
    customizeResume,
    clearError,
    recruiterVerdict,
  } = useResumeStore();

  // Check beta access on page load
  useEffect(() => {
    const hasAccess = localStorage.getItem('resolut_beta_access') === 'true';
    if (!hasAccess) {
      router.push('/');
    }
  }, [router]);

  // Debug: Log the analysis structure when it changes
  useEffect(() => {
    if (customizedResume?.analysis) {
      console.log('=== ANALYSIS STRUCTURE DEBUG ===');
      console.log('Analysis object:', customizedResume.analysis);
      console.log('Has keywordsPresent?', 'keywordsPresent' in customizedResume.analysis);
      console.log('keywordsPresent value:', customizedResume.analysis.keywordsPresent);
      console.log('Has atsScore?', 'atsScore' in customizedResume.analysis);
      console.log('Has impactScore?', 'impactScore' in customizedResume.analysis);
      console.log('=== END DEBUG ===');
    }
  }, [customizedResume?.analysis]);

  const canCustomize = originalResume && jobDescription && !customizedResume && !isProcessing;
  const showComparison = customizedResume && !isProcessing;

  return (
    <AppLayout>
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-5 rounded-lg bg-red-50 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {typeof error === 'string' ? 'Error' : error.error}
              </h3>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {typeof error === 'string' ? (
              <p className="text-sm text-gray-700">{error}</p>
            ) : (
              <>
                {error.message && (
                  <p className="text-sm text-gray-700 mb-4">{error.message}</p>
                )}

                {error.suggestions && error.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What to try:</h4>
                    <ul className="space-y-2">
                      {error.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error.tip && (
                  <div className="pt-4 border-t border-red-200">
                    <p className="text-sm text-gray-600">
                      <strong className="text-gray-900">💡 Pro tip:</strong> {error.tip}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Workflow Steps */}
        {!showComparison && (
          <div className="space-y-8">
            {/* Welcome Section with 3-Step Process */}
            {!originalResume && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Get Recruiter Feedback</h2>
                <p className="text-text-secondary mb-8">
                  See your resume through a recruiter's eyes in three simple steps
                </p>

                {/* 3-Step Process Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-green-900/20 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary dark:text-green-400">1</span>
                    </div>
                    <h4 className="font-semibold mb-1">Upload Your Resume</h4>
                    <p className="text-xs text-text-secondary">
                      PDF or DOCX format
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-green-900/20 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary dark:text-green-400">2</span>
                    </div>
                    <h4 className="font-semibold mb-1">Add Your Job Posting</h4>
                    <p className="text-xs text-text-secondary">
                      LinkedIn, Indeed, or any job board
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-green-900/20 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary dark:text-green-400">3</span>
                    </div>
                    <h4 className="font-semibold mb-1">Get Honest Feedback</h4>
                    <p className="text-xs text-text-secondary">
                      See what's working, what's broken, and how to fix it
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Upload Resume */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Upload Your Resume</h2>
                <p className="text-text-secondary mt-1">
                  Upload your current resume in PDF or DOCX format
                </p>
              </div>

              {/* Upload Tips */}
              {!originalResume && (
                <div className="mb-6 p-4 rounded-lg bg-primary/[0.08] dark:bg-primary/20 border-l-4 border-primary dark:border-green-400">
                  <h4 className="text-sm font-semibold text-primary dark:text-green-400 mb-3 flex items-center gap-2">
                    📄 For best results:
                  </h4>
                  <ul className="space-y-2 mb-3">
                    <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-primary dark:text-green-400 mt-0.5">•</span>
                      <span>Use a <strong className="text-gray-900 dark:text-gray-100 font-semibold">text-based resume</strong> (not image-heavy)</span>
                    </li>
                    <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-primary dark:text-green-400 mt-0.5">•</span>
                      <span>Avoid complex graphics, charts, or design elements</span>
                    </li>
                    <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-primary dark:text-green-400 mt-0.5">•</span>
                      <span>PDF or DOCX from Word/Google Docs works best</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic pt-3 border-t border-primary/15 dark:border-green-400/20 m-0">
                    💡 Heavy design elements can interfere with text extraction. Keep it simple for ATS compatibility anyway!
                  </p>
                </div>
              )}

              <ResumeUploader />
            </section>

            {/* Step 2: Job URL */}
            {originalResume && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-green-400 text-white dark:text-primary text-sm font-bold">
                      2
                    </span>
                    Add Job Posting
                  </h2>
                  <p className="text-text-secondary ml-10 mt-1">
                    Paste the URL of the job you're applying for
                  </p>
                </div>
                <JobUrlInput />
              </section>
            )}

            {/* Step 3: Customize */}
            {canCustomize && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-green-400 text-white dark:text-primary text-sm font-bold">
                      3
                    </span>
                    Get Honest Feedback
                  </h2>
                  <p className="text-text-secondary ml-10 mt-1">
                    Click below to optimize your resume for ATS while preserving your unique voice
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={customizeResume}
                    disabled={isProcessing}
                    className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Optimizing Your Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        Optimize Resume
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-text-secondary">
                    Very detailed job descriptions (5000+ words) may take longer to process. For best results, use standard job postings.
                  </p>
                </div>
              </section>
            )}

            {/* Processing State */}
            {isProcessing && jobDescription && originalResume && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-16 w-16 text-primary dark:text-green-400 animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-medium">Optimizing your resume...</p>
                  <p className="text-sm text-text-secondary mt-2">
                    Analyzing tone • Optimizing keywords • Preserving your voice
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showComparison && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-primary dark:text-green-400">✨</span>
                Your Resume Analysis
              </h2>
              <p className="text-text-secondary mt-1">
                Comprehensive 5-dimensional assessment of your resume
              </p>
            </div>

            {/* Analysis Display */}
            {customizedResume?.analysis && (
              <div className="mb-12">
                <AnalysisDisplay analysis={customizedResume.analysis} recruiterVerdict={recruiterVerdict} />
              </div>
            )}

            {/* Resume Comparison */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-primary dark:text-green-400">✨</span>
                Your Customized Resume
              </h2>
              <p className="text-text-secondary mt-1">
                Compare your original and optimized resumes below
              </p>
            </div>
            <ResumeComparison />

            {/* Interview Preparation CTA */}
            <div className="mt-12 pt-8 border-t border-text-muted/20">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Ready for the Next Step?</h3>
                <p className="text-text-secondary">
                  Prepare for your interview with a personalized interview brief
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/prepare')}
                  className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
                >
                  <Briefcase className="h-6 w-6 mr-3" />
                  Prepare For Interviews
                </Button>
              </div>
            </div>
          </section>
        )}
    </AppLayout>
  );
}
