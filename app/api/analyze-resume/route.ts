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

// Allow up to 60s for the 4-agent sequential pipeline
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Error text detection patterns ───────────────────────────────────────────
const ERROR_TEXT_PATTERNS = [
  /^An error/i,
  /^I apologize/i,
  /^Unfortunately/i,
  /^I'm sorry/i,
  /^I cannot/i,
  /^Error:/i,
  /^I'm unable/i,
  /^There was/i,
];

function isErrorText(text: string): boolean {
  const trimmed = text.trim();
  return ERROR_TEXT_PATTERNS.some(pattern => pattern.test(trimmed));
}

// ─── Helper: extract text from Claude response ────────────────────────────────
function extractText(message: Anthropic.Message): string {
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response format from Claude');
  return content.text;
}

// ─── Helper: parse JSON from agent response ───────────────────────────────────
function parseAgentJson<T>(raw: string, agentName: string): T {
  // Log first 300 chars for debugging
  console.log(`[${agentName}] Raw response (first 300 chars):`, raw.substring(0, 300));

  // Strip markdown fences if present
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    console.error(`[${agentName}] No JSON object found. Response (first 200 chars):`, cleaned.substring(0, 200));
    throw new Error(`[${agentName}] No JSON object found in response. Starts with: "${cleaned.substring(0, 100)}..."`);
  }

  // Warn if there was preamble text before the JSON
  if (start > 0) {
    console.warn(`[${agentName}] Stripped ${start} chars of preamble before JSON:`, cleaned.substring(0, start));
  }

  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.warn(`[${agentName}] JSON.parse failed, trying robust parser. Error:`, parseError instanceof Error ? parseError.message : String(parseError));
    // Fallback to robust parser
    return parseClaudeJsonResponse<T>(cleaned);
  }
}

// ─── Custom error for error-text responses ──────────────────────────────────
class ClaudeErrorTextError extends Error {
  constructor(agentName: string, responseText: string) {
    super(`[${agentName}] Claude returned error text instead of JSON`);
    this.name = 'ClaudeErrorTextError';
    (this as any).agentName = agentName;
    (this as any).responsePreview = responseText.substring(0, 300);
  }
}

// ─── Agent-specific system messages ──────────────────────────────────────────
const SYSTEM_MSG_JSON_ONLY =
  'You are a JSON-only API. Return ONLY a valid JSON object. No preamble, no apologies, no explanations. Your first character must be {. Your last character must be }. If you cannot complete the task, return {"error": "reason"}.';

const SYSTEM_MSG_DELIMITER =
  'You are a resume optimization expert. Return your response in exactly two parts: first a valid JSON object (starting with {), then the delimiter ---RESUME--- on its own line, then the full optimized resume as plain text. No preamble before the JSON. No markdown fences. Start immediately with {.';

function getSystemMessage(feature: string): string {
  return feature === 'agent-strategist' ? SYSTEM_MSG_DELIMITER : SYSTEM_MSG_JSON_ONLY;
}

