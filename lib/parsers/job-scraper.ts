import * as cheerio from 'cheerio';

export interface ScrapedJob {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  rawHtml: string;
  companyDetectionMethod?: 'selector' | 'url' | 'meta' | 'text-pattern' | 'domain' | 'unknown';
  companyConfidence?: 'high' | 'medium' | 'low';
  needsManualCompanyInput?: boolean;
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

    // Detect login/auth walls before attempting extraction
    const pageTitle = $('title').text().toLowerCase();
    const loginIndicators = [
      'log in', 'login', 'sign in', 'signin', 'sign up', 'authenticate',
      'access denied', 'authorization required', 'please log in',
    ];
    const isLoginPage = loginIndicators.some(indicator => pageTitle.includes(indicator));
    if (isLoginPage) {
      throw new Error('LOGIN_WALL');
    }

    // Detect platform
    const platform = detectPlatform(url);
    const selectors = platform ? PLATFORM_SELECTORS[platform] : null;

    let title = '';
    let company = '';
    let description = '';

    // Extract title
    if (selectors) {
      title = $(selectors.title).first().text().trim();
    }

    // Fallback: generic title extraction
    if (!title) {
      title =
        $('h1').first().text().trim() ||
        $('[class*="title"]').first().text().trim() ||
        $('[class*="job-title"]').first().text().trim() ||
        $('title').text().replace(/\s*\|\s*.+$/, '').trim(); // Remove site name from page title
    }

    // Smart company name extraction with multiple strategies
    const companyResult = extractCompanyName(url, $, selectors);
    company = companyResult.company;

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

    console.log(`[Job Scraper] Company extraction: ${company} (method: ${companyResult.method}, confidence: ${companyResult.confidence})`);

