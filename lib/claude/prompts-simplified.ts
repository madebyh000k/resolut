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
 * SIMPLIFIED INTERVIEW BRIEF PROMPT - Flat String Structure
 * Returns newline-separated sections instead of nested arrays to avoid JSON parsing errors
 */
export function createSimplifiedInterviewBriefPrompt(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  companyNews: Array<{ title: string; summary: string }>,
  format: '30min' | '60min'
): string {
  const tokenGuidance = format === '30min'
    ? 'CRITICAL: Keep this brief to ONE PAGE maximum (500-700 words total). Each section should be 2-4 sentences.'
    : 'CRITICAL: Keep this brief to TWO PAGES maximum (1000-1400 words total). Each section should be 1 concise paragraph (3-5 sentences).';

  const sectionsGuide = format === '30min'
    ? `Required sections for 30-minute interview:
1. Proposed Interview Agenda
2. Executive Summary
3. Top 3 Strengths for This Role
4. Company Insights
5. 2 Key Stories to Tell
6. 3-4 Questions to Ask`
    : `Required sections for 60-minute interview:
1. Proposed Interview Agenda
2. Executive Summary
3. Top 5 Strengths for This Role
4. Company Insights
5. 3-4 Key Stories to Tell
6. Questions to Ask
7. Technical Knowledge to Review
8. Potential Concerns & How to Address`;

  return `Create a concise interview preparation brief for this candidate.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

RECENT COMPANY NEWS:
${companyNews.map((n, i) => `${i + 1}. ${n.title}\n${n.summary}`).join('\n\n')}

INTERVIEW FORMAT: ${format === '30min' ? '30-minute interview' : '60-minute interview'}
${tokenGuidance}

${sectionsGuide}

Return ONLY a valid JSON object with this EXACT FLAT structure (NO nested arrays):

{
  "sections": "<newline-separated sections in this format:

## Section Title
Section content here (2-5 sentences depending on format).

TIPS:
- Tip 1
- Tip 2

##>"
}

CRITICAL RULES:
- Use ## to separate sections
- Each section has: title, content, then TIPS: with bullet points
- Keep content concise (format dictates length)
- NO complex nested JSON - just ONE string field with newline separators
- Return ONLY valid JSON, NO markdown blocks, NO additional text

Example format:
{
  "sections": "## Executive Summary\\nYou bring 5 years of full-stack development experience...\\n\\nTIPS:\\n- Lead with your recent achievements\\n- Emphasize technical depth\\n\\n## Top Strengths\\nStrength 1: React expertise...\\n\\nTIPS:\\n- Be specific about technologies"
}`;
}
