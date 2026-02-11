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
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={downloadPDF}
          className="flex-1"
        >
          <Download className="h-5 w-5 mr-2" />
          Download <span className="font-bold underline decoration-2 underline-offset-2">Optimized</span> Resume (PDF)
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleCopyText}
          className="flex-1 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
        >
          {copiedText ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5 mr-2" />
              Copy <span className="font-bold underline decoration-2 underline-offset-2">Optimized</span> Text
            </>
          )}
        </Button>
      </div>

      {/* Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Resume */}
        <Card className="p-6 overflow-hidden bg-background border border-text-muted/20">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-text-muted/30">
            Original Resume
          </h3>
          <div className="max-w-none">
            <pre className="whitespace-pre-wrap break-words font-sans text-xs sm:text-sm text-text-primary leading-relaxed bg-transparent" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {originalResume.originalText}
            </pre>
          </div>
        </Card>

        {/* Customized Resume */}
        <Card className="p-6 overflow-hidden bg-background border-2 border-primary/20">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
            <span className="text-primary">✨</span>
            Customized Resume
          </h3>
          <div className="max-w-none">
            <pre className="whitespace-pre-wrap break-words font-sans text-xs sm:text-sm text-text-primary leading-relaxed bg-transparent" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
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
