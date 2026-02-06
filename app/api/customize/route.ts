import { NextRequest, NextResponse } from 'next/server';
import { callClaudeWithRetry } from '@/lib/claude/client';
import {
  createToneAnalysisPrompt,
  createCustomizationPrompt,
} from '@/lib/claude/prompts';
import { analyzeResumeStructure } from '@/lib/utils/structure-analyzer';
import { ToneProfile, CustomizedResume } from '@/types/resume';
import { JobDescription, Keyword } from '@/types/job';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId, resumeText, jobDescription, keywords } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // Step 1: Analyze tone of original resume
    console.log('Analyzing resume tone...');
    const tonePrompt = createToneAnalysisPrompt(resumeText);
    const toneResponse = await callClaudeWithRetry(tonePrompt, 3, {
      maxTokens: 1024,
    });

    // Parse tone profile
    let toneProfile: ToneProfile;
    try {
      const cleanedText = toneResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      toneProfile = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse tone profile:', parseError);
      // Use default tone profile if parsing fails
      toneProfile = {
        formality: 'professional',
        voice: 'active',
        personality: ['confident', 'results-driven'],
        commonPatterns: [],
        vocabulary: 'mixed',
      };
    }

    // Step 2: Customize resume with tone preservation
    console.log('Customizing resume...');
    const customizationPrompt = createCustomizationPrompt(
      resumeText,
      jobDescription,
      keywords || [],
      toneProfile
    );

    const customizationResponse = await callClaudeWithRetry(customizationPrompt, 3, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    const customizedText = customizationResponse.text.trim();

    // Analyze structure of customized resume
    const customizedStructure = analyzeResumeStructure(customizedText);

    // Identify which keywords were added
    const addedKeywords = identifyAddedKeywords(resumeText, customizedText, keywords || []);

    // Create customized resume object
    const customizedResume: CustomizedResume = {
      id: crypto.randomUUID(),
      originalResumeId: resumeId,
      customizedText,
      structure: customizedStructure,
      keywordsAdded: addedKeywords,
      toneProfile,
      customizedAt: new Date(),
    };

    return NextResponse.json(
      {
        customizedResume,
        usage: {
          toneAnalysis: toneResponse.usage,
          customization: customizationResponse.usage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Customization error:', error);
    return NextResponse.json(
      {
        error: `Failed to customize resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

function identifyAddedKeywords(
  originalText: string,
  customizedText: string,
  keywords: Keyword[]
): string[] {
  const originalLower = originalText.toLowerCase();
  const customizedLower = customizedText.toLowerCase();
  const addedKeywords: string[] = [];

  for (const keyword of keywords) {
    const term = keyword.term.toLowerCase();

    // Check if keyword was not in original but is in customized
    const wasInOriginal = originalLower.includes(term);
    const isInCustomized = customizedLower.includes(term);

    if (!wasInOriginal && isInCustomized) {
      addedKeywords.push(keyword.term);
    }
  }

  return addedKeywords;
}
