'use client';

import { useState } from 'react';
import { Copy, CheckCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InterviewBrief } from '@/types/prepare';
import { useResumeStore } from '@/lib/store/use-resume-store';

interface BriefViewerProps {
  brief: InterviewBrief;
}

export function BriefViewer({ brief }: BriefViewerProps) {
  const { downloadBriefPDF, isProcessing } = useResumeStore();
  const [copiedText, setCopiedText] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(brief.sections.map((_, i) => i))
  );

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const handleCopyText = async () => {
    const text = brief.sections
      .map((section) => {
        let content = `# ${section.title}\n\n${section.content}`;
        if (section.tips && section.tips.length > 0) {
          content += `\n\n**Tips:**\n${section.tips.map((t) => `- ${t}`).join('\n')}`;
        }
        return content;
      })
      .join('\n\n---\n\n');

    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={downloadBriefPDF}
          disabled={isProcessing}
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

      {/* Brief Sections */}
      <div className="space-y-4">
        {brief.sections.map((section, index) => {
          const isExpanded = expandedSections.has(index);

          return (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleSection(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-surface/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                    {section.content}
                  </div>

                  {section.tips && section.tips.length > 0 && (
                    <div className="pt-4 border-t border-text-muted/20">
                      <h4 className="font-medium mb-2 text-primary dark:text-green-400">Tips:</h4>
                      <ul className="space-y-1">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-text-secondary flex gap-2">
                            <span className="text-primary dark:text-green-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer Info */}
      <Card className="p-4 bg-surface">
        <p className="text-sm text-text-secondary">
          <strong>Format:</strong> {brief.format === '30min' ? '30-minute' : '60-minute'}{' '}
          interview • Generated on {new Date(brief.generatedAt).toLocaleDateString()}
        </p>
      </Card>
    </div>
  );
}
