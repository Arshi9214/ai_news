/**
 * Web Scraper for Full Article Content
 * Fetches complete article text from URLs for better AI analysis
 */

interface ScrapedContent {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Extract clean text content from HTML
 */
function extractTextFromHTML(html: string): string {
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share');
  scripts.forEach(el => el.remove());
  
  // Try to find main content areas
  const contentSelectors = [
    'article',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    '.story-body',
    '.article-body',
    'main',
    '.main-content'
  ];
  
  let content = '';
  
  // Try each selector to find the main content
  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      content = element.textContent || '';
      if (content.length > 500) { // Good content found
        break;
      }
    }
  }
  
  // Fallback to body if no good content found
  if (content.length < 500) {
    content = doc.body?.textContent || '';
  }
  
  // Clean up the text
  return content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
}

/**
 * Fetch full article content from URL using CORS proxy
 */
export async function scrapeArticleContent(url: string): Promise<ScrapedContent> {
  if (!url) {
    return { content: '', success: false, error: 'No URL provided' };
  }

  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];

  for (let i = 0; i < corsProxies.length; i++) {
    try {
      console.log(`🌐 Scraping article via proxy ${i + 1}: ${url}`);
      
      const proxyUrl = corsProxies[i] + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const content = extractTextFromHTML(html);

      if (content.length > 200) { // Minimum content threshold
        console.log(`✅ Scraped ${content.length} characters from ${url}`);
        return { 
          content: content.substring(0, 8000), // Limit to 8000 chars for Groq
          success: true 
        };
      } else {
        throw new Error('Insufficient content extracted');
      }

    } catch (error) {
      console.warn(`❌ Proxy ${i + 1} failed for ${url}:`, error);
      
      if (i === corsProxies.length - 1) {
        return { 
          content: '', 
          success: false, 
          error: `All proxies failed: ${error}` 
        };
      }
      
      // Wait before trying next proxy
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { content: '', success: false, error: 'All proxies exhausted' };
}

/**
 * Batch scrape multiple articles with rate limiting
 */
export async function scrapeMultipleArticles(
  urls: string[], 
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, ScrapedContent>> {
  const results = new Map<string, ScrapedContent>();
  const delay = 2000; // 2 second delay between requests
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    try {
      const result = await scrapeArticleContent(url);
      results.set(url, result);
      
      if (onProgress) {
        onProgress(i + 1, urls.length);
      }
      
      // Rate limiting delay
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      results.set(url, { 
        content: '', 
        success: false, 
        error: String(error) 
      });
    }
  }
  
  return results;
}