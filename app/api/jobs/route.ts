import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobDescription } from '@/lib/parsers/job-scraper';
import { callClaude } from '@/lib/claude/client';
import { createKeywordExtractionPrompt } from '@/lib/claude/prompts';
import { JobDescription, Keyword } from '@/types/job';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Scrape job description
    const scrapedJob = await scrapeJobDescription(url);

    // Extract keywords using Claude
    const keywordPrompt = createKeywordExtractionPrompt(scrapedJob.description);
    const keywordResponse = await callClaude(keywordPrompt, {
      model: 'claude-3-haiku-20240307', // Use Haiku for cheaper keyword extraction
      maxTokens: 2048,
    });

    // Parse keywords from JSON response
    let keywords: Keyword[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanedText = keywordResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      keywords = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse keywords:', parseError);
      // Continue with empty keywords array
      keywords = [];
    }

    // Create job description object
    const jobDescription: JobDescription = {
      url,
      title: scrapedJob.title,
      company: scrapedJob.company,
      description: scrapedJob.description,
      requirements: scrapedJob.requirements,
      keywords,
      rawHtml: scrapedJob.rawHtml,
      fetchedAt: new Date(),
    };

    return NextResponse.json({ jobDescription }, { status: 200 });
  } catch (error) {
    console.error('Job scraping error:', error);
    return NextResponse.json(
      {
        error: `Failed to fetch job description: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
