import * as cheerio from 'cheerio';

export interface ScrapedNews {
  articles: {
    title: string;
    snippet: string;
    url: string;
    date?: string;
  }[];
  source: 'company_website' | 'google_news' | 'industry_general';
}

export async function scrapeCompanyNews(
  companyName: string,
  companyWebsite?: string
): Promise<ScrapedNews> {
  // Strategy 1: Try company website news page
  if (companyWebsite) {
    const newsFromWebsite = await tryCompanyWebsite(companyWebsite);
    if (newsFromWebsite.articles.length > 0) {
      return { ...newsFromWebsite, source: 'company_website' };
    }
  }

  // Strategy 2: Google News search
  const newsFromGoogle = await tryGoogleNewsSearch(companyName);
  if (newsFromGoogle.articles.length > 0) {
    return { ...newsFromGoogle, source: 'google_news' };
  }

  // Strategy 3: No news found
  return { articles: [], source: 'industry_general' };
}

async function tryCompanyWebsite(website: string): Promise<Omit<ScrapedNews, 'source'>> {
  try {
    // Try common news page patterns
    const newsUrls = [
      `${website}/news`,
      `${website}/press`,
      `${website}/press-releases`,
      `${website}/blog`,
      `${website}/newsroom`,
    ];

    for (const url of newsUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);

          const articles: ScrapedNews['articles'] = [];

          // Generic article selectors
          $('article, .news-item, .post, .press-release').each((_, elem) => {
            const title = $(elem).find('h1, h2, h3, .title').first().text().trim();
            const snippet = $(elem).find('p, .excerpt, .summary').first().text().trim();
            const link = $(elem).find('a').first().attr('href') || '';

            if (title && snippet) {
              articles.push({
                title,
                snippet: snippet.substring(0, 200),
                url: link.startsWith('http') ? link : `${website}${link}`,
              });
            }
          });

          if (articles.length > 0) {
            return { articles: articles.slice(0, 5) };
          }
        }
      } catch (error) {
        continue; // Try next URL
      }
    }
  } catch (error) {
    console.error('Company website scraping failed:', error);
  }

  return { articles: [] };
}

async function tryGoogleNewsSearch(companyName: string): Promise<Omit<ScrapedNews, 'source'>> {
  try {
    const query = encodeURIComponent(`${companyName} company news`);
    const url = `https://www.google.com/search?q=${query}&tbm=nws`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return { articles: [] };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const articles: ScrapedNews['articles'] = [];

    // Google News result selectors (these change frequently)
    $('.SoaBEf, .WlydOe, .n0jPhd').each((_, elem) => {
      const title = $(elem).find('.mCBkyc, .nDgy9d').text().trim();
      const snippet = $(elem).find('.GI74Re, .Y3v8qd').text().trim();
      const link = $(elem).find('a').attr('href') || '';

      if (title) {
        articles.push({
          title,
          snippet: snippet.substring(0, 200),
          url: link,
        });
      }
    });

    return { articles: articles.slice(0, 5) };
  } catch (error) {
    console.error('Google News scraping failed:', error);
    return { articles: [] };
  }
}
