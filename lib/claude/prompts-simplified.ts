/**
 * SIMPLIFIED RESUME ANALYSIS PROMPT - Flat JSON Structure
 * This generates a much simpler, flatter JSON structure that's easier for Claude to generate correctly
 */

export function createSimplifiedResumeAnalysisPrompt(
  resumeText: string,
  jobDescription: string,
  companyName?: string
): string {
  return `⚠️ CRITICAL ETHICAL CONSTRAINT - READ THIS FIRST ⚠️

You MUST NEVER add, invent, or fabricate ANY information that is not explicitly present in the user's original resume.

❌ FORBIDDEN - NEVER ADD:
- Metrics like percentages, dollar amounts, user counts, or team sizes
- Specific numbers if the original just says "increased" or "improved"
- Timeframes not mentioned (e.g., "in 6 months")
- Scope details: team size, budget, revenue, user base
- Any quantification that isn't already there

✅ ALLOWED - YOU MAY ONLY:
- Rewrite existing bullets with better structure
- Add keywords from job description if they naturally describe existing work
- Improve action verbs (but keep the same accomplishment)
- Fix grammar, spelling, formatting
- Reorganize information that's already present

---

You are a senior technical recruiter analyzing this resume for a specific role.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `TARGET COMPANY: ${companyName}` : ''}

Perform a comprehensive 5-dimensional analysis and provide an optimized resume.

Return a JSON object with this EXACT FLAT structure (NO nested arrays or objects):

{
  "overallScore": <number 0-10>,
  "customizedResume": "<optimized resume text - MUST fit 2 pages max>",
  "atsScore": <number 0-10>,
  "atsIssues": "<newline-separated list of formatting issues>",
  "atsFixes": "<newline-separated list of exact fixes>",
  "atsParseability": "excellent",
  "impactScore": <number 0-10>,
  "bulletsWithMetrics": <number>,
  "bulletsWithoutMetrics": <number>,
  "totalBullets": <number>,
  "weakBulletsText": "<newline-separated: '- [original bullet] → Suggestion: [specific improvement]'>",
  "keywordScore": <number 0-10>,
  "criticalKeywords": "<comma-separated list>",
  "keywordsPresent": "<comma-separated list>",
  "keywordsMissing": "<newline-separated: '- [keyword] (priority) - where to add it'>",
  "keywordCoverage": <number 0-100>,
  "narrativeScore": <number 0-10>,
  "currentNarrative": "<1-2 sentences>",
  "recommendedNarrative": "<1-2 sentences>",
  "narrativeFixes": "<newline-separated list of reframing suggestions>",
  "levelScore": <number 0-10>,
  "targetLevel": "senior",
  "currentLevel": "mid",
  "levelIssues": "<newline-separated: '- [issue]: [fix]'>",
  "lengthEstimatedPages": <number>,
  "lengthWithinLimit": <boolean>,
  "lengthNote": "<1-2 sentences explaining length optimization>"
}

DIMENSION 1: ATS COMPATIBILITY (/10)
Evaluate format parsing, critical keywords present, file format issues.
Provide: score, specific issues (newline-separated), exact fixes (newline-separated), parseability.

DIMENSION 2: IMPACT QUANTIFICATION (/10)
Evaluate how many bullets have metrics vs vague statements.
Provide: score, counts, top 5 weak bullets with suggestions (newline-separated).

DIMENSION 3: KEYWORD OPTIMIZATION (/10)
Extract 15 critical keywords from job description, map coverage.
Provide: score, critical keywords (comma-separated), present (comma-separated), missing with priority (newline-separated), coverage %.

DIMENSION 4: NARRATIVE COHERENCE (/10)
Evaluate story clarity for THIS role, logical progression.
Provide: score, current narrative (1-2 sentences), recommended narrative (1-2 sentences), fixes (newline-separated).

DIMENSION 5: LEVEL-APPROPRIATE LANGUAGE (/10)
Evaluate if language matches target seniority.
Provide: score, target level, current level, issues with fixes (newline-separated).

CUSTOMIZED RESUME:
In the "customizedResume" field, return the original resume with ONLY:
- ATS formatting fixes (no tables/columns)
- Naturally missing keywords that fit existing experience
- Grammar/typo fixes
- MUST fit on 2 pages maximum (~100-120 lines)

DO NOT add fabricated metrics or exaggerate achievements.

LENGTH OPTIMIZATION:
Final resume MUST fit 2 pages (100-120 lines). Apply this hierarchy:
1. KEEP: Most recent 2-3 roles with full detail, quantified achievements
2. CONDENSE: Roles 3-5 years old to 2-3 bullets
3. REMOVE: Roles older than 10 years if not relevant

Return ONLY valid JSON with the exact flat structure shown above. NO markdown, NO additional text.`;
}

