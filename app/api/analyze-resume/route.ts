import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ResumeAnalysis } from '@/types/resume-analysis';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse, validateRequiredFields } from '@/lib/api-optimization/json-parser';
import {
  createJdAnalystPrompt,
  createStrategistWriterPrompt,
  createRecruiterPrompt,
  createScorerPrompt,
} from '@/lib/claude/prompts-simplified';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Helper: extract text from Claude response ────────────────────────────────
function extractText(message: Anthropic.Message): string {
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response format from Claude');
  return content.text;
}

// ─── Helper: parse JSON from agent response ───────────────────────────────────
function parseAgentJson<T>(raw: string, agentName: string): T {
  // Strip markdown fences if present
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`[${agentName}] No JSON object found in response`);
  }
  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback to robust parser
    return parseClaudeJsonResponse<T>(cleaned);
  }
}

// ─── Helper: run a single agent call ─────────────────────────────────────────
async function runAgent(
  feature: Parameters<typeof makeOptimizedApiCall>[0]['feature'],
  model: string,
  prompt: string,
  inputs: Record<string, any>,
  request: NextRequest
): Promise<string> {
  const result = await makeOptimizedApiCall({
    feature,
    inputs,
    anthropicCall: () =>
      anthropic.messages.create({
        model,
        max_tokens: getMaxTokens(feature),
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    request,
  });

  if (!result.success) {
    throw new Error(`Agent ${feature} failed: ${result.error}`);
  }

  return extractText(result.data as Anthropic.Message);
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, companyName } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // ── Rate limit check on the pipeline feature (not individual agents) ──────
    // We check 'optimize' once here before starting the chain.
    // Individual agent calls bypass rate limiting (they're sub-steps).
    const rateLimitCheck = await makeOptimizedApiCall({
      feature: 'optimize',
      inputs: { resumeText, jobDescription, companyName },
      anthropicCall: () => Promise.reject(new Error('rate-limit-check-only')),
      request,
    });

    // If rate limited, the call will fail before hitting anthropicCall
    // We only care about the rate limit result here, not the error
    if (!rateLimitCheck.success && rateLimitCheck.error?.includes('Daily limit reached')) {
      return NextResponse.json(
        { error: rateLimitCheck.error, usage: rateLimitCheck.usage },
        { status: 429 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AGENT 1 — JD ANALYST (Haiku)
    // Extract structured signal from the job description
    // ─────────────────────────────────────────────────────────────────────────
    console.log('🔍 [Agent 1] JD Analyst starting...');
    const jdAnalystRaw = await runAgent(
      'agent-jd-analyst',
      'claude-haiku-4-5-20251001',
      createJdAnalystPrompt(jobDescription),
      { jobDescription },
      request
    );
    const jdAnalysis = parseAgentJson<Record<string, string>>(jdAnalystRaw, 'JD Analyst');
    console.log('✅ [Agent 1] JD Analyst complete');

    // ─────────────────────────────────────────────────────────────────────────
    // AGENT 2 — STRATEGIST + WRITER (Sonnet)
    // Reasons through strategy as chain-of-thought, then executes rewrite.
    // Output: JSON strategy brief + ---RESUME--- delimiter + plain text resume.
    // ─────────────────────────────────────────────────────────────────────────
    console.log('🧠✍️  [Agent 2] Strategist+Writer starting...');
    const strategistWriterRaw = await runAgent(
      'agent-strategist',
      'claude-sonnet-4-5-20250929',
      createStrategistWriterPrompt(
        resumeText,
        JSON.stringify(jdAnalysis, null, 2),
        jobDescription,
        companyName
      ),
      { resumeText, jdAnalysis: JSON.stringify(jdAnalysis), jobDescription, companyName },
      request
    );

    // Parse the two-part response using existing delimiter pattern
    const sw_delimiterIndex = strategistWriterRaw.indexOf('---RESUME---');
    if (sw_delimiterIndex === -1) {
      throw new Error('[Agent 2] Missing ---RESUME--- delimiter in response');
    }
    const strategyJsonRaw = strategistWriterRaw.substring(0, sw_delimiterIndex).trim();
    const rewrittenResume = strategistWriterRaw.substring(sw_delimiterIndex + 12).trim();
    const strategyBrief = parseAgentJson<Record<string, string>>(strategyJsonRaw, 'Strategist+Writer');
    console.log('✅ [Agent 2] Strategist+Writer complete —', rewrittenResume.length, 'chars written');

    // ─────────────────────────────────────────────────────────────────────────
    // AGENT 3 — RECRUITER/ATS REVIEWER (Sonnet)
    // Adversarial independent review — fresh context, no knowledge of writer intent
    // ─────────────────────────────────────────────────────────────────────────
    console.log('👔 [Agent 3] Recruiter starting...');
    const recruiterRaw = await runAgent(
      'agent-recruiter',
      'claude-sonnet-4-5-20250929',
      createRecruiterPrompt(rewrittenResume, jobDescription),
      { rewrittenResume, jobDescription },
      request
    );
    const recruiterVerdict = parseAgentJson<{
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
    }>(recruiterRaw, 'Recruiter');
    console.log('✅ [Agent 3] Recruiter complete — verdict:', recruiterVerdict.verdict);

    // ─────────────────────────────────────────────────────────────────────────
    // AGENT 4 — SCORER (Haiku)
    // Quantified 5-dimension scoring, informed by recruiter flags
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📊 [Agent 4] Scorer starting...');
    const scorerRaw = await runAgent(
      'agent-scorer',
      'claude-haiku-4-5-20251001',
      createScorerPrompt(rewrittenResume, jobDescription, JSON.stringify(recruiterVerdict, null, 2)),
      { rewrittenResume, jobDescription, recruiterVerdict: JSON.stringify(recruiterVerdict) },
      request
    );
    const scoreData = parseAgentJson<ResumeAnalysis>(scorerRaw, 'Scorer');
    console.log('✅ [Agent 4] Scorer complete — overall:', scoreData.overallScore);

    // ─────────────────────────────────────────────────────────────────────────
    // ASSEMBLE FINAL RESPONSE
    // ─────────────────────────────────────────────────────────────────────────

    // Add the rewritten resume to the analysis object (matching existing contract)
    (scoreData as any).customizedResume = rewrittenResume;

    // Validate required fields (same as before — frontend contract unchanged)
    validateRequiredFields(
      scoreData,
      [
        'overallScore',
        'customizedResume',
        'atsScore',
        'impactScore',
        'keywordScore',
        'narrativeScore',
        'levelScore',
        'starScore',
      ],
      'resume analysis'
    );

    // Recalculate overall as true average (same guard as before)
    const calculatedOverall =
      (scoreData.atsScore +
        scoreData.impactScore +
        scoreData.keywordScore +
        scoreData.narrativeScore +
        scoreData.levelScore) /
      5;

    scoreData.overallScore = Math.round(calculatedOverall * 10) / 10;

    console.log('🎯 Pipeline complete. Scores:', {
      ats: scoreData.atsScore,
      impact: scoreData.impactScore,
      keywords: scoreData.keywordScore,
      narrative: scoreData.narrativeScore,
      level: scoreData.levelScore,
      overall: scoreData.overallScore,
      recruiterVerdict: recruiterVerdict.verdict,
    });

    return NextResponse.json({
      success: true,
      analysis: scoreData,          // existing field — frontend unchanged
      recruiterVerdict,             // new field — for Recruiter Verdict UI component
      agentInsights: {              // new field — surfaceable in UI if desired
        jdAnalysis,
        strategyBrief,
      },
      usage: rateLimitCheck.usage,
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : '';
    console.error('Error in 4-agent pipeline:', errMsg);
    console.error('Stack:', errStack);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      return NextResponse.json(
        {
          error: 'Unable to analyze resume',
          message: 'The resume analysis encountered a formatting issue.',
          suggestions: [
            'Try simplifying your resume format (remove tables, columns, graphics)',
            'Use a standard Word or Google Docs template',
            'Save as PDF if you uploaded DOCX (or vice versa)',
            'Remove special characters or symbols',
            'Contact us if the issue persists: hello@resolut.tools',
          ],
          tip: 'Simple, text-based resumes work best with ATS systems anyway!',
          technicalError: errorMessage,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
