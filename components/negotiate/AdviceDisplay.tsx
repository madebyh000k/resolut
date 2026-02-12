'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NegotiationAdvice } from '@/types/offer-advice';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Mail,
  Lightbulb,
} from 'lucide-react';

interface AdviceDisplayProps {
  advice: NegotiationAdvice;
}

export function AdviceDisplay({ advice }: AdviceDisplayProps) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [pushbackExpanded, setPushbackExpanded] = useState(false);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(advice.emailTemplate);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Determine percentile color and label
  const getPercentileInfo = (percentile: number) => {
    if (percentile >= 99) {
      return { color: 'text-purple-600 bg-purple-100', label: 'ABSURDLY HIGH', emoji: '🚀' };
    }
    if (percentile >= 95) {
      return { color: 'text-green-600 bg-green-100', label: 'EXCEPTIONAL', emoji: '🏆' };
    }
    if (percentile >= 85) {
      return { color: 'text-blue-600 bg-blue-100', label: 'STRONG', emoji: '💪' };
    }
    if (percentile >= 70) {
      return { color: 'text-yellow-600 bg-yellow-100', label: 'FAIR', emoji: '✅' };
    }
    return { color: 'text-red-600 bg-red-100', label: 'BELOW MARKET', emoji: '⚠️' };
  };

  const percentileInfo = getPercentileInfo(advice.marketPosition.percentile);
  const isExceptional = advice.marketPosition.percentile >= 95;
  const isAbsurd = advice.marketPosition.percentile >= 99;

  // Helper function to get next level for promotion discussions
  const getNextLevel = (currentLevel: string): string => {
    const levelMap: { [key: string]: string } = {
      'Senior PM': 'Staff PM',
      'Staff PM': 'Principal PM',
      'Principal PM': 'Senior Principal PM',
      'Senior Designer': 'Staff Designer',
      'Staff Designer': 'Principal Designer',
      'Principal Designer': 'Design Director',
      'Creative Director': 'Senior Creative Director',
      'Senior Creative': 'Creative Director',
      'Senior Marketing Manager': 'Director of Marketing',
      'Director of Marketing': 'VP Marketing',
      'Senior Engineer': 'Staff Engineer',
      'Staff Engineer': 'Principal Engineer',
    };

    return levelMap[currentLevel] || 'the next level';
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {advice.redFlags && advice.redFlags.length > 0 && (
        <Card className="p-6 bg-primary/5 border-2 border-primary/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Key Insights</h3>
              <p className="text-sm text-text-secondary mb-3">Important context for your negotiation</p>
              <ul className="space-y-2">
                {advice.redFlags.map((flag, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Market Position */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">Market Position</h3>
            <p className="text-sm text-text-secondary">Where your offer stands in the market</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className={`text-3xl font-bold mb-1 text-gray-900 dark:text-white`}>
              {advice.marketPosition.percentile}th percentile
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${percentileInfo.color}`}>
              {percentileInfo.emoji} {percentileInfo.label}
            </div>
          </div>

          <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              {advice.marketPosition.totalCompAnnual}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              ({advice.marketPosition.totalComp4Year} over 4 years)
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Annual Total Compensation</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{advice.marketPosition.gap}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Market Gap</div>
          </div>
        </div>

        {/* Exceptional Offer Warning */}
        {isExceptional && (
          <div className={`mt-4 p-4 rounded-lg ${isAbsurd ? 'bg-purple-50 border-2 border-purple-300' : 'bg-green-50 border-2 border-green-300'}`}>
            <p className="text-sm font-semibold mb-2">
              {isAbsurd ? '🚀 Wait, is this real??' : '🏆 Exceptional Offer'}
            </p>
            <p className="text-sm">
              {isAbsurd
                ? 'This is once-in-a-career compensation. If these numbers are correct, DO NOT negotiate. Sign immediately.'
                : 'This offer is in the top tier of market compensation. Negotiating higher risks the offer for minimal gain. Focus on team fit and role scope instead.'}
            </p>
          </div>
        )}
      </Card>

      {/* Bottom Line Section */}
      <Card className="p-8 bg-surface/50">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Bottom Line
        </h3>

        {/* TLDR Box */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-br from-primary to-primary/90">
          <div className="text-xs font-semibold uppercase tracking-wider text-background/70 mb-2">
            RECOMMENDATION
          </div>
          <div className="text-3xl font-bold text-background leading-tight">
            {advice.recommendedAsk.base}
          </div>
        </div>

        {/* Reasoning */}
        <div className="mb-4 text-base leading-relaxed text-text-primary">
          <span className="font-semibold text-text-primary">Why: </span>
          {advice.recommendedAsk.rationale}
        </div>

        {/* Humor callout for absurd offers */}
        {isAbsurd && advice.redFlags && advice.redFlags.length > 0 && (
          <div
            className="mt-6 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--celebration-bg, rgba(27, 67, 50, 0.1))',
              borderColor: 'var(--celebration-border, #1B4332)'
            }}
          >
            <p
              className="text-sm font-medium mb-0"
              style={{ color: 'var(--celebration-text, #1B4332)' }}
            >
              🚀 Seriously though - if the numbers are correct, take it and don't look back.
            </p>
          </div>
        )}
      </Card>

      {/* Recommended Ask - Only show for offers that need negotiation */}
      {!isExceptional && (
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Recommended Ask</h3>
              <p className="text-sm text-text-secondary">What you should negotiate for</p>
            </div>
          </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div>
              <div className="text-sm text-text-secondary mb-1">Base Salary</div>
              <div className="text-2xl font-bold text-primary">
                {advice.recommendedAsk.base}
              </div>
            </div>
            {advice.recommendedAsk.equity && (
              <div className="text-right">
                <div className="text-sm text-text-secondary mb-1">Equity</div>
                <div className="text-xl font-bold">{advice.recommendedAsk.equity}</div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-surface border border-text-muted/20">
            <div className="text-sm font-medium text-text-secondary mb-2">Why This Works:</div>
            <p className="text-sm leading-relaxed">{advice.recommendedAsk.rationale}</p>
          </div>
        </div>
        </Card>
      )}

      {/* Additional Insights - only show for 70th+ percentile */}
      {advice.marketPosition.percentile >= 70 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-6">💼 Additional Insights</h3>

          {/* Pay Band Ceiling Warning - 85th+ */}
          {advice.marketPosition.percentile >= 85 && (
            <Card className="p-6 mb-4 bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">⚠️</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-yellow-900">Pay Band Ceiling Risk</h4>
                  <p className="text-sm leading-relaxed text-yellow-800 mb-0">
                    {advice.marketPosition.percentile >= 95
                      ? 'You are at the top of the pay band for this level. Future raises will be minimal (2-3% annually). If you want significant comp growth, your next move is a promotion or company change.'
                      : 'You are approaching the top of the pay band for this level. You likely have 2-3 years of meaningful raises left before hitting the ceiling. Plan your next career move accordingly.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Promotion Timing - 85th+ */}
          {advice.marketPosition.percentile >= 85 && (
            <Card className="p-6 mb-4 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">📈</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-blue-900">Consider Promotion Timeline</h4>
                  <p className="text-sm leading-relaxed text-blue-800 mb-3">
                    At this compensation level, ask about promotion timeline during negotiation. Questions to ask:
                  </p>
                  <ul className="text-sm space-y-2 ml-5 list-disc text-blue-800">
                    <li>"What does the path to the next level look like from this role?"</li>
                    <li>"What's the typical timeline for someone at this comp to get promoted?"</li>
                    <li>"Are there level considerations we should discuss given the comp package?"</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Level Negotiation - 95th+ */}
          {advice.marketPosition.percentile >= 95 && (
            <Card className="p-6 mb-4 bg-green-50 border-l-4 border-green-600">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">🎯</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-green-900">Consider Negotiating Level Instead of Comp</h4>
                  <p className="text-sm leading-relaxed text-green-800 mb-3">
                    Your offer is at or above the ceiling for this level. If the company won't budge on comp, consider asking: "Given this compensation package, should we discuss entering at a higher level instead?"
                  </p>
                  <p className="text-xs italic text-green-700 mt-3 pt-3 border-t border-green-200">
                    This sets you up for better long-term comp growth and removes the ceiling constraint.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Equity vs Cash - 70th to 84th percentile */}
          {advice.marketPosition.percentile >= 70 && advice.marketPosition.percentile < 85 && (
            <Card className="p-6 mb-4 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">💰</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-blue-900">Equity vs Cash Considerations</h4>
                  <p className="text-sm leading-relaxed text-blue-800 mb-3">
                    At this comp level, you have negotiation leverage. If they won't move on base salary, consider asking for:
                  </p>
                  <ul className="text-sm space-y-2 ml-5 list-disc text-blue-800">
                    <li>Additional equity grant (10-20% more RSUs)</li>
                    <li>Larger signing bonus (one-time bump)</li>
                    <li>Earlier equity refresh timeline (front-load value)</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Email Template */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-1">Email Template</h3>
              <p className="text-sm text-text-secondary">
                Copy and personalize this email to send to your recruiter
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmail}
            disabled={emailCopied}
          >
            {emailCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Email
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-lg bg-surface border border-text-muted/20 text-sm whitespace-pre-wrap font-sans overflow-x-auto">
            {advice.emailTemplate}
          </pre>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-text-secondary">
            💡 <strong>Tips:</strong> Replace [Recruiter Name], [specific team/project], and
            [Your Name] with actual details before sending. Send from your personal email during
            business hours for best results.
          </p>
        </div>
      </Card>

      {/* Pushback Responses */}
      <Card className="p-6">
        <button
          onClick={() => setPushbackExpanded(!pushbackExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold">Handling Pushback</div>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              {advice.pushbackResponses.length} scenarios
            </span>
          </div>
          {pushbackExpanded ? (
            <ChevronUp className="h-5 w-5 text-text-secondary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-secondary" />
          )}
        </button>

        {pushbackExpanded && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-text-secondary">
              Copy-paste responses for common recruiter objections
            </p>

            {advice.pushbackResponses.map((response, index) => (
              <div key={index} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                <div className="mb-3">
                  <div className="text-xs font-medium text-text-secondary mb-1">THEY SAY:</div>
                  <div className="text-sm italic">"{response.theySay}"</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-primary mb-1">YOU SAY:</div>
                  <div className="text-sm">{response.youSay}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Generate New Button */}
      <div className="text-center pt-6 border-t border-text-muted/20">
        <p className="text-text-secondary mb-4">Want to analyze a different offer?</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Analyze Another Offer
        </Button>
      </div>
    </div>
  );
}
