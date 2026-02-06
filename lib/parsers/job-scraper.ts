import * as cheerio from 'cheerio';

export interface ScrapedJob {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  rawHtml: string;
}

const PLATFORM_SELECTORS = {
  linkedin: {
    title: '.top-card-layout__title, .job-details-jobs-unified-top-card__job-title',
    company: '.topcard__org-name-link, .job-details-jobs-unified-top-card__company-name',
    description: '.description__text, .jobs-description__content, .show-more-less-html__markup',
  },
  indeed: {
    title: '.jobsearch-JobInfoHeader-title, h1[class*="jobTitle"]',
    company: '[data-company-name], .jobsearch-CompanyInfoContainer a',
    description: '#jobDescriptionText, .jobsearch-jobDescriptionText',
  },
  greenhouse: {
    title: '.app-title, h1[class*="title"]',
    company: '.company-name, [class*="company"]',
    description: '#content, .job-post, [class*="description"]',
  },
  lever: {
    title: '.posting-headline h2',
    company: '.main-header-logo img[alt]',
    description: '.section-wrapper .content',
  },
  workday: {
    title: 'h2[data-automation-id="jobPostingHeader"]',
    company: '[data-automation-id="jobPostingCompanyName"]',
    description: '[data-automation-id="jobPostingDescription"]',
  },
};

export async function scrapeJobDescription(url: string): Promise<ScrapedJob> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job posting: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Detect platform
    const platform = detectPlatform(url);
    const selectors = platform ? PLATFORM_SELECTORS[platform] : null;

    let title = '';
    let company = '';
    let description = '';

    if (selectors) {
      // Use platform-specific selectors
      title = $(selectors.title).first().text().trim();
      company = $(selectors.company).first().text().trim();
      description = $(selectors.description).first().text().trim();
    }

    // Fallback: generic extraction if platform-specific fails
    if (!title) {
      title =
        $('h1').first().text().trim() ||
        $('[class*="title"]').first().text().trim() ||
        $('title').text().trim();
    }

    if (!company) {
      company =
        $('[class*="company"]').first().text().trim() ||
        $('meta[property="og:site_name"]').attr('content') ||
        '';
    }

    if (!description) {
      // Try to find the main content
      description =
        $('main').text().trim() ||
        $('[class*="description"]').text().trim() ||
        $('[class*="content"]').text().trim() ||
        $('body').text().trim();
    }

    // Clean up the description
    description = cleanText(description);

    // Extract requirements
    const requirements = extractRequirements(description);

    return {
      title: title || 'Unknown Position',
      company: company || 'Unknown Company',
      description,
      requirements,
      rawHtml: html,
    };
  } catch (error) {
    throw new Error(
      `Failed to scrape job posting: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function detectPlatform(url: string): keyof typeof PLATFORM_SELECTORS | null {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('linkedin.com')) return 'linkedin';
  if (urlLower.includes('indeed.com')) return 'indeed';
  if (urlLower.includes('greenhouse.io') || urlLower.includes('boards.greenhouse.io'))
    return 'greenhouse';
  if (urlLower.includes('lever.co') || urlLower.includes('jobs.lever.co')) return 'lever';
  if (urlLower.includes('myworkdayjobs.com')) return 'workday';

  return null;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n+/g, '\n') // Normalize newlines
    .trim();
}

function extractRequirements(description: string): string[] {
  const requirements: string[] = [];
  const lines = description.split('\n');

  let inRequirementsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if we're entering a requirements section
    if (
      /^(requirements|qualifications|what you'll need|what we're looking for|required skills|must have|responsibilities)/i.test(
        trimmed
      )
    ) {
      inRequirementsSection = true;
      continue;
    }

    // Check if we're leaving the requirements section
    if (inRequirementsSection && /^(benefits|perks|what we offer|about us|company)/i.test(trimmed)) {
      break;
    }

    // Extract bullet points or numbered items
    if (inRequirementsSection) {
      const bulletMatch = trimmed.match(/^[•\-\*\d+\.)]\s*(.+)/);
      if (bulletMatch && bulletMatch[1].length > 10) {
        requirements.push(bulletMatch[1].trim());
      }
    }
  }

  return requirements.slice(0, 15); // Limit to 15 key requirements
}
