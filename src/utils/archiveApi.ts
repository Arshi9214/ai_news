/// <reference types="vite/client" />
import { NewsArticle, Topic, Language } from '../App';

/**
 * News Archive Fetcher for Historical Data
 * Fetches from news archive pages for comprehensive monthly/custom date range coverage
 */

// Archive URLs for major Indian news sources
const ARCHIVE_SOURCES = {
  hindu: {
    baseUrl: 'https://www.thehindu.com/archive/web',
    format: (date: Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`,
    rssFormat: (date: Date) => `https://www.thehindu.com/news/national/feeder/default.rss`
  },
  toi: {
    baseUrl: 'https://timesofindia.indiatimes.com/archive',
    format: (date: Date) => `year-${date.getFullYear()},month-${date.getMonth() + 1}.cms`,
    rssFormat: (date: Date) => `https://timesofindia.indiatimes.com/rssfeedstopstories.cms`
  },
  indianExpress: {
    baseUrl: 'https://indianexpress.com/archive',
    format: (date: Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`,
    rssFormat: (date: Date) => `https://indianexpress.com/feed/`
  },
  ndtv: {
    baseUrl: 'https://www.ndtv.com/archive',
    format: (date: Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`,
    rssFormat: (date: Date) => `https://feeds.feedburner.com/ndtvnews-top-stories`
  },
  livemint: {
    baseUrl: 'https://www.livemint.com/archive',
    format: (date: Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`,
    rssFormat: (date: Date) => `https://www.livemint.com/rss/news`
  }
};

// CORS proxies for archive access
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

/**
 * Fetch historical news from archives for date ranges > 7 days
 * Now supports progressive loading - articles are yielded as they're fetched
 */
export async function fetchArchiveNews(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language,
  onProgress?: (status: string, source: string) => void,
  onArticlesFound?: (articles: NewsArticle[]) => void
): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  const daysDiff = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24);
  
  // For longer ranges (month/custom), use web scraping for historical content
  if (daysDiff > 7.5) {
    console.log('📚 Using web scraping for historical content (month/custom range)');
    
    // Generate actual historical dates to scrape
    const datesToScrape = generateHistoricalDates(dateRange.from, dateRange.to);
    console.log(`🗓️ Will scrape ${datesToScrape.length} historical dates from multiple sources`);
    
    // Scrape from multiple news sources
    const archiveSources = [
      { name: 'indianExpress', scraper: scrapeIndianExpressArchive },
      { name: 'timesOfIndia', scraper: scrapeTimesOfIndiaArchive }
    ];
    
    for (const source of archiveSources) {
      onProgress?.(`Fetching ${source.name} archives...`, source.name);
      
      for (const date of datesToScrape) {
        try {
          const historicalArticles = await source.scraper(date, topics, language);
          if (historicalArticles.length > 0) {
            allArticles.push(...historicalArticles);
            onArticlesFound?.(historicalArticles);
          }
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.warn(`Failed to scrape ${source.name} for ${date.toDateString()}:`, error);
          continue;
        }
      }
    }
  }
  
  // Remove duplicates and sort
  const uniqueArticles = removeDuplicates(allArticles);
  const sortedArticles = uniqueArticles.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  console.log(`✅ Archive fetch complete: ${sortedArticles.length} unique articles`);
  return sortedArticles;
}

/**
 * Fetch archive articles for a specific date
 */
async function fetchArchiveForDate(
  sourceName: string,
  sourceConfig: any,
  date: Date,
  topics: Topic[],
  language: Language
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  
  // Try archive URL first, then fallback to RSS
  const archiveUrl = `${sourceConfig.baseUrl}/${sourceConfig.format(date)}`;
  console.log(`📚 Trying ${sourceName} archive: ${archiveUrl}`);
  
  // First attempt: Archive page
  let archiveSuccess = false;
  for (const proxy of CORS_PROXIES) {
    try {
      const proxiedUrl = proxy + encodeURIComponent(archiveUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        const archiveArticles = parseArchivePage(html, sourceName, date, topics, language);
        
        if (archiveArticles.length > 0) {
          articles.push(...archiveArticles);
          archiveSuccess = true;
          console.log(`📰 ${sourceName} archive: ${archiveArticles.length} articles via ${proxy}`);
          break;
        }
      }
    } catch (error) {
      console.warn(`${sourceName} archive failed with ${proxy}:`, error);
      continue;
    }
  }
  
  // Fallback: RSS feed if archive failed
  if (!archiveSuccess) {
    console.log(`📡 Fallback to ${sourceName} RSS feed`);
    const rssUrl = sourceConfig.rssFormat(date);
    
    for (const proxy of CORS_PROXIES) {
      try {
        const proxiedUrl = proxy + encodeURIComponent(rssUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(proxiedUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/xml, text/xml' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        if (items.length === 0) continue;
        
        for (let i = 0; i < Math.min(items.length, 15); i++) {
          const item = items[i];
          const title = item.querySelector('title')?.textContent || 'Untitled';
          const description = item.querySelector('description')?.textContent || '';
          const contentEncoded = item.querySelector('content\\:encoded, encoded')?.textContent || '';
          const content = cleanHTML(contentEncoded || description || title);
          
          // Skip non-English articles if language is English
          if (language === 'en' && !isEnglish(title + ' ' + content)) {
            continue;
          }
          
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const guid = item.querySelector('guid')?.textContent || '';
          
          const article: NewsArticle = {
            id: `archive-${sourceName}-${guid || link || Date.now()}-${i}`,
            title,
            content: content.length > title.length ? content : `${title}. Recent news content.`,
            summary: content.length > title.length ? content.substring(0, 1000) : 'Recent news from RSS feed',
            source: { name: sourceName.toUpperCase() },
            date: pubDate ? new Date(pubDate) : date,
            topics: detectTopics(title + ' ' + content, topics),
            language,
            url: link,
            imageUrl: undefined,
            bookmarked: false
          };
          
          articles.push(article);
        }
        
        console.log(`📰 ${sourceName} RSS: ${items.length} items via ${proxy}`);
        break;
      } catch (error) {
        console.warn(`${sourceName} RSS failed with ${proxy}:`, error);
        continue;
      }
    }
  }
  
  return articles;
}

/**
 * Parse archive page HTML to extract articles
 */
function parseArchivePage(
  html: string,
  sourceName: string,
  date: Date,
  topics: Topic[],
  language: Language
): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let headlines: NodeListOf<Element> | null = null;
  
  // Source-specific selectors for actual article links
  switch (sourceName) {
    case 'hindu':
      headlines = doc.querySelectorAll('h3 a, .story-card h3 a, .archive-list h3 a, .story-card-54x1 h3 a');
      break;
    case 'toi':
      headlines = doc.querySelectorAll('.news_Itm h4 a, .list5 h4 a, .archive-news h4 a');
      break;
    case 'indianExpress':
      headlines = doc.querySelectorAll('.articles h2 a, .nation h2 a, .archive-item h2 a');
      break;
    case 'ndtv':
      headlines = doc.querySelectorAll('.news_Itm h2 a, .src_itm-ttl a, .archive-list h2 a');
      break;
    case 'livemint':
      headlines = doc.querySelectorAll('.headline a, .story h2 a, .archive-story h2 a');
      break;
    default:
      headlines = doc.querySelectorAll('h1 a, h2 a, h3 a, h4 a');
  }
  
  if (!headlines || headlines.length === 0) {
    console.log(`No headlines found for ${sourceName} archive`);
    return articles;
  }
  
  for (let i = 0; i < Math.min(headlines.length, 20); i++) {
    const link = headlines[i] as HTMLAnchorElement;
    const title = link.textContent?.trim() || link.getAttribute('title')?.trim() || '';
    let url = link.href;
    
    // Skip invalid titles or URLs
    if (title.length < 15 || !url || title.toLowerCase().includes('advertisement')) continue;
    
    // Fix relative URLs
    if (url.startsWith('/')) {
      const baseUrls: Record<string, string> = {
        hindu: 'https://www.thehindu.com',
        toi: 'https://timesofindia.indiatimes.com',
        indianExpress: 'https://indianexpress.com',
        ndtv: 'https://www.ndtv.com',
        livemint: 'https://www.livemint.com'
      };
      url = baseUrls[sourceName] + url;
    }
    
    // Skip non-English articles if language is English
    if (language === 'en' && !isEnglish(title)) {
      continue;
    }
    
    // Try to get description from nearby elements
    let description = '';
    const parent = link.closest('div, article, li');
    if (parent) {
      const descElement = parent.querySelector('p, .summary, .description, .excerpt');
      description = descElement?.textContent?.trim() || '';
    }
    
    const article: NewsArticle = {
      id: `archive-${sourceName}-${date.getTime()}-${i}`,
      title,
      content: description || `${title}. Read full article for complete details.`,
      summary: description.substring(0, 200) || `News article from ${sourceName.toUpperCase()} archive`,
      source: { name: sourceName.toUpperCase() },
      date: date,
      topics: detectTopics(title + ' ' + description, topics),
      language,
      url,
      imageUrl: undefined,
      bookmarked: false
    };
    
    articles.push(article);
  }
  
  return articles;
}

/**
 * Generate historical dates for scraping
 */
function generateHistoricalDates(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  // Ensure we're working with past dates only
  const actualTo = new Date(Math.min(to.getTime(), now.getTime() - 24 * 60 * 60 * 1000)); // At least 1 day ago
  const actualFrom = new Date(from.getTime());
  
  console.log(`📅 Scraping range: ${actualFrom.toDateString()} to ${actualTo.toDateString()}`);
  
  const daysDiff = (actualTo.getTime() - actualFrom.getTime()) / (1000 * 60 * 60 * 24);
  
  // Scrape every day for all ranges (month and custom)
  for (let d = new Date(actualFrom); d <= actualTo; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates; // No limit - scrape all dates
}

/**
 * Scrape Indian Express archive for a specific date
 */
async function scrapeIndianExpressArchive(
  date: Date,
  topics: Topic[],
  language: Language
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  
  // Indian Express archive URL format: https://indianexpress.com/archive/2024/01/15/
  const archiveUrl = `https://indianexpress.com/archive/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/`;
  
  console.log(`🔍 Scraping: ${archiveUrl}`);
  
  for (const proxy of CORS_PROXIES) {
    try {
      const proxiedUrl = proxy + encodeURIComponent(archiveUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Indian Express specific selectors - try multiple patterns
      let headlines = doc.querySelectorAll('h2 a[href*="/article/"], h3 a[href*="/article/"], .title a[href*="/article/"], .headline a[href*="/article/"]');
      
      // Fallback selectors if specific ones don't work
      if (headlines.length === 0) {
        headlines = doc.querySelectorAll('a[href*="/article/"]');
      }
      
      // Even broader fallback
      if (headlines.length === 0) {
        headlines = doc.querySelectorAll('h1 a, h2 a, h3 a, h4 a');
      }
      
      if (headlines.length === 0) {
        console.log(`No headlines found for ${date.toDateString()}`);
        continue;
      }
      
      for (let i = 0; i < Math.min(headlines.length, 20); i++) {
        const link = headlines[i] as HTMLAnchorElement;
        const title = link.textContent?.trim() || link.getAttribute('title')?.trim() || '';
        let url = link.href;
        
        if (title.length < 10 || !url) continue;
        
        // Fix relative URLs
        if (url.startsWith('/')) {
          url = 'https://indianexpress.com' + url;
        }
        
        // Skip non-English articles if language is English
        if (language === 'en' && !isEnglish(title)) {
          continue;
        }
        
        // Try to get description from nearby elements
        let description = '';
        const parent = link.closest('div, article, li, .story');
        if (parent) {
          const descElement = parent.querySelector('p, .summary, .description, .excerpt, .story-summary');
          description = descElement?.textContent?.trim() || '';
        }
        
        const article: NewsArticle = {
          id: `archive-ie-${date.getTime()}-${i}`,
          title,
          content: description || `${title}. Historical news article from Indian Express archive.`,
          summary: description.substring(0, 200) || `Historical news from ${date.toDateString()}`,
          source: { name: 'INDIANEXPRESS' },
          date: date,
          topics: detectTopics(title + ' ' + description, topics),
          language,
          url,
          imageUrl: undefined,
          bookmarked: false,
          hasRealContent: description.length > 50
        };
        
        articles.push(article);
      }
      
      console.log(`📰 Scraped ${articles.length} articles from ${date.toDateString()}`);
      break;
    } catch (error) {
      console.warn(`Scraping failed with ${proxy}:`, error);
      continue;
    }
  }
  
  return articles;
}

/**
 * Remove duplicate articles based on title similarity
 */
function removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
  const unique: NewsArticle[] = [];
  const seenTitles = new Set<string>();
  
  for (const article of articles) {
    // More aggressive normalization for better duplicate detection
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();
    
    // Create a shorter key for similarity matching (first 50 chars)
    const titleKey = normalizedTitle.substring(0, 50);
    
    // Check if we've seen a very similar title
    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      if (titleKey === seenTitle || 
          (titleKey.length > 20 && seenTitle.includes(titleKey.substring(0, 30))) ||
          (seenTitle.length > 20 && titleKey.includes(seenTitle.substring(0, 30)))) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate && normalizedTitle.length > 10) {
      seenTitles.add(titleKey);
      unique.push(article);
    }
  }
  
  console.log(`🔄 Removed ${articles.length - unique.length} duplicates (${articles.length} → ${unique.length})`);
  return unique;
}

/**
 * Clean HTML content
 */
function cleanHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Scrape Times of India archive for a specific date
 */
async function scrapeTimesOfIndiaArchive(
  date: Date,
  topics: Topic[],
  language: Language
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  const archiveUrl = `https://timesofindia.indiatimes.com/archive/year-${date.getFullYear()},month-${date.getMonth() + 1}.cms`;
  
  console.log(`🔍 Scraping TOI: ${archiveUrl}`);
  
  for (const proxy of CORS_PROXIES) {
    try {
      const proxiedUrl = proxy + encodeURIComponent(archiveUrl);
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) continue;
      
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      const headlines = doc.querySelectorAll('a[href*=".cms"], .news-item a, h4 a');
      
      for (let i = 0; i < Math.min(headlines.length, 15); i++) {
        const link = headlines[i] as HTMLAnchorElement;
        const title = link.textContent?.trim() || '';
        let url = link.href;
        
        if (title.length < 10 || !url) continue;
        if (url.startsWith('/')) url = 'https://timesofindia.indiatimes.com' + url;
        if (language === 'en' && !isEnglish(title)) continue;
        
        const article: NewsArticle = {
          id: `archive-toi-${date.getTime()}-${i}`,
          title,
          content: `${title}. Historical news from Times of India archive.`,
          summary: `Historical news from ${date.toDateString()}`,
          source: { name: 'TIMES OF INDIA' },
          date: date,
          topics: detectTopics(title, topics),
          language,
          url,
          imageUrl: undefined,
          bookmarked: false,
          hasRealContent: false
        };
        
        articles.push(article);
      }
      
      console.log(`📰 TOI: ${articles.length} articles`);
      break;
    } catch (error) {
      continue;
    }
  }
  
  return articles;
}

/**
 * Detect topics from content
 */
function detectTopics(content: string, selectedTopics: Topic[]): Topic[] {
  const lowerContent = content.toLowerCase();
  const keywords: Record<Topic, string[]> = {
    all: [],
    economy: ['economy', 'gdp', 'rbi', 'budget', 'market', 'finance', 'economic'],
    polity: ['government', 'parliament', 'politics', 'election', 'minister', 'policy'],
    environment: ['environment', 'climate', 'pollution', 'green', 'carbon', 'forest'],
    international: ['foreign', 'international', 'global', 'world', 'country', 'diplomatic'],
    science: ['technology', 'science', 'isro', 'research', 'innovation', 'space'],
    society: ['education', 'health', 'society', 'social', 'welfare', 'healthcare'],
    history: ['history', 'heritage', 'ancient', 'historical', 'culture'],
    geography: ['geography', 'natural', 'resources', 'region', 'state', 'river']
  };
  
  const detected: Topic[] = [];
  for (const [topic, words] of Object.entries(keywords)) {
    if (topic === 'all') continue;
    if (words.some(w => lowerContent.includes(w))) {
      detected.push(topic as Topic);
    }
  }
  
  return detected.length > 0 ? detected.slice(0, 2) : ['all'];
}

/**
 * Check if text is English
 */
function isEnglish(text: string): boolean {
  const hindiPattern = /[\u0900-\u097F]/;
  return !hindiPattern.test(text);
}