'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeAnalysis } from '@/types/resume-analysis';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  MessageSquare,
  Briefcase,
  FileCheck,
  Lightbulb,
  Ruler,
} from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: ResumeAnalysis;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ats: false,
    impact: false,
    keywords: false,
    narrative: false,
    language: false,
    length: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100 border-green-300';
    if (score >= 6) return 'bg-yellow-100 border-yellow-300';
    return 'bg-orange-100 border-orange-300';
  };

  // Helper to split newline-separated strings into arrays
  const splitLines = (text: string): string[] => {
    return text ? text.split('\n').filter(line => line.trim()) : [];
  };

  // Helper to split comma-separated strings into arrays
  const splitCommas = (text: string): string[] => {
    return text ? text.split(',').map(item => item.trim()).filter(Boolean) : [];
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-primary/5 border-2 border-primary/30">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Overall Resume Score</h2>
          <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)} mb-2`}>
            {analysis.overallScore.toFixed(1)}<span className="text-3xl">/10</span>
          </div>
          <p className="text-sm text-text-secondary">
            Based on comprehensive 5-dimensional analysis
          </p>
        </div>
      </Card>

      {/* Dimension 1: ATS Compatibility */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('ats')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">ATS Compatibility</h3>
              <p className="text-sm text-text-secondary">
                Parseability: {analysis.atsParseability}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.atsScore)}`}>
              {analysis.atsScore}/10
            </div>
            {expandedSections.ats ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.ats && (
          <div className="mt-6 space-y-4">
            {analysis.atsIssues && splitLines(analysis.atsIssues).length > 0 && (
              <div className="p-4 rounded-lg bg-surface border border-text-muted/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Formatting Issues
                </h4>
                <ul className="space-y-2">
                  {splitLines(analysis.atsIssues).map((issue, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.atsFixes && splitLines(analysis.atsFixes).length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Recommended Fixes
                </h4>
                <ul className="space-y-2">
                  {splitLines(analysis.atsFixes).map((fix, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dimension 2: Impact Quantification */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('impact')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Impact Quantification</h3>
              <p className="text-sm text-text-secondary">
                {analysis.bulletsWithMetrics}/{analysis.totalBullets} bullets have metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.impactScore)}`}>
              {analysis.impactScore}/10
            </div>
            {expandedSections.impact ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.impact && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold text-primary">{analysis.bulletsWithMetrics}</div>
                <div className="text-xs text-text-secondary mt-1">With Metrics</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold text-orange-600">{analysis.bulletsWithoutMetrics}</div>
                <div className="text-xs text-text-secondary mt-1">Without Metrics</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold">{analysis.totalBullets}</div>
                <div className="text-xs text-text-secondary mt-1">Total Bullets</div>
              </div>
            </div>

            {analysis.weakBulletsText && splitLines(analysis.weakBulletsText).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Bullets Needing Metrics</h4>
                {splitLines(analysis.weakBulletsText).map((bullet, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                    <div className="text-sm">{bullet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dimension 3: Keyword Optimization */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('keywords')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Keyword Optimization</h3>
              <p className="text-sm text-text-secondary">
                {analysis.keywordCoverage}% coverage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.keywordScore)}`}>
              {analysis.keywordScore}/10
            </div>
            {expandedSections.keywords ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.keywords && (
          <div className="mt-6 space-y-4">
            {/* Coverage Stats */}
            <div className="p-4 rounded-lg bg-surface border border-text-muted/20">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Coverage Rate</span>
                  <span className="text-sm font-bold">{analysis.keywordCoverage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${analysis.keywordCoverage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-xs text-text-secondary mb-1">Keywords Present</div>
                  <div className="text-lg font-bold text-primary">
                    {splitCommas(analysis.keywordsPresent).length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Keywords Missing</div>
                  <div className="text-lg font-bold text-orange-600">
                    {splitLines(analysis.keywordsMissing).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Present Keywords */}
            {analysis.keywordsPresent && splitCommas(analysis.keywordsPresent).length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Present Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {splitCommas(analysis.keywordsPresent).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {analysis.keywordsMissing && splitLines(analysis.keywordsMissing).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Missing Keywords to Add</h4>
                {splitLines(analysis.keywordsMissing).map((gap, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                    <div className="text-sm">{gap}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dimension 4: Narrative Coherence */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('narrative')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Narrative Coherence</h3>
              <p className="text-sm text-text-secondary">Story clarity and positioning</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.narrativeScore)}`}>
              {analysis.narrativeScore}/10
            </div>
            {expandedSections.narrative ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.narrative && (
          <div className="mt-6 space-y-4">
            {/* Current vs Recommended Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface border border-text-muted/20">
                <h4 className="font-medium mb-2 text-sm text-text-secondary">CURRENT NARRATIVE:</h4>
                <p className="text-sm">{analysis.currentNarrative}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 text-sm text-primary">RECOMMENDED NARRATIVE:</h4>
                <p className="text-sm">{analysis.recommendedNarrative}</p>
              </div>
            </div>

            {/* Reframing Suggestions */}
            {analysis.narrativeFixes && splitLines(analysis.narrativeFixes).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Reframing Suggestions</h4>
                {splitLines(analysis.narrativeFixes).map((suggestion, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                    <div className="text-sm">{suggestion}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dimension 5: Level-Appropriate Language */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('language')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Level-Appropriate Language</h3>
              <p className="text-sm text-text-secondary">
                Target: {analysis.targetLevel} • Current: {analysis.currentLevel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.levelScore)}`}>
              {analysis.levelScore}/10
            </div>
            {expandedSections.language ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.language && (
          <div className="mt-6 space-y-4">
            {/* Level Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface border border-text-muted/20 text-center">
                <div className="text-xs text-text-secondary mb-1">CURRENT LEVEL</div>
                <div className="text-xl font-bold capitalize">{analysis.currentLevel}</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <div className="text-xs text-text-secondary mb-1">TARGET LEVEL</div>
                <div className="text-xl font-bold capitalize text-primary">
                  {analysis.targetLevel}
                </div>
              </div>
            </div>

            {/* Language Issues */}
            {analysis.levelIssues && splitLines(analysis.levelIssues).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Language Issues to Fix</h4>
                {splitLines(analysis.levelIssues).map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                    <div className="text-sm">{issue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Length Analysis */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('length')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Ruler className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Length Optimization</h3>
              <p className="text-sm text-text-secondary">
                {analysis.lengthEstimatedPages.toFixed(1)} pages • {analysis.lengthWithinLimit ? 'Within limit' : 'Exceeds 2 pages'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600' : 'text-orange-600'}`}>
              {Math.round(analysis.lengthEstimatedPages * 60)}
            </div>
            {expandedSections.length ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.length && (
          <div className="mt-6 space-y-4">
            {/* Length Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold">{Math.round(analysis.lengthEstimatedPages * 60)}</div>
                <div className="text-xs text-text-secondary mt-1">Lines</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className={`text-2xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600' : 'text-orange-600'}`}>
                  {analysis.lengthEstimatedPages.toFixed(1)}
                </div>
                <div className="text-xs text-text-secondary mt-1">Pages</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className={`text-2xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600' : 'text-orange-600'}`}>
                  {analysis.lengthWithinLimit ? '✓' : '✗'}
                </div>
                <div className="text-xs text-text-secondary mt-1">Status</div>
              </div>
            </div>

            {/* Optimization Note */}
            {analysis.lengthNote && (
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Optimization Strategy
                </h4>
                <p className="text-sm">{analysis.lengthNote}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
