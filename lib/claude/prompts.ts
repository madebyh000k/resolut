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
