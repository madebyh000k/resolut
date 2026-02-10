'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NegotiationStrategy, JobOffer } from '@/types/negotiate';
import { useResumeStore } from '@/lib/store/use-resume-store';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Award,
  Package,
} from 'lucide-react';

interface StrategyViewerProps {
  strategy: NegotiationStrategy;
  offer: JobOffer | null;
}

export function StrategyViewer({ strategy, offer }: StrategyViewerProps) {
  const { downloadNegotiationPDF, isProcessing } = useResumeStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCopy = async () => {
    const markdown = generateMarkdown();
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateMarkdown = () => {
    let markdown = `# Negotiation Strategy\n\n`;
    if (offer) {
      markdown += `**Company:** ${offer.company}\n`;
      markdown += `**Position:** ${offer.jobTitle}\n\n`;
    }
    markdown += `---\n\n`;

    // Add bottom line first
    if (strategy.bottomLine) {
      markdown += `## 🎯 BOTTOM LINE\n\n`;
      markdown += `**Recommendation:** ${strategy.bottomLine.recommendation}\n\n`;
      markdown += `${strategy.bottomLine.reasoning}\n\n`;
      markdown += `**One-Line Advice:** ${strategy.bottomLine.oneLineAdvice}\n\n`;
      markdown += `---\n\n`;
    }

    strategy.sections.forEach((section) => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.content}\n\n`;
      if (section.tips && section.tips.length > 0) {
        markdown += `### Key Tips\n\n`;
        section.tips.forEach((tip) => {
          markdown += `- ${tip}\n`;
        });
        markdown += `\n`;
      }
    });

    if (strategy.marketInsights.length > 0) {
      markdown += `## Market Insights\n\n`;
      strategy.marketInsights.forEach((insight) => {
        markdown += `**${insight.category.toUpperCase()}:** ${insight.insight}\n\n`;
        if (insight.recommendation) {
          markdown += `_Recommendation:_ ${insight.recommendation}\n\n`;
        }
      });
    }

    return markdown;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'salary':
        return <DollarSign className="h-4 w-4" />;
      case 'equity':
        return <TrendingUp className="h-4 w-4" />;
      case 'benefits':
        return <Package className="h-4 w-4" />;
      case 'total-comp':
        return <Award className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-500/20 text-green-700 dark:text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      low: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-error/20 text-error',
      medium: 'bg-primary/20 text-primary',
      low: 'bg-text-muted/20 text-text-muted',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getOfferQualityBadge = () => {
    const percentile = strategy.offerPercentile;
    const mode = strategy.responseMode;

    if (percentile >= 95 || mode === 'EXCEPTIONAL_DO_NOT_ESCALATE') {
      return {
        emoji: '🏆',
        text: `EXCEPTIONAL OFFER (${percentile}th percentile)`,
        className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
      };
    } else if (percentile >= 85 || mode === 'STRONG_MINOR_TWEAKS_ONLY') {
      return {
        emoji: '✅',
        text: `STRONG OFFER (${percentile}th percentile)`,
        className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      };
    } else if (percentile >= 70 || mode === 'FAIR_MODEST_NEGOTIATION') {
      return {
        emoji: '📊',
        text: `MARKET RATE (${percentile}th percentile)`,
        className: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
      };
    } else {
      return {
        emoji: '⚠️',
        text: `BELOW MARKET (${percentile}th percentile)`,
        className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
      };
    }
  };

  const qualityBadge = getOfferQualityBadge();

  return (
    <div className="space-y-6">
      {/* Offer Quality Badge */}
      <Card className={`p-4 border-2 ${qualityBadge.className}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{qualityBadge.emoji}</span>
          <div>
            <p className="text-lg font-bold">{qualityBadge.text}</p>
            <p className="text-xs opacity-75">Assessment based on role/level/location market data</p>
          </div>
        </div>
      </Card>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <span className="text-primary">💼</span>
              Your Negotiation Strategy
            </h2>
            <p className="text-text-secondary">
              Personalized advice to help you negotiate the best possible offer
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadNegotiationPDF}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="text-xs text-text-secondary">
          Generated on {new Date(strategy.generatedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </Card>

      {/* Bottom Line - Final Recommendation */}
      {strategy.bottomLine && (
        <Card className="p-6 border-2 border-primary bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">Bottom Line</h3>
                <p className="text-sm text-text-secondary">Clear recommendation for your next move</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background border-2 border-primary">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1.5 rounded-full bg-primary text-white text-sm font-bold">
                  {strategy.bottomLine.recommendation}
                </span>
              </div>
              <p className="text-base leading-relaxed mb-4">
                {strategy.bottomLine.reasoning}
              </p>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs font-semibold text-primary mb-1">ONE-LINE ADVICE:</p>
                <p className="text-sm font-medium">
                  {strategy.bottomLine.oneLineAdvice}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Market Insights */}
      {strategy.marketInsights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Market Insights</h3>
          <div className="space-y-4">
            {strategy.marketInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-surface border border-text-muted/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getCategoryIcon(insight.category)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(
                        insight.confidence
                      )}`}
                    >
                      {insight.confidence} confidence
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm">{insight.insight}</p>
                {insight.recommendation && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">Recommendation</p>
                    <p className="text-sm">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strategy Sections */}
      <div className="space-y-4">
        {strategy.sections.map((section, index) => {
          const sectionId = `section-${index}`;
          const isExpanded = expandedSections[sectionId] ?? true;

          return (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleSection(sectionId)}
                className="w-full p-6 text-left hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                        section.priority
                      )}`}
                    >
                      {section.priority}
                    </span>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-text-secondary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-text-secondary" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-sm leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.tips && section.tips.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-semibold text-primary mb-3">💡 Key Tips</p>
                      <ul className="space-y-2">
                        {section.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
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
    </div>
  );
}
