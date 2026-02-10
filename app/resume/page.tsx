'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResumeComparison } from '@/components/resume/ResumeComparison';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResumePage() {
  const router = useRouter();
  const { customizedResume, originalResume, jobDescription } = useResumeStore();

  useEffect(() => {
    if (!customizedResume) {
      router.push('/');
    }
  }, [customizedResume, router]);

  if (!customizedResume || !originalResume || !jobDescription) {
    return (
      <AppLayout>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Resume Available</h2>
          <p className="text-text-secondary mb-6">
            Please complete the resume customization process first.
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-primary">✨</span>
          Your Customized Resume
        </h1>
        <p className="text-text-secondary mt-2">
          For {jobDescription.title} at {jobDescription.company}
        </p>
      </div>
      <ResumeComparison />
    </AppLayout>
  );
}
