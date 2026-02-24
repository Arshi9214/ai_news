import { NewsArticle, Topic, Language } from '../App';
import { generateLightweightSummary } from './groqApi';

// Indian news RSS feeds (most reliable sources)
const RSS_FEEDS = {
  toi: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
  hindu: 'https://www.thehindu.com/news/national/feeder/default.rss',
  indianExpress: 'https://indianexpress.com/feed/',
  hindustanTimes: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
  ndtv: 'https://feeds.feedburner.com/ndtvnews-top-stories',
  livemint: 'https://www.livemint.com/rss/news',
  wire: 'https://thewire.in/feed',
  indiaToday: 'https://www.indiatoday.in/rss/home'
};

// Try multiple CORS proxies
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

function cleanHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function isEnglish(text: string): boolean {
  // Check if text contains Devanagari script (Hindi)
  const hindiPattern = /[\u0900-\u097F]/;
  return !hindiPattern.test(text);
}

export async function fetchRSSNews(
  topics: Topic[],
  language: Language,
  dateRange?: { from: Date; to: Date }
): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  
  for (const [source, feedUrl] of Object.entries(RSS_FEEDS)) {
    let success = false;
    
    for (const proxy of CORS_PROXIES) {
      try {
        const proxiedUrl = proxy + encodeURIComponent(feedUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
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
        
        for (let i = 0; i < items.length; i++) {
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
            id: `rss-${source}-${guid || link || Date.now()}-${i}`,
            title,
            content: content.length > title.length ? content : `${title}. Click 'Generate Summary' for AI analysis or visit the article link for full content.`,
            summary: content.length > title.length ? content.substring(0, 200) + (content.length > 200 ? '...' : '') : 'Click Generate Summary for AI-powered analysis',
            source: { name: source.toUpperCase() },
            date: pubDate ? new Date(pubDate) : new Date(),
            topics: detectTopics(title + ' ' + content, topics),
            language,
            url: link,
            imageUrl: undefined,
            bookmarked: false
          };
          
          articles.push(article);
        }
        
        success = true;
        console.log(`✅ RSS ${source}: Fetched ${items.length} items via ${proxy}`);
        break;
      } catch (error) {
        console.log(`⚠️ RSS ${source} failed with ${proxy}:`, error);
        continue;
      }
    }
    
    if (!success) {
      console.error(`❌ All proxies failed for ${source}`);
    }
  }
  
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime())
    .filter(article => {
      if (!dateRange) return true;
      const articleTime = article.date.getTime();
      const inRange = articleTime >= dateRange.from.getTime() && articleTime <= dateRange.to.getTime();
      if (!inRange && articles.indexOf(article) < 3) {
        console.log('Article filtered:', article.title, 'Date:', article.date, 'Range:', dateRange.from, '-', dateRange.to);
      }
      return inRange;
    });
}

export async function generateRSSSummary(
  article: NewsArticle,
  language: Language
): Promise<NewsArticle> {
  try {
    const summaryResult = await generateLightweightSummary(
      article.title,
      article.content,
      article.summary || '',
      language
    );
    
    return {
      ...article,
      summary: summaryResult.summary,
      analysis: {
        summary: summaryResult.summary,
        keyTakeaways: summaryResult.keyTakeaways,
        examRelevance: '',
        importantFacts: [],
        potentialQuestions: [],
        relatedTopics: article.topics
      }
    };
  } catch (error) {
    console.error('Error generating RSS summary:', error);
    return article;
  }
}

function detectTopics(content: string, selectedTopics: Topic[]): Topic[] {
  const lowerContent = content.toLowerCase();
  const keywords: Record<Topic, string[]> = {
    all: [],
    economy: ['economy', 'gdp', 'rbi', 'budget', 'market', 'finance'],
    polity: ['government', 'parliament', 'politics', 'election', 'minister'],
    environment: ['environment', 'climate', 'pollution', 'green', 'carbon'],
    international: ['foreign', 'international', 'global', 'world', 'country'],
    science: ['technology', 'science', 'isro', 'research', 'innovation'],
    society: ['education', 'health', 'society', 'social', 'welfare'],
    history: ['history', 'heritage', 'ancient', 'historical'],
    geography: ['geography', 'natural', 'resources', 'region']
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
