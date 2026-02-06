'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { JobUrlInput } from '@/components/job/JobUrlInput';
import { ResumeComparison } from '@/components/resume/ResumeComparison';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const {
    originalResume,
    jobDescription,
    customizedResume,
    isProcessing,
    error,
    customizeResume,
    reset,
    clearError,
  } = useResumeStore();

  const canCustomize = originalResume && jobDescription && !customizedResume && !isProcessing;
  const showComparison = customizedResume && !isProcessing;

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-text-muted/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {mounted ? (
                <Image
                  src={theme === 'dark' ? '/resolut-light.svg' : '/resolut.svg'}
                  alt="Resolut"
                  width={150}
                  height={50}
                  priority
                />
              ) : (
                <Image
                  src="/resolut.svg"
                  alt="Resolut"
                  width={150}
                  height={50}
                  priority
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              {(originalResume || jobDescription || customizedResume) && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Start Over
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border-2 border-error flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-error font-medium">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-error hover:text-error/80 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workflow Steps */}
        {!showComparison && (
          <div className="space-y-8">
            {/* Welcome Section with 3-Step Process */}
            {!originalResume && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Welcome to Resolut</h2>
                <p className="text-text-secondary mb-8">
                  Optimize your resume for any job in three simple steps
                </p>

                {/* 3-Step Process Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h4 className="font-semibold mb-1">Upload Your Resume</h4>
                    <p className="text-xs text-text-secondary">
                      PDF or DOCX format
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h4 className="font-semibold mb-1">Add Your Job Posting</h4>
                    <p className="text-xs text-text-secondary">
                      LinkedIn, Indeed, or any job board
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h4 className="font-semibold mb-1">Resolut Does the Rest</h4>
                    <p className="text-xs text-text-secondary">
                      Get optimized, ATS-ready resume
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
              <ResumeUploader />
            </section>

            {/* Step 2: Job URL */}
            {originalResume && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
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
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                      3
                    </span>
                    Resolut Does the Rest
                  </h2>
                  <p className="text-text-secondary ml-10 mt-1">
                    Click below to optimize your resume for ATS while preserving your unique voice
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={customizeResume}
                    disabled={isProcessing}
                    className="px-12 py-6 text-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Customizing Your Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        Customize Resume
                      </>
                    )}
                  </Button>
                </div>
              </section>
            )}

            {/* Processing State */}
            {isProcessing && jobDescription && originalResume && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-medium">Customizing your resume...</p>
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
                <span className="text-primary">✨</span>
                Your Customized Resume
              </h2>
              <p className="text-text-secondary mt-1">
                Compare your original and customized resumes below
              </p>
            </div>
            <ResumeComparison />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-text-muted/20 py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-text-secondary">
          <p>Powered by Claude AI • Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