/**
 * ULTRA-SIMPLIFIED INTERVIEW BRIEF PROMPT - Maximum JSON Safety
 * Uses SHORT numbered fields to avoid long string parsing errors
 */
export function createSimplifiedInterviewBriefPrompt(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  companyNews: Array<{ title: string; summary: string }>,
  format: '30min' | '60min'
): string {
  const numSections = format === '30min' ? 6 : 8;

  return `⚠️ CRITICAL JSON RULES - READ FIRST ⚠️

YOU MUST GENERATE VALID JSON:
- Return ONLY valid JSON, nothing else
- Use ONLY simple string fields (no nested objects or arrays)
- Keep EACH field under 400 characters
- Break long content into numbered fields (section1, section2, etc.)
- Escape quotes: use \\" not "
- Use \\n for line breaks, NEVER actual newlines in strings
- Test mentally: Will this parse as valid JSON?

---

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

RECENT NEWS:
${companyNews.map((n, i) => `${i + 1}. ${n.title}: ${n.summary}`).join('\n')}

FORMAT: ${format === '30min' ? '30-minute' : '60-minute'} interview

Create a ${numSections}-section interview brief. Return ONLY this EXACT JSON structure:

{
  "section1Title": "Agenda",
  "section1Content": "Brief agenda (3-4 lines max)",
  "section1Tips": "Tip 1\\nTip 2",
  "section2Title": "Executive Summary",
  "section2Content": "Your value prop (3-4 sentences max)",
  "section2Tips": "Tip 1\\nTip 2",
  "section3Title": "Top Strengths",
  "section3Content": "Strength 1: X. Strength 2: Y. (Brief bullets)",
  "section3Tips": "Tip 1\\nTip 2",
  "section4Title": "Company Insights",
  "section4Content": "Recent news points (2-3 sentences)",
  "section4Tips": "Tip 1\\nTip 2",
  "section5Title": "Stories to Tell",
  "section5Content": "Story 1 (STAR). Story 2 (STAR). (Brief)",
  "section5Tips": "Tip 1\\nTip 2",
  "section6Title": "Questions to Ask",
  "section6Content": "Question 1? Question 2? (3-4 max)",
  "section6Tips": "Tip 1\\nTip 2"${format === '60min' ? `,
  "section7Title": "Technical Review",
  "section7Content": "Key concepts (brief list)",
  "section7Tips": "Tip 1\\nTip 2",
  "section8Title": "Potential Concerns",
  "section8Content": "Concern 1 + solution. Concern 2 + solution.",
  "section8Tips": "Tip 1\\nTip 2"` : ''}
}

CRITICAL CONSTRAINTS:
- Each "Content" field: MAX 400 characters
- Each "Tips" field: 2-3 tips, newline-separated, MAX 200 characters
- ${format === '30min' ? '6 sections total' : '8 sections total'}
- NO quotes inside strings (use \\" if needed)
- NO line breaks (use \\n)
- Return ONLY the JSON object, nothing else`;
}
