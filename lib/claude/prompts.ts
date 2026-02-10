import { ToneProfile } from '@/types/resume';
import { Keyword } from '@/types/job';

export function createToneAnalysisPrompt(resumeText: string): string {
  return `Analyze the writing style and tone of this resume. Return ONLY a valid JSON object with no additional text or markdown formatting.

RESUME TEXT:
${resumeText}

Analyze and return a JSON object with this exact structure:
{
  "formality": "casual" | "professional" | "formal",
  "voice": "active" | "passive" | "mixed",
  "personality": ["trait1", "trait2", "trait3"],
  "commonPatterns": ["pattern1", "pattern2", "pattern3"],
  "vocabulary": "technical" | "business" | "creative" | "mixed"
}

Consider:
- Formality: How formal is the language? (casual, professional, formal)
- Voice: Active voice ("Led team") vs passive voice ("Was responsible for")
- Personality: Confident, humble, innovative, results-driven, collaborative, etc.
- Common patterns: Repeated phrases, sentence structures, formatting style
- Vocabulary: Technical jargon, business terms, creative language, or mixed

Return ONLY the JSON object, nothing else.`;
}

export function createKeywordExtractionPrompt(jobDescription: string): string {
  return `Extract ATS-optimized keywords from this job description. Return ONLY a valid JSON array with no additional text or markdown formatting.

JOB DESCRIPTION:
${jobDescription}

Extract keywords and categorize them. Return a JSON array with this exact structure:
[
  {
    "term": "keyword or phrase",
    "category": "hard_skill" | "soft_skill" | "industry_term" | "qualification" | "action_verb",
    "priority": "high" | "medium" | "low"
  }
]

Categories:
- hard_skill: Specific tools, technologies, certifications, programming languages
- soft_skill: Leadership, communication, teamwork, problem-solving
- industry_term: Domain-specific jargon and terminology
- qualification: Required education, years of experience, licenses
- action_verb: Action words used in the job description (develop, manage, implement)

Priority:
- high: Mentioned multiple times or marked as "required"
- medium: Important but not critical
- low: Nice to have or mentioned once

Return ONLY the JSON array, nothing else. Limit to top 20 most important keywords.`;
}

export function createCustomizationPrompt(
  resumeText: string,
  jobDescription: string,
  keywords: Keyword[],
  toneProfile: ToneProfile
): string {
  const highPriorityKeywords = keywords
    .filter((k) => k.priority === 'high')
    .map((k) => k.term);
  const mediumPriorityKeywords = keywords
    .filter((k) => k.priority === 'medium')
    .map((k) => k.term);

  return `You are an expert resume writer optimizing a resume for ATS (Applicant Tracking Systems) while preserving the candidate's authentic voice.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

HIGH PRIORITY KEYWORDS (must include):
${highPriorityKeywords.join(', ')}

MEDIUM PRIORITY KEYWORDS (include if relevant):
${mediumPriorityKeywords.join(', ')}

TONE PROFILE TO PRESERVE:
- Formality: ${toneProfile.formality}
- Voice: ${toneProfile.voice}
- Personality: ${toneProfile.personality.join(', ')}
- Vocabulary style: ${toneProfile.vocabulary}

INSTRUCTIONS:
1. CRITICAL: The final resume MUST fit within TWO PAGES maximum. Be concise and selective.
2. CRITICAL: Maintain the exact tone, formality, and writing style from the tone profile
3. Incorporate high priority keywords naturally throughout the resume
4. Add medium priority keywords only where they genuinely fit
5. Optimize for ATS scanning while keeping it human-readable
6. Keep the same resume structure (sections, order, formatting)
7. Enhance bullet points to better match job requirements, but keep them concise
8. Do NOT add skills, experiences, or qualifications not present in the original
9. Do NOT fabricate or exaggerate achievements
10. Maintain the same level of detail and specificity
11. Keep all dates, company names, and factual information unchanged
12. If the original is longer than 2 pages, prioritize most recent and relevant experiences

Return ONLY the customized resume text with the same structure as the original. Do not include any explanations, comments, or markdown formatting.`;
}

