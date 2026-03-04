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
  Shield,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface RecruiterVerdict {
  firstImpression: string;
  wouldReadFurther: boolean;
  reason: string;
  strongestSignal: string;
  biggestLiability: string;
  atsRisks: string;
  verdict: 'strong' | 'borderline' | 'pass';
  coachingNote1: string;
  coachingNote2: string;
  coachingNote3: string;
}

interface AnalysisDisplayProps {
  analysis: ResumeAnalysis;
  recruiterVerdict: RecruiterVerdict | null;
}

export function AnalysisDisplay({ analysis, recruiterVerdict }: AnalysisDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    star: false,
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
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-500';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-500';
    return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-500';
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
      <Card className="p-6 bg-primary/5 dark:bg-green-900/20 border-2 border-primary/30 dark:border-green-400/30">
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

      {/* Recruiter Verdict */}
      {recruiterVerdict && (
        <Card className="p-6 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-600 text-white">
          {/* Zone 1: Verdict Badge + First Impression */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-slate-300" />
              <span className="text-xs font-medium tracking-widest uppercase text-slate-400">Recruiter Verdict</span>
            </div>
            <div className="mb-3">
              <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold tracking-wide uppercase ${
                recruiterVerdict.verdict === 'strong'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : recruiterVerdict.verdict === 'borderline'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                {recruiterVerdict.verdict}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">{recruiterVerdict.firstImpression}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {recruiterVerdict.wouldReadFurther ? (
                <>
                  <Eye className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Would read further</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Would not read further</span>
                </>
              )}
            </div>
            {recruiterVerdict.reason && (
              <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">{recruiterVerdict.reason}</p>
            )}
          </div>

          {/* Zone 2: Strongest Signal vs Biggest Liability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-green-400" />
                <h4 className="text-xs font-medium tracking-wide uppercase text-green-400">Strongest Signal</h4>
              </div>
              <p className="text-sm text-slate-200">{recruiterVerdict.strongestSignal}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="h-4 w-4 text-red-400" />
                <h4 className="text-xs font-medium tracking-wide uppercase text-red-400">Biggest Liability</h4>
              </div>
              <p className="text-sm text-slate-200">{recruiterVerdict.biggestLiability}</p>
            </div>
          </div>

          {/* Zone 3: Coaching Notes */}
          <div>
            <h4 className="text-xs font-medium tracking-wide uppercase text-slate-400 mb-3">Coaching Notes</h4>
            <div className="space-y-2">
              {[recruiterVerdict.coachingNote1, recruiterVerdict.coachingNote2, recruiterVerdict.coachingNote3].map((note, idx) => (
                note && (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-300">{note}</p>
                  </div>
                )
              ))}
            </div>
            {recruiterVerdict.atsRisks && recruiterVerdict.atsRisks.trim() && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-medium tracking-wide uppercase text-amber-400">ATS Risks</h4>
                </div>
                <ul className="space-y-1">
                  {recruiterVerdict.atsRisks.split('\n').filter(r => r.trim()).map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STAR Story Quality */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('star')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">STAR Story Quality</h3>
              <p className="text-sm text-text-secondary">
                Situation, Task, Action, Result structure
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.starScore)}`}>
              {analysis.starScore}/10
            </div>
            {expandedSections.star ? (
              <ChevronUp className="h-5 w-5 text-text-secondary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-secondary" />
            )}
          </div>
        </button>

        {expandedSections.star && (
          <div className="mt-6 space-y-4">
            {/* Strong vs Weak Bullet Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold text-primary dark:text-green-400">
                  {analysis.starBulletsStrong ? splitLines(analysis.starBulletsStrong).length : 0}
                </div>
                <div className="text-xs text-text-secondary mt-1">Strong STAR Bullets</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analysis.starBulletsWeak ? splitLines(analysis.starBulletsWeak).length : 0}
                </div>
                <div className="text-xs text-text-secondary mt-1">Weak STAR Bullets</div>
              </div>
            </div>

            {/* Weak Examples with Fixes */}
            {analysis.starWeakExamples && splitLines(analysis.starWeakExamples).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Bullets Missing STAR Components</h4>
                {splitLines(analysis.starWeakExamples).map((example, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface border border-text-muted/20">
                    <div className="text-sm">{example}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Ownership Flags */}
            {analysis.ownershipFlags && analysis.ownershipFlags.trim() && (
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  Vague Ownership Language
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  Phrases like &quot;contributed to&quot; or &quot;supported&quot; signal shared credit rather than direct ownership — elite hiring processes filter for candidates who clearly drove outcomes.
                </p>
                <ul className="space-y-2">
                  {splitLines(analysis.ownershipFlags).map((flag, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Dimension 1: ATS Compatibility */}
      <Card className="p-6">
        <button
          onClick={() => toggleSection('ats')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
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
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  Formatting Issues
                </h4>
                <ul className="space-y-2">
                  {splitLines(analysis.atsIssues).map((issue, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.atsFixes && splitLines(analysis.atsFixes).length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-green-900/20 border border-primary/20 dark:border-green-400/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary dark:text-green-400" />
                  Recommended Fixes
                </h4>
                <ul className="space-y-2">
                  {splitLines(analysis.atsFixes).map((fix, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary dark:text-green-400 mt-1">✓</span>
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
            <TrendingUp className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
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
                <div className="text-2xl font-bold text-primary dark:text-green-400">{analysis.bulletsWithMetrics}</div>
                <div className="text-xs text-text-secondary mt-1">With Metrics</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysis.bulletsWithoutMetrics}</div>
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
            <Target className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
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
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary dark:bg-green-400 h-2 rounded-full"
                    style={{ width: `${analysis.keywordCoverage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <div className="text-xs text-text-secondary mb-1">Keywords Present</div>
                  <div className="text-lg font-bold text-primary dark:text-green-400">
                    {splitCommas(analysis.keywordsPresent).length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Keywords Missing</div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {splitLines(analysis.keywordsMissing).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Present Keywords */}
            {analysis.keywordsPresent && splitCommas(analysis.keywordsPresent).length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-green-900/20 border border-primary/20 dark:border-green-400/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary dark:text-green-400" />
                  Present Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {splitCommas(analysis.keywordsPresent).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-primary/20 dark:bg-green-900/30 text-primary dark:text-green-400 text-sm font-medium"
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
            <MessageSquare className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
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
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-green-900/20 border border-primary/20 dark:border-green-400/20">
                <h4 className="font-medium mb-2 text-sm text-primary dark:text-green-400">RECOMMENDED NARRATIVE:</h4>
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
            <Briefcase className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
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
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-green-900/20 border border-primary/20 dark:border-green-400/20 text-center">
                <div className="text-xs text-text-secondary mb-1">TARGET LEVEL</div>
                <div className="text-xl font-bold capitalize text-primary dark:text-green-400">
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
            <Ruler className="h-6 w-6 text-primary dark:text-green-400 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">Length Optimization</h3>
              <p className="text-sm text-text-secondary">
                {analysis.lengthEstimatedPages.toFixed(1)} pages • {analysis.lengthWithinLimit ? 'Within limit' : 'Exceeds 2 pages'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
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
                <div className={`text-2xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {analysis.lengthEstimatedPages.toFixed(1)}
                </div>
                <div className="text-xs text-text-secondary mt-1">Pages</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface">
                <div className={`text-2xl font-bold ${analysis.lengthWithinLimit ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {analysis.lengthWithinLimit ? '✓' : '✗'}
                </div>
                <div className="text-xs text-text-secondary mt-1">Status</div>
              </div>
            </div>

            {/* Optimization Note */}
            {analysis.lengthNote && (
              <div className="p-4 rounded-lg bg-primary/5 dark:bg-green-900/20 border-2 border-primary/30 dark:border-green-400/30">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary dark:text-green-400" />
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