    return {
      title: title || 'Unknown Position',
      company: company || 'Company Name',
      description,
      requirements,
      rawHtml: html,
      companyDetectionMethod: companyResult.method as any,
      companyConfidence: companyResult.confidence,
      needsManualCompanyInput: companyResult.needsManual,
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

/**
 * Extract company name from URL structure
 * Examples:
 * - boards.greenhouse.io/company-name/jobs/123 -> company-name
 * - jobs.lever.co/companyname -> companyname
 * - myworkdayjobs.com/companyname/job/123 -> companyname
 */
function extractCompanyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Greenhouse pattern: boards.greenhouse.io/COMPANY/jobs/...
    if (hostname.includes('greenhouse.io')) {
      const match = pathname.match(/^\/([^\/]+)\/jobs?/);
      if (match && match[1]) {
        return formatCompanyName(match[1]);
      }
    }

    // Lever pattern: jobs.lever.co/COMPANY or jobs.lever.co/COMPANY/...
    if (hostname.includes('lever.co')) {
      const match = pathname.match(/^\/([^\/]+)/);
      if (match && match[1]) {
        return formatCompanyName(match[1]);
      }
    }

    // Workday pattern: myworkdayjobs.com/COMPANY/... or COMPANY.wd1.myworkdayjobs.com
    if (hostname.includes('myworkdayjobs.com')) {
      // Check subdomain first
      const subdomainMatch = hostname.match(/^([^.]+)\.wd\d+\.myworkdayjobs/);
      if (subdomainMatch && subdomainMatch[1]) {
        return formatCompanyName(subdomainMatch[1]);
      }
      // Check path
      const pathMatch = pathname.match(/^\/([^\/]+)/);
      if (pathMatch && pathMatch[1]) {
        return formatCompanyName(pathMatch[1]);
      }
    }

    // Career page pattern: careers.company.com or company.com/careers
    if (hostname.includes('careers') || pathname.includes('/careers') || pathname.includes('/jobs')) {
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        // Get the main domain (before .com/.io/etc)
        const mainDomain = domainParts[domainParts.length - 2];
        if (mainDomain !== 'careers' && mainDomain !== 'jobs') {
          return formatCompanyName(mainDomain);
        }
        // If careers subdomain, try parent domain
        if (domainParts.length >= 3 && domainParts[0] === 'careers') {
          return formatCompanyName(domainParts[domainParts.length - 2]);
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Format company name from URL slug
 * Examples:
 * - "acme-corp" -> "Acme Corp"
 * - "google" -> "Google"
 * - "meta_platforms" -> "Meta Platforms"
 */
function formatCompanyName(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .split(' ')
    .map(word => {
      // Capitalize first letter of each word
      if (word.length === 0) return '';
      // Keep all caps words as is (like "IBM", "AWS")
      if (word === word.toUpperCase() && word.length > 1) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

/**
 * Extract company name from description text patterns
 */
function extractCompanyFromText(description: string): string | null {
  // Pattern 1: "About [Company Name]" or "About Company Name"
  const aboutMatch = description.match(/About\s+([A-Z][A-Za-z\s&,.]+?)(?:\n|$|is|was|:|—)/);
  if (aboutMatch && aboutMatch[1]) {
    const candidate = aboutMatch[1].trim();
    if (candidate.split(' ').length <= 4) {
      // Reasonable company name length
      return candidate;
    }
  }

  // Pattern 2: "[Company Name] is looking for" or "[Company Name] seeks"
  const seekingMatch = description.match(/^([A-Z][A-Za-z\s&,.]+?)\s+(?:is|are)\s+(?:looking for|seeking|hiring)/m);
  if (seekingMatch && seekingMatch[1]) {
    const candidate = seekingMatch[1].trim();
    if (candidate.split(' ').length <= 4) {
      return candidate;
    }
  }

  // Pattern 3: "Join [Company Name]" or "Come work at [Company Name]"
  const joinMatch = description.match(/(?:Join|Come work (?:at|with))\s+([A-Z][A-Za-z\s&,.]+?)(?:\n|$|!|\.)/);
  if (joinMatch && joinMatch[1]) {
    const candidate = joinMatch[1].trim();
    if (candidate.split(' ').length <= 4) {
      return candidate;
    }
  }

  return null;
}

/**
 * Smart company name extraction with multiple fallback strategies
 */
function extractCompanyName(url: string, $: cheerio.CheerioAPI, selectors: typeof PLATFORM_SELECTORS[keyof typeof PLATFORM_SELECTORS] | null): {
  company: string;
  method: string;
  confidence: 'high' | 'medium' | 'low';
  needsManual: boolean;
} {
  let company = '';
  let method = 'unknown';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Strategy 1: Platform-specific selectors (highest confidence)
  if (selectors) {
    company = $(selectors.company).first().text().trim();
    // Also try alt attribute for logos
    if (!company && selectors.company.includes('img')) {
      company = $(selectors.company).first().attr('alt') || '';
    }
    if (company) {
      method = 'selector';
      confidence = 'high';
      return { company, method, confidence, needsManual: false };
    }
  }

  // Strategy 2: Extract from URL structure (high confidence)
  const urlCompany = extractCompanyFromUrl(url);
  if (urlCompany) {
    company = urlCompany;
    method = 'url';
    confidence = 'high';
    return { company, method, confidence, needsManual: false };
  }

  // Strategy 3: Meta tags (medium-high confidence)
  const metaCompany =
    $('meta[property="og:site_name"]').attr('content') ||
    $('meta[name="author"]').attr('content') ||
    $('meta[name="company"]').attr('content') ||
    '';
  if (metaCompany) {
    company = metaCompany.trim();
    method = 'meta';
    confidence = 'medium';
    return { company, method, confidence, needsManual: false };
  }

  // Strategy 4: Generic class-based selectors (medium confidence)
  const genericCompany =
    $('[class*="company-name"]').first().text().trim() ||
    $('[class*="employer"]').first().text().trim() ||
    $('[data-company]').first().attr('data-company') ||
    '';
  if (genericCompany) {
    company = genericCompany;
    method = 'selector';
    confidence = 'medium';
    return { company, method, confidence, needsManual: false };
  }

  // Strategy 5: Extract from page text (low-medium confidence)
  const bodyText = $('body').text();
  const textCompany = extractCompanyFromText(bodyText);
  if (textCompany) {
    company = textCompany;
    method = 'text-pattern';
    confidence = 'medium';
    return { company, method, confidence, needsManual: false };
  }

  // Strategy 6: Domain name as last resort (low confidence)
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[domainParts.length - 2];
      // Skip generic domains
      if (!['jobs', 'careers', 'boards', 'greenhouse', 'lever', 'indeed', 'linkedin', 'workday'].includes(mainDomain)) {
        company = formatCompanyName(mainDomain);
        method = 'domain';
        confidence = 'low';
        return { company, method, confidence, needsManual: true };
      }
    }
  } catch {
    // Ignore URL parsing errors
  }

  // Failed to extract company name
  return {
    company: 'Company Name',
    method: 'unknown',
    confidence: 'low',
    needsManual: true,
  };
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