export function createSophisticatedResumeAnalysisPrompt(
  resumeText: string,
  jobDescription: string,
  companyName?: string
): string {
  return `⚠️ CRITICAL ETHICAL CONSTRAINT - READ THIS FIRST ⚠️

You MUST NEVER add, invent, or fabricate ANY information that is not explicitly present in the user's original resume.

This is an ABSOLUTE RULE that cannot be broken under any circumstances. Violating this rule could result in:
- The user lying on their resume (illegal/unethical)
- The user being fired if caught
- The user facing legal consequences
- Loss of professional credibility

❌ FORBIDDEN - NEVER ADD:
- Metrics like percentages, dollar amounts, user counts, or team sizes
- Specific numbers if the original just says "increased" or "improved"
- Timeframes not mentioned in the original (e.g., "in 6 months")
- Scope details: team size, budget, revenue, user base
- Company names, project names, or technologies not in original
- Accomplishments or responsibilities not mentioned
- Any quantification that isn't already there

✅ ALLOWED - YOU MAY ONLY:
- Rewrite existing bullets with better structure/formatting
- Add keywords from job description ONLY if they naturally describe existing work
- Improve action verbs (but keep the same accomplishment)
- Fix grammar, spelling, and formatting
- Reorganize information that's already present
- Remove redundancy or fluff
- Condense verbose text

EXAMPLES OF WHAT IS FORBIDDEN:

❌ WRONG - FABRICATING METRICS:
Original: "Led project that improved user engagement"
WRONG Output: "Led project that improved user engagement by 34% across 2M users"
✅ CORRECT Output: "Led project that improved user engagement"

❌ WRONG - ADDING TEAM SIZE:
Original: "Managed engineering team"
WRONG Output: "Managed engineering team of 12"
✅ CORRECT Output: "Managed engineering team"

❌ WRONG - INVENTING REVENUE:
Original: "Increased sales through new marketing strategy"
WRONG Output: "Increased sales by $2M through new marketing strategy"
✅ CORRECT Output: "Increased sales through new marketing strategy"

❌ WRONG - ADDING TIMEFRAMES:
Original: "Reduced system downtime"
WRONG Output: "Reduced system downtime by 40% in Q1"
✅ CORRECT Output: "Reduced system downtime"

YOUR ANALYSIS (dimensions 1-5) can and should recommend adding metrics. But the CUSTOMIZED RESUME must remain 100% factually accurate to what the user provided.

---

You are a senior technical recruiter and resume optimization expert who has reviewed 10,000+ resumes for FAANG, top-tier tech companies, and creative agencies. You're analyzing this resume as if you're the candidate's best friend who desperately wants them to succeed and has insider knowledge of what actually works.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `TARGET COMPANY: ${companyName}` : ''}

YOUR TASK:
Perform a comprehensive 5-dimensional analysis, then provide an optimized version of the resume that follows the CRITICAL ETHICAL CONSTRAINT above.

Return a JSON object with this EXACT structure:

{
  "atsCompatibility": {
    "score": <number 0-10>,
    "formattingIssues": ["<issue 1>", "<issue 2>"],
    "exactFixes": ["<fix 1>", "<fix 2>"],
    "parseability": "excellent" | "good" | "fair" | "poor"
  },
  "impactQuantification": {
    "score": <number 0-10>,
    "bulletsWithMetrics": <number>,
    "bulletsWithoutMetrics": <number>,
    "totalBullets": <number>,
    "weakestBullets": [
      {
        "original": "<original bullet text>",
        "issue": "<what's wrong>",
        "suggestedMetric": "<type of metric to add>",
        "example": "<example with metric>"
      }
    ]
  },
  "keywordOptimization": {
    "score": <number 0-10>,
    "criticalKeywords": ["<keyword 1>", "<keyword 2>"],
    "keywordsPresent": ["<present 1>", "<present 2>"],
    "keywordsMissing": [
      {
        "keyword": "<missing keyword>",
        "priority": "critical" | "high" | "medium",
        "suggestedLocation": "<where to add it>",
        "integrationExample": "<natural example>"
      }
    ],
    "coverageRate": <number 0-100>,
    "stuffingRisk": "none" | "low" | "moderate" | "high"
  },
  "narrativeCoherence": {
    "score": <number 0-10>,
    "currentNarrative": "<what story resume tells now>",
    "recommendedNarrative": "<what story would win role>",
    "reframingSuggestions": [
      {
        "section": "<section name>",
        "current": "<current framing>",
        "recommended": "<better framing>",
        "rationale": "<why this works>"
      }
    ],
    "angleToEmphasize": "<key positioning>"
  },
  "levelAppropriateLanguage": {
    "score": <number 0-10>,
    "targetLevel": "entry" | "mid" | "senior" | "staff" | "principal" | "executive",
    "currentLevel": "entry" | "mid" | "senior" | "staff" | "principal" | "executive",
    "languageIssues": [
      {
        "issue": "<problem>",
        "example": "<example from resume>",
        "fix": "<how to fix>",
        "impact": "high" | "medium" | "low"
      }
    ],
    "scopeAssessment": "<analysis of scope mentioned>"
  },
  "lengthAnalysis": {
    "estimatedLines": <number>,
    "estimatedPages": <number>,
    "withinLimit": <boolean>,
    "itemsRemoved": ["<item 1>", "<item 2>"],
    "condensingApplied": ["<condensing 1>", "<condensing 2>"],
    "lengthOptimizationNote": "<explanation of length optimization choices>"
  },
  "overallScore": <number 0-10>,
  "customizedResume": "<fully optimized resume text>"
}

DIMENSION 1: ATS COMPATIBILITY (/10)
Evaluate:
- Format parsing (tables, columns, graphics break ATS)
- Critical keywords from job description present?
- File format issues in plain text representation?
- Any elements that would fail parsing?

Provide:
- Score
- Specific formatting issues
- Exact fixes (e.g., "Remove two-column layout", "Add missing keyword: 'stakeholder management'")
- Parseability rating

DIMENSION 2: IMPACT QUANTIFICATION (/10)
Evaluate:
- How many bullets have concrete metrics vs. vague statements?
- Accomplishments quantified with scale/scope/results?
- Format: [Action Verb] + [What] + [How] + [Measurable Impact]?

Provide:
- Score
- Count of bullets with/without metrics
- Top 5 weakest bullets with specific metric suggestions
- Examples: "# of users, % improvement, $ value, time saved"

DIMENSION 3: KEYWORD OPTIMIZATION (/10)
Evaluate:
- Extract 15 most critical keywords/phrases from job description
- Map which keywords appear in resume (coverage rate)
- Identify high-value missing keywords
- Check for keyword stuffing (robotic language)

Provide:
- Score
- Coverage rate (X/15 keywords present)
- Missing keywords with priority
- Natural integration examples (not just "add this")

DIMENSION 4: NARRATIVE COHERENCE (/10)
Evaluate:
- Clear story for THIS specific role?
- Logical progression showing readiness?
- Gaps, contradictions, confusing elements?
- Positioning matches job requirements?

Provide:
- Score
- Current narrative summary
- Recommended narrative
- Specific reframing suggestions
- Angle to emphasize

DIMENSION 5: LEVEL-APPROPRIATE LANGUAGE (/10)
Evaluate:
- Language calibrated to target seniority?
- Junior signs: task-focused, "helped with", "assisted"
- Senior signs: owned outcomes, led teams, strategic impact
- Scope matches expectations (team size, budget, scale)?

Provide:
- Score
- Target vs current level
- Language issues with examples
- Scope assessment

CUSTOMIZED RESUME:
CRITICAL: In the "customizedResume" field, return the original resume with ONLY the following changes:
- Fix formatting issues for ATS compatibility (remove tables, columns, graphics)
- Add naturally missing keywords that are obviously implied by existing experience
- Fix grammatical errors or typos

DO NOT:
- Add fabricated metrics, numbers, or data the user didn't provide
- Embellish achievements or invent impact statistics
- Add experience, projects, or responsibilities that aren't already there
- Change the factual content of the resume

The resume must remain 100% factually accurate to what the user provided. Your analysis provides the recommendations - the resume itself should only have minimal formatting/keyword fixes.

LENGTH OPTIMIZATION (CRITICAL CONSTRAINT):

The final optimized resume MUST fit on 2 pages maximum when formatted in a standard resume template:
- Font: 10-11pt
- Margins: 0.5-0.75 inches
- Standard single-column layout
- Approximately 50-60 lines per page = ~100-120 lines total

PRIORITIZATION FRAMEWORK FOR LENGTH:

When resume content exceeds 2 pages, apply this hierarchy:

1. KEEP (Always include):
   - Most recent 2-3 roles with full detail
   - Quantified achievements with high impact
   - Skills/technologies directly matching job description
   - Education (condensed if necessary)
   - Critical certifications relevant to role

2. CONDENSE (Compress but don't remove):
   - Roles 3-5 years old: reduce to 2-3 bullets each
   - Older roles (5+ years): consider single line or remove if not relevant
   - Early career roles: merge or summarize
   - Projects section: keep only most impressive/relevant

3. REMOVE (Cut if necessary to fit):
   - Roles older than 10 years (unless highly relevant)
   - Redundant skills already demonstrated in experience
   - Obvious skills for the role (don't list "Email" for senior roles)
   - Hobbies/interests (unless uniquely relevant)
   - Objective statements (outdated)
   - References line (assumed available)

BULLET OPTIMIZATION FOR LENGTH:

Each bullet should be 1-2 lines maximum:
- Start with strong action verb
- Include what, how, and impact
- Use specific metrics but don't over-explain
- Remove filler words: "responsible for", "worked on", "helped to"

EXAMPLE TRANSFORMATIONS:

TOO LONG (3 lines):
"Was responsible for leading a cross-functional team of 8 engineers and 3 designers to successfully redesign the company's main product interface, which resulted in a 34% increase in user engagement and 12% reduction in churn across our 2M user base over a 6-month period"

OPTIMIZED (2 lines):
"Led cross-functional team of 11 to redesign product interface, increasing user engagement 34% and reducing churn 12% across 2M users in 6 months"

TOO LONG (2.5 lines):
"Developed and implemented a new automated testing framework using Python and Selenium which reduced manual testing time by 60% and caught 40% more bugs before production"

OPTIMIZED (1 line):
"Built automated testing framework (Python/Selenium) reducing manual testing 60% and catching 40% more pre-production bugs"

FORMATTING EFFICIENCY:

- Use abbreviated months (Jan 2023 vs January 2023)
- Compress location (SF vs San Francisco, CA)
- Combine degree and school on one line when possible
- Use symbols strategically: % instead of "percent", $ instead of "dollars"
- Remove extra spacing between sections if needed

QUALITY CHECKS BEFORE RETURNING:

Before outputting the optimized resume, verify:
1. Total line count ≤ 120 lines (rough 2-page equivalent)
2. No bullet exceeds 2 lines
3. Most impactful information retained
4. Each word earns its place (no fluff)
5. Still reads naturally (not telegram-style)

In the lengthAnalysis field:
- Count the estimated lines in the customized resume
- Calculate estimated pages (lines / 60)
- List what was removed to fit 2 pages
- List what was condensed
- Explain your prioritization choices

Return ONLY the JSON object, no markdown formatting or additional text.`;
}