// ─── Helper: run a single agent call (with retry on error-text) ─────────────
async function runAgent(
  feature: Parameters<typeof makeOptimizedApiCall>[0]['feature'],
  model: string,
  prompt: string,
  inputs: Record<string, any>,
  request: NextRequest,
  maxRetries = 1
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.warn(`[${feature}] Retry attempt ${attempt}/${maxRetries}...`);
    }

    const result = await makeOptimizedApiCall({
      feature,
      inputs,
      anthropicCall: () =>
        anthropic.messages.create({
          model,
          max_tokens: getMaxTokens(feature),
          temperature: 0.3,
          system: getSystemMessage(feature),
          messages: [{ role: 'user', content: prompt }],
        }),
      request,
    });

    if (!result.success) {
      throw new Error(`Agent ${feature} failed: ${result.error}`);
    }

    const text = extractText(result.data as Anthropic.Message);

    // Check for error-text response
    if (isErrorText(text)) {
      console.error(`[${feature}] Attempt ${attempt + 1}: Claude returned error text (${text.length} chars):`, text.substring(0, 500));
      if (attempt < maxRetries) {
        continue; // Retry
      }
      // Out of retries — throw specific error
      throw new ClaudeErrorTextError(feature, text);
    }

    return text;
  }

  // Should never reach here, but TypeScript needs it
  throw new Error(`Agent ${feature} failed after ${maxRetries + 1} attempts`);
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, companyName } = await request.json();

    console.log('=== INPUTS TO CLAUDE ===');
    console.log('Resume length:', resumeText?.length ?? 0);
    console.log('Resume first 300 chars:', resumeText?.substring(0, 300) ?? '(empty)');
    console.log('Resume last 100 chars:', resumeText ? resumeText.substring(Math.max(0, resumeText.length - 100)) : '(empty)');
    console.log('Job description length:', jobDescription?.length ?? 0);
    console.log('Job first 300 chars:', jobDescription?.substring(0, 300) ?? '(empty)');
    console.log('Company:', companyName || '(not provided)');
    console.log('Total chars:', (resumeText?.length ?? 0) + (jobDescription?.length ?? 0));
    console.log('========================');

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // ── Truncate oversized inputs to prevent timeouts ────────────────────────
    let processedResume = resumeText;
    let processedJobDesc = jobDescription;

    if (jobDescription.length > 15000) {
      console.warn(`Job description too long (${jobDescription.length} chars), truncating to 15000`);
      processedJobDesc = jobDescription.substring(0, 15000) + '\n\n[Description truncated for analysis]';
    }
    if (resumeText.length > 12000) {
      console.warn(`Resume too long (${resumeText.length} chars), truncating to 12000`);
      processedResume = resumeText.substring(0, 12000) + '\n\n[Resume truncated for analysis]';
    }

    // ── Rate limit check on the pipeline feature (not individual agents) ──────
    // We check 'optimize' once here before starting the chain.
    // Individual agent calls bypass rate limiting (they're sub-steps).
    const rateLimitCheck = await makeOptimizedApiCall({
      feature: 'optimize',
      inputs: { resumeText: processedResume, jobDescription: processedJobDesc, companyName },
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
      createJdAnalystPrompt(processedJobDesc),
      { jobDescription: processedJobDesc },
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
        processedResume,
        JSON.stringify(jdAnalysis, null, 2),
        processedJobDesc,
        companyName
      ),
      { resumeText: processedResume, jdAnalysis: JSON.stringify(jdAnalysis), jobDescription: processedJobDesc, companyName },
      request
    );

    // Parse the two-part response using existing delimiter pattern
    const sw_delimiterIndex = strategistWriterRaw.indexOf('---RESUME---');
    if (sw_delimiterIndex === -1) {
      console.error('[Agent 2] Missing ---RESUME--- delimiter. Response (first 500 chars):', strategistWriterRaw.substring(0, 500));
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
      createRecruiterPrompt(rewrittenResume, processedJobDesc),
      { rewrittenResume, jobDescription: processedJobDesc },
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
      createScorerPrompt(rewrittenResume, processedJobDesc, JSON.stringify(recruiterVerdict, null, 2)),
      { rewrittenResume, jobDescription: processedJobDesc, recruiterVerdict: JSON.stringify(recruiterVerdict) },
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

    // ── Claude returned error text instead of JSON (e.g. "An error occurred...") ──
    if (error instanceof ClaudeErrorTextError) {
      const preview = (error as any).responsePreview || '';
      const agent = (error as any).agentName || 'unknown';
      console.error(`ClaudeErrorTextError from ${agent}:`, preview);
      return NextResponse.json(
        {
          error: 'Analysis failed',
          message: 'Unable to process this resume and job combination. The AI returned an unexpected response. This may be due to unusual formatting or length.',
          suggestions: [
            'Try again — this is usually a temporary issue',
            'Try with a simpler resume format (plain text, no complex layouts)',
            'Try with a shorter job description',
            'Contact us if the issue persists: hello@resolut.tools',
          ],
          technicalError: `Agent ${agent} returned text: "${preview.substring(0, 100)}..."`,
        },
        { status: 500 }
      );
    }

    // ── Claude API-level error (rate limit, auth, etc.) ──
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // ── JSON parsing failure ──
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
