'use client';

import { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { useResumeStore } from '@/lib/store/use-resume-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ResumeComparison() {
  const { originalResume, customizedResume, downloadPDF } = useResumeStore();
  const [copiedText, setCopiedText] = useState(false);

  if (!customizedResume || !originalResume) {
    return null;
  }

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(customizedResume.customizedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Keywords Added Banner */}
      {customizedResume.keywordsAdded.length > 0 && (
        <Card className="p-4 bg-success/10 border-success">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-success mb-2">
                Added {customizedResume.keywordsAdded.length} ATS keywords to your resume
              </p>
              <div className="flex flex-wrap gap-2">
                {customizedResume.keywordsAdded.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-md bg-success/20 text-success text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
                {customizedResume.keywordsAdded.length > 10 && (
                  <span className="px-2 py-1 text-success text-xs font-medium">
                    +{customizedResume.keywordsAdded.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Download Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={downloadPDF}
          className="flex-1"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleCopyText}
          className="flex-1"
        >
          {copiedText ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5 mr-2" />
              Copy Text
            </>
          )}
        </Button>
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Resume */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-text-muted/30">
            Original Resume
          </h3>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed">
              {originalResume.originalText}
            </pre>
          </div>
        </Card>

        {/* Customized Resume */}
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-primary flex items-center gap-2">
            <span className="text-primary">✨</span>
            Customized Resume
          </h3>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed">
              {customizedResume.customizedText}
            </pre>
          </div>
        </Card>
      </div>

      {/* Tone Profile Info */}
      {customizedResume.toneProfile && (
        <Card className="p-4 bg-surface">
          <p className="text-sm text-text-secondary">
            <strong>Tone preserved:</strong> {customizedResume.toneProfile.formality} formality,{' '}
            {customizedResume.toneProfile.voice} voice,{' '}
            {customizedResume.toneProfile.vocabulary} vocabulary
          </p>
        </Card>
      )}
    </div>
  );
}