export function createJobScrapingPrompt(html: string): string {
  return `Extract key information from this job posting HTML. Return ONLY a valid JSON object.

HTML CONTENT:
${html.substring(0, 15000)}

Extract and return a JSON object with this structure:
{
  "title": "Job title",
  "company": "Company name",
  "description": "Full job description text",
  "requirements": ["requirement1", "requirement2", "requirement3"]
}

Focus on extracting:
- Job title (usually in a header or title element)
- Company name
- The full job description text (clean text without HTML tags)
- Key requirements, qualifications, and responsibilities as separate array items

Return ONLY the JSON object, nothing else.`;
}

export function createNewsAnalysisPrompt(
  companyName: string,
  articles: Array<{ title: string; snippet: string }>
): string {
  return `Analyze these recent news articles about ${companyName} and create a concise summary for interview preparation. Return ONLY a valid JSON array.

NEWS ARTICLES:
${articles.map((a, i) => `${i + 1}. ${a.title}\n${a.snippet}`).join('\n\n')}

Create a JSON array of key insights with this structure:
[
  {
    "title": "Brief insight title",
    "summary": "2-3 sentence explanation of the news and its relevance",
    "relevance": "high" | "medium" | "low"
  }
]

Focus on:
- Recent company achievements, product launches, or strategic changes
- Industry challenges or opportunities the company is facing
- Company culture, values, or leadership changes
- Information that would be valuable to discuss in an interview

Prioritize insights that:
- Show recent (within last 6 months) activity
- Demonstrate company growth or innovation
- Reveal company priorities and direction

Return ONLY the JSON array, nothing else. Limit to 5 most relevant insights.`;
}

