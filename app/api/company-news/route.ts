import { NextRequest, NextResponse } from 'next/server';
import { scrapeCompanyNews } from '@/lib/parsers/company-news-scraper';
import { callClaude } from '@/lib/claude/client';
import { createNewsAnalysisPrompt } from '@/lib/claude/prompts';
import { CompanyNews, NewsArticle } from '@/types/prepare';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, website } = body;

    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Scrape company news
    console.log(`Fetching news for ${company}...`);
    const scrapedNews = await scrapeCompanyNews(company, website);

    if (scrapedNews.articles.length === 0) {
      // Return empty news with graceful message
      const companyNews: CompanyNews = {
        company,
        articles: [],
        fetchedAt: new Date(),
        source: 'industry_general',
      };

      return NextResponse.json({ companyNews }, { status: 200 });
    }

    // Analyze news with Claude
    const analysisPrompt = createNewsAnalysisPrompt(company, scrapedNews.articles);
    const analysisResponse = await callClaude(analysisPrompt, {
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 2048,
    });

    // Parse analysis
    let analyzedArticles: NewsArticle[] = [];
    try {
      const cleanedText = analysisResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleanedText);

      analyzedArticles = parsed.map((item: any) => ({
        title: item.title,
        summary: item.summary,
        relevance: item.relevance,
        url: scrapedNews.articles[0]?.url, // Link to source
      }));
    } catch (parseError) {
      console.error('Failed to parse news analysis:', parseError);
      // Fallback: use scraped articles directly
      analyzedArticles = scrapedNews.articles.slice(0, 3).map((a) => ({
        title: a.title,
        summary: a.snippet,
        relevance: 'medium' as const,
        url: a.url,
      }));
    }

    const companyNews: CompanyNews = {
      company,
      articles: analyzedArticles,
      fetchedAt: new Date(),
      source: scrapedNews.source,
    };

    return NextResponse.json({ companyNews }, { status: 200 });
  } catch (error) {
    console.error('Company news error:', error);
    return NextResponse.json(
      {
        error: `Failed to fetch company news: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