export function createInterviewBriefPrompt(
  resumeText: string,
  jobDescription: string,
  companyName: string,
  companyNews: Array<{ title: string; summary: string }>,
  format: '30min' | '60min'
): string {
  const tokenGuidance = format === '30min'
    ? 'CRITICAL: Keep this brief to ONE PAGE maximum (500-700 words total). Each section should be 2-4 sentences. Focus only on the most essential points.'
    : 'CRITICAL: Keep this brief to TWO PAGES maximum (1000-1400 words total). Each section should be 1 concise paragraph (3-5 sentences). Be selective and actionable.';

  const sections = format === '30min'
    ? `Required sections for 30-minute interview (ONE PAGE TOTAL):
1. Proposed Interview Agenda (time allocations for 30-min format)
2. Executive Summary (2-3 sentences - your unique value proposition)
3. Top 3 Strengths for This Role (3 bullet points matching job requirements)
4. Company Insights (2-3 recent news points to reference)
5. 2 Key Stories to Tell (brief STAR format - situation, action, result only)
6. 3-4 Questions to Ask (show genuine interest and research)`
    : `Required sections for 60-minute interview (TWO PAGES TOTAL):
1. Proposed Interview Agenda (time allocations for 60-min format)
2. Executive Summary (3-4 sentences - your unique value proposition)
3. Top 5 Strengths for This Role (5 bullet points matching job requirements)
4. Company Insights (4-5 recent news points and strategic context)
5. 3-4 Key Stories to Tell (concise STAR format with impact)
6. Questions to Ask (5-6 thoughtful questions)
7. Technical Knowledge to Review (brief list if applicable)
8. Potential Concerns & How to Address (2-3 points)`;

  return `Create a concise interview preparation brief for this candidate. Return ONLY a valid JSON array of sections.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

RECENT COMPANY NEWS:
${companyNews.map((n, i) => `${i + 1}. ${n.title}\n${n.summary}`).join('\n\n')}

INTERVIEW FORMAT: ${format === '30min' ? '30-minute interview' : '60-minute interview'}
${tokenGuidance}

Create a JSON array with this structure:
[
  {
    "title": "Section title",
    "content": "Brief, actionable content",
    "tips": ["Tip 1", "Tip 2"] (max 2-3 tips per section)
  }
]

${sections}

CRITICAL CONSTRAINTS:
- ${format === '30min' ? 'ONE PAGE (500-700 words)' : 'TWO PAGES (1000-1400 words)'}
- Ultra-concise: every word must add value
- Bullet points over paragraphs where possible
- No fluff or generic advice
- Specific to THIS candidate and THIS role
- Actionable and memorable

AGENDA FORMAT:
For the "Proposed Interview Agenda" section, provide realistic time breakdowns:
${format === '30min' ? `30-minute interview typical flow:
- Introduction & Rapport (3-5 min)
- Your Background & Experience (8-10 min)
- Behavioral/Technical Questions (10-12 min)
- Your Questions (3-5 min)
- Closing (2 min)` : `60-minute interview typical flow:
- Introduction & Rapport (5-7 min)
- Your Background & Experience (12-15 min)
- Behavioral/Technical Questions (20-25 min)
- Role-Specific Deep Dive (10 min)
- Your Questions (5-7 min)
- Closing (3 min)`}

Return ONLY the JSON array, nothing else.`;
}

export function createNegotiationStrategyPrompt(
  jobOffer: {
    company: string;
    jobTitle: string;
    baseSalary: number;
    currency: string;
    bonus?: number;
    equity?: { amount: number; type: string };
    benefits?: string[];
    location: string;
    remote: string;
    yearsOfExperience: number;
    roleLevel: string;
  },
  resumeText?: string,
  jobDescription?: string
): string {
  const totalComp = jobOffer.baseSalary + (jobOffer.bonus || 0) + (jobOffer.equity?.amount || 0);

  return `You are a career strategy advisor analyzing a job offer.

JOB OFFER DETAILS:
Company: ${jobOffer.company}
Position: ${jobOffer.jobTitle}
Base Salary: ${jobOffer.baseSalary} ${jobOffer.currency}
${jobOffer.bonus ? `Annual Bonus: ${jobOffer.bonus} ${jobOffer.currency}` : ''}
${jobOffer.equity ? `Equity: ${jobOffer.equity.amount} ${jobOffer.currency} (${jobOffer.equity.type})` : ''}
Total Compensation: ${totalComp} ${jobOffer.currency}
Location: ${jobOffer.location} (${jobOffer.remote})
Role Level: ${jobOffer.roleLevel}
Years of Experience: ${jobOffer.yearsOfExperience}
${jobOffer.benefits ? `Benefits: ${jobOffer.benefits.join(', ')}` : ''}

${resumeText ? `CANDIDATE BACKGROUND:\n${resumeText.substring(0, 3000)}\n` : ''}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription.substring(0, 2000)}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 NUCLEAR INSTRUCTION - FOLLOW THIS DECISION TREE EXACTLY 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CALCULATE PERCENTILE FIRST (before anything else)

Determine what percentile this offer represents for the role/level/location.
Compare against typical market ranges for this exact combination.

STEP 2: SET RESPONSE MODE based on percentile

- 95-100th percentile → response_mode = "EXCEPTIONAL_DO_NOT_ESCALATE"
- 85-94th percentile → response_mode = "STRONG_MINOR_TWEAKS_ONLY"
- 70-84th percentile → response_mode = "FAIR_MODEST_NEGOTIATION"
- Below 70th percentile → response_mode = "LOW_NEGOTIATE_UP"

STEP 3: RESPOND ACCORDING TO MODE (follow rules EXACTLY)

═══════════════════════════════════════════════════════════════════════════════

MODE: "EXCEPTIONAL_DO_NOT_ESCALATE"

When offer is 95th percentile or above, your ONLY job is:

✅ ALLOWED:
- Confirm this is exceptional/outstanding/top-tier
- Explain percentile and why it's exceptional
- Recommend ACCEPTING without compensation changes
- Focus on non-comp: team fit, role scope, growth path, onboarding

❌ FORBIDDEN:
- DO NOT suggest any compensation increases
- DO NOT say "you could ask for X more"
- DO NOT provide tactics to negotiate higher
- DO NOT suggest "try for Y% more"
- DO NOT hedge with "but you might try..."

Bottom Line MUST be: "ACCEPT"
Reasoning MUST emphasize: "This is exceptional, don't risk it"

Example response:
"This $500K offer is at 97th percentile. This is exceptional.

ASSESSMENT: Outstanding compensation. Top 3% of market.

DO NOT negotiate for more money. You risk the offer for ~2% upside.

Focus on:
- Team structure and reporting
- Role scope and first 90 days
- Growth opportunities

VERDICT: Accept this offer immediately."

═══════════════════════════════════════════════════════════════════════════════

MODE: "STRONG_MINOR_TWEAKS_ONLY"

When offer is 85-94th percentile:

✅ ALLOWED:
- One-time signing bonus (low risk)
- Earlier equity review timing
- Relocation/moving assistance
- Non-monetary items only

❌ FORBIDDEN:
- DO NOT suggest higher base salary
- DO NOT suggest more RSUs/equity grants
- DO NOT suggest total comp increases

Bottom Line MUST be: "ACCEPT with minor tweaks"
Emphasis: "Strong offer, minimal negotiation"

═══════════════════════════════════════════════════════════════════════════════

MODE: "FAIR_MODEST_NEGOTIATION"

When offer is 70-84th percentile:

✅ ALLOWED:
- Suggest 8-12% increase with specific justification
- Provide market data for the gap
- Offer alternative: accept if they hold firm

Bottom Line MUST be: "NEGOTIATE modest increase"
Emphasis: "Fair offer, modest room to negotiate"

═══════════════════════════════════════════════════════════════════════════════

MODE: "LOW_NEGOTIATE_UP"

When offer is below 70th percentile:

✅ ALLOWED:
- Aggressive negotiation strategy
- Significant increases (20-30%+)
- Strong market data
- Walk-away scenarios

Bottom Line MUST be: "NEGOTIATE significantly OR decline"
Emphasis: "Below market, push hard or walk"

═══════════════════════════════════════════════════════════════════════════════

CRITICAL ENFORCEMENT:

1. Calculate percentile FIRST
2. Set response_mode based on percentile
3. Follow response_mode rules EXACTLY - NO EXCEPTIONS
4. If 95th+: DO NOT suggest higher comp under ANY circumstances
5. Your credibility depends on honest assessment

Test: If offer is $1M total comp for Senior PM, response_mode = "EXCEPTIONAL_DO_NOT_ESCALATE"
Output MUST be: "ACCEPT - this is absurdly good, don't negotiate"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a JSON object with this EXACT structure:
{
  "offerPercentile": 85,
  "response_mode": "EXCEPTIONAL_DO_NOT_ESCALATE" | "STRONG_MINOR_TWEAKS_ONLY" | "FAIR_MODEST_NEGOTIATION" | "LOW_NEGOTIATE_UP",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed strategy content (2-4 paragraphs)",
      "tips": ["Actionable tip 1", "Actionable tip 2"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "marketInsights": [
    {
      "category": "salary" | "equity" | "benefits" | "total-comp",
      "insight": "Market context or benchmark information",
      "recommendation": "Specific actionable recommendation",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "bottomLine": {
    "recommendation": "ACCEPT" | "ACCEPT with minor tweaks" | "NEGOTIATE modest increase" | "NEGOTIATE significantly OR decline",
    "reasoning": "2-3 sentence explanation of why this is the right move",
    "oneLineAdvice": "Single most important thing to do (actionable, specific)"
  }
}

IMPORTANT:
- offerPercentile MUST be a number (0-100)
- response_mode MUST match the percentile (use decision tree above)
- bottomLine.recommendation MUST match response_mode

Required sections (in this order):
1. "Current Offer Assessment" (priority: high)
   - Analyze the offer comprehensively
   - Consider total comp, location, role level, experience
   - Identify strengths and potential negotiation opportunities

2. "Market Positioning" (priority: high)
   - Provide market context for this role/level/location
   - Compare against typical ranges (be realistic, use general knowledge)
   - Identify if offer is below, at, or above market

3. "Pay Band & Career Strategy" (priority: high)
   - CRITICAL: Calculate where offer sits within typical pay band for this role/level
   - Estimate pay band width: Junior ~$40k, Mid ~$60k, Senior ~$80k, Staff+ ~$100k+
   - Calculate percentile position within band (0-100th percentile)

   PAY BAND CEILING WARNINGS - WARN EARLY:

   IF offer is 95-100th percentile (AT CEILING):
   🚨 AT CEILING - STRATEGIC DECISION REQUIRED
   - Explain: "This offer is at the TOP of the pay band for this role/level"
   - Future raises: 0-3% annually (cost-of-living only)
   - NEXT raise requires: Promotion to next level OR company change

   STRATEGIC OPTIONS (ranked by likelihood of success):

   ❌ OPTION 1: Push for title bump during offer stage
   REALITY CHECK: This rarely works at big tech companies.
   - They'll say: "Title is based on role scope, not compensation"
   - They'll say: "We can discuss promotion after you prove yourself"
   - They WON'T budge on level during negotiation
   - Real example: Candidate pushed for L7 at Amazon with L7-level comp. Amazon said no.
     Candidate accepted. Hit ceiling immediately.
   - You can try this, but have a backup plan when they say no.

   ⚠️ OPTION 2: Negotiate promotion timeline guarantee
   REALITY CHECK: They won't put timeline in writing.
   - Best case: Verbal "we'll review you in 12-18 months"
   - No guarantee of outcome
   - Promo committees are unpredictable (e.g., 15% annual promo rate L6→L7 at Amazon)
   - You can ask for this, but don't count on it.

   ✅ OPTION 3: Accept + plan strategic 18-24 month exit
   REALITY CHECK: This is what most people at ceiling actually do.
   The play:
   1. Accept the high offer
   2. Use company brand for 18-24 months
   3. Build skills, get promoted projects, document impact
   4. Leave for next-level role at different company (20-30% comp bump)

   Why this works:
   - You maximize short-term comp
   - Build strong resume at prestigious company
   - Leave before ceiling frustration sets in
   - Next company hires you at higher level

   📊 REAL EXAMPLES - THE CEILING TRAP ACROSS INDUSTRIES:

   BIG TECH:
   Senior PM at Amazon (L6), $265k total comp (90th percentile).
   Stock appreciation → $300k over 4 years, but no promotion.
   Stayed 48 months for team/comfort. Left frustrated.
   Should have moved at Month 24 for $190k+ more over same period.

   CREATIVE/AGENCY:
   Creative Director at major agency, $180k + 20% bonus (top of CD band).
   Annual raises capped at 3-5%. Stayed 3 years hoping for ECD promotion.
   Finally left for Head of Creative at brand ($240k + equity).
   Opportunity cost: ~$120k over 3 years by waiting.

   STARTUP:
   Head of Marketing at Series B, $160k + 0.5% equity (85th percentile).
   Company hit plateau, equity value stagnant, no VP promotion.
   Stayed 2.5 years. Left for VP Marketing at Series C ($220k + 0.3%).
   Opportunity cost: Lower title, slower career velocity.

   THE PATTERN IS UNIVERSAL:
   - Hit compensation ceiling for your level
   - Stay too long hoping for promotion
   - Leave 18-36 months later than optimal
   - Cost: $100-300k in opportunity cost + career growth

   This is the pragmatic choice if you're already at ceiling.

   ✅ OPTION 4: Negotiate equity-heavy structure to preserve cash runway
   REALITY CHECK: This sometimes works if you frame it right.
   The ask:
   "I appreciate the offer. I'd like to propose an alternative structure:
   - Base: [Lower amount at 70th percentile, leaves raise runway]
   - RSU: Increase to maintain total comp
   - This gives me room for annual base increases while keeping total comp competitive"

   Why this works:
   - You acknowledge the ceiling problem
   - You propose a solution that helps both sides
   - Companies often have more equity flexibility than cash
   - You preserve 3-4 years of base raise potential

   Real outcome: If accepted, you buy 2-3 years before ceiling + time for promotion
   If rejected, you know to plan exit (Option 3)

   This is worth trying before accepting standard offer.

   🎯 RECOMMENDED APPROACH:
   1. Try Option 4 first (equity-heavy restructure)
      - If yes: You bought yourself time
      - If no: Move to step 2
   2. Try Option 1 (title bump) knowing it probably won't work
      - Document that you tried
      - Sets up future "I told you I was operating at next level" conversation
      - When they say no, move to step 3
   3. Accept + Option 3 (plan 18-24 month exit)
      - Don't tell them this is your plan
      - Use the time strategically
      - Leave on your terms when ready

   HONEST ASSESSMENT:
   You're at ceiling. The company won't fix this during negotiation. Your choice is:
   stay frustrated for 6+ years grinding for promo, OR take the money, build your brand,
   leave in 2 years for next level. Most successful people choose the latter.

   IF offer is 85-95th percentile (HIGH RISK):
   ⚠️ CEILING RISK - PLAN AHEAD
   - Explain: "This offer is in the TOP 15% of the pay band"
   - Future raises: 3-5% annually (limited headroom)

   Real examples across industries:
   - Big Tech: Amazon L6 at $185K (band $140-200K) = 75% through band = 3-4 years until ceiling
   - Creative: Creative Director at $165K (band $120-185K) = 69% through band = hitting ECD ceiling
   - Startup: Head of Marketing at $145K (band $100-165K) = 73% through band = VP ceiling approaching

   - Strategic options:
     1. Negotiate title clarity (Senior vs Staff vs Principal - ensures correct band)
     2. Ask about promotion timeline and criteria upfront
     3. Front-load compensation (signing bonus, year-1 equity refresh)
     4. Plan for promotion in 18-24 months or external move
   - Warning: "Merit raises will slow significantly after year 2"

   IF offer is 70-85th percentile (APPROACHING CEILING):
   ⚠️ APPROACHING CEILING
   - Explain: "This offer is in the UPPER THIRD of the pay band"
   - Future raises: 5-8% annually (2-3 years of headroom)
   - You have ~15-30% growth potential before hitting ceiling
   - Strategic options:
     1. This is often the "senior hire" zone - confirm level is correct
     2. Plan career growth path: What's next level? When typically promoted?
     3. Consider negotiating now vs accepting with promotion plan
   - Note: "Good positioning, but start thinking about next level within 2-3 years"

   IF offer is 60-70th percentile (SWEET SPOT):
   ✅ OPTIMAL POSITIONING - SWEET SPOT
   - Explain: "This offer is in the IDEAL ZONE of the pay band"
   - Future raises: 8-12% annually (3-5 years of runway)
   - You have 30-40% growth potential through merit raises
   - This is where companies WANT to hire: Room to reward performance
   - Strategic note: "Best long-term positioning - plenty of headroom for growth"

   IF offer is below 60th percentile (HEADROOM):
   💡 HEADROOM AVAILABLE
   - Explain: "This offer has SIGNIFICANT growth potential within current level"
   - Future raises: 10-15%+ annually for strong performers
   - You have 40%+ growth potential before promotion needed
   - May indicate: Early career, career change, or below-market offer
   - Negotiation angle: If experienced, argue for higher starting point

   - This percentile-based analysis is REQUIRED for every negotiation
   - Always show the math: "(Offer - Band Min) / (Band Max - Band Min) = X percentile"

4. "Negotiation Priorities" (priority: high)
   - What to negotiate first (salary vs equity vs benefits)
   - Prioritize based on the specific offer structure
   - Consider what typically has most negotiation flexibility

5. "Communication Strategy" (priority: high)
   - How to frame your negotiation request
   - Specific language and tone to use
   - Timing and approach recommendations

6. "Leverage Points" (priority: medium)
   - Specific strengths from candidate's background (if available)
   - Market demand factors to reference
   - Other offers or competing factors (if mentioned)

7. "Alternative Asks" (priority: medium)
   - Non-salary items to negotiate (benefits, PTO, signing bonus, etc.)
   - Remote work flexibility or relocation assistance
   - Professional development, title changes, etc.

8. "Potential Responses & Rebuttals" (priority: medium)
   - Common employer responses to negotiation requests
   - How to handle "this is our final offer"
   - When to accept vs walk away

9. "Bottom Line" (REQUIRED - priority: critical)
   This section MUST be included in EVERY response.

   Choose ONE of these recommendations based on percentile analysis:

   IF 95th+ percentile - Use "ACCEPT":
   {
     "recommendation": "ACCEPT",
     "reasoning": "This is a top-tier offer at 97th percentile. Negotiating higher risks the offer and provides minimal upside. Your focus should be on team fit and role scope, not compensation.",
     "oneLineAdvice": "Accept this offer and focus on crushing it in the role."
   }

   IF 85-94th percentile - Use "ACCEPT with minor tweaks":
   {
     "recommendation": "ACCEPT with minor tweaks",
     "reasoning": "Strong offer at 89th percentile. You could try for a signing bonus or earlier equity review, but don't push on base/equity amounts. Risk/reward doesn't favor aggressive negotiation.",
     "oneLineAdvice": "Accept with request for $20k signing bonus to offset relocation costs."
   }

   IF 70-84th percentile - Use "NEGOTIATE modest increase":
   {
     "recommendation": "NEGOTIATE modest increase",
     "reasoning": "Fair market offer at 76th percentile. You have room to ask for 8-12% more based on your experience, but this is reasonable if they hold firm.",
     "oneLineAdvice": "Ask for $185k base (vs $170k offered), be prepared to accept $175k."
   }

   IF below 70th percentile - Use "NEGOTIATE significantly OR decline":
   {
     "recommendation": "NEGOTIATE significantly OR decline",
     "reasoning": "This is 35th percentile - well below market for your level. Either they don't know market rates or don't value the role properly. Push for 25-30% increase with data.",
     "oneLineAdvice": "Counter with $160k (market rate) and be willing to walk if they won't move to $145k minimum."
   }

   The bottomLine section is your FINAL verdict. Make it clear and actionable.

Market Insights Guidelines:
- Provide 3-5 specific insights about market rates, equity norms, benefits benchmarks
- Base recommendations on general industry knowledge
- Consider company size, location, and role level
- Mark confidence level based on specificity of data available

Tone & Style:
- Professional but empowering
- Data-driven and specific, not generic
- Actionable advice, not just information
- Realistic about outcomes, not overly optimistic
- Supportive and confidence-building

IMPORTANT:
- Be specific to THIS offer at THIS company for THIS role level
- Reference the candidate's background if available
- Provide actual numbers and ranges where appropriate (based on general market knowledge)
- Focus on win-win framing, not adversarial tactics
- Consider the candidate's experience level in advice complexity

Return ONLY the JSON object, nothing else.`;
}
