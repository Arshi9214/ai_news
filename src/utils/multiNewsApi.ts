import { NewsArticle, Topic, Language } from '../App';
import { generateLightweightSummary } from './groqApi';

/**
 * Multi-source News API Integration with Fallback
 * Priority: WorldNewsAPI → NewsData.io → GNews
 */

// API Keys Configuration
const WORLD_NEWS_API_KEY = import.meta.env.VITE_WORLD_NEWS_API_KEY || 'YOUR_WORLDNEWS_API_KEY_HERE';
const NEWSDATA_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'YOUR_NEWSDATA_API_KEY_HERE';
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || 'YOUR_GNEWS_API_KEY_HERE';

type NewsSource = 'worldnews' | 'newsdata' | 'gnews';

/**
 * Topic to keywords mapping for Indian context
 */
const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  all: ['India', 'भारत', 'news'],
  economy: ['economy', 'GDP', 'RBI', 'budget', 'अर्थव्यवस्था'],
  polity: ['government', 'parliament', 'politics', 'सरकार', 'राजनीति'],
  environment: ['environment', 'climate', 'pollution', 'पर्यावरण'],
  international: ['foreign policy', 'international', 'विदेश नीति'],
  science: ['technology', 'science', 'ISRO', 'विज्ञान'],
  society: ['education', 'health', 'society', 'समाज', 'शिक्षा'],
  history: ['history', 'heritage', 'इतिहास'],
  geography: ['geography', 'भूगोल', 'natural resources']
};

/**
 * Language codes mapping
 */
const LANGUAGE_CODES: Record<Language, { worldnews: string; newsdata: string; gnews: string }> = {
  en: { worldnews: 'en', newsdata: 'en', gnews: 'en' },
  hi: { worldnews: 'hi', newsdata: 'hi', gnews: 'hi' },
  ta: { worldnews: 'ta', newsdata: 'ta', gnews: 'en' },
  bn: { worldnews: 'bn', newsdata: 'bn', gnews: 'en' },
  te: { worldnews: 'te', newsdata: 'te', gnews: 'en' },
  mr: { worldnews: 'mr', newsdata: 'mr', gnews: 'en' },
  gu: { worldnews: 'gu', newsdata: 'gu', gnews: 'en' },
  kn: { worldnews: 'kn', newsdata: 'kn', gnews: 'en' },
  ml: { worldnews: 'ml', newsdata: 'ml', gnews: 'en' },
  pa: { worldnews: 'pa', newsdata: 'pa', gnews: 'en' },
  ur: { worldnews: 'ur', newsdata: 'ur', gnews: 'en' }
};

/**
 * Fetch news with automatic fallback
 */
export async function fetchNewsWithFallback(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language,
  onProgress?: (status: string, source: NewsSource) => void
): Promise<NewsArticle[]> {
  const sources: NewsSource[] = ['worldnews', 'newsdata', 'gnews'];
  
  for (const source of sources) {
    try {
      onProgress?.(`Trying ${source}...`, source);
      
      const articles = await fetchFromSource(source, topics, dateRange, language);
      
      if (articles.length > 0) {
        onProgress?.(`Success! Loaded ${articles.length} articles from ${source}`, source);
        return articles;
      }
    } catch (error: any) {
      console.error(`Failed to fetch from ${source}:`, error);
      onProgress?.(`${source} failed, trying next source...`, source);
      continue;
    }
  }
  
  throw new Error('All news sources failed. Please check your API keys and try again.');
}

/**
 * Fetch from specific source
 */
async function fetchFromSource(
  source: NewsSource,
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  switch (source) {
    case 'worldnews':
      return fetchFromWorldNews(topics, dateRange, language);
    case 'newsdata':
      return fetchFromNewsData(topics, dateRange, language);
    case 'gnews':
      return fetchFromGNews(topics, dateRange, language);
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

/**
 * WorldNewsAPI (Primary - 500+ requests/day, 1-month historical)
 */
async function fetchFromWorldNews(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  if (WORLD_NEWS_API_KEY === 'YOUR_WORLDNEWS_API_KEY_HERE') {
    throw new Error('WorldNewsAPI key not configured');
  }

  const keywords = getKeywords(topics, language);
  const langCode = 'en';
  
  const params = new URLSearchParams({
    'api-key': WORLD_NEWS_API_KEY,
    'text': keywords,
    'source-countries': 'in',
    'language': langCode,
    'earliest-publish-date': dateRange.from.toISOString().split('T')[0],
    'latest-publish-date': dateRange.to.toISOString().split('T')[0],
    'sort': 'publish-time',
    'sort-direction': 'DESC',
    'number': '30'
  });

  const response = await fetch(
    `https://api.worldnewsapi.com/search-news?${params}`
  );

  if (!response.ok) {
    throw new Error(`WorldNewsAPI error: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.news || []).map((article: any) => convertWorldNewsArticle(article, topics, language));
}

/**
 * NewsData.io (Secondary - 200 credits/day, local/Hindi support)
 */
async function fetchFromNewsData(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  if (NEWSDATA_API_KEY === 'YOUR_NEWSDATA_API_KEY_HERE') {
    throw new Error('NewsData.io key not configured');
  }

  const keywords = getKeywords(topics, language);
  const langCode = 'en';
  
  const params = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    q: keywords,
    country: 'in',
    language: langCode,
    size: '30'
  });

  const response = await fetch(
    `https://newsdata.io/api/1/news?${params}`
  );

  if (!response.ok) {
    throw new Error(`NewsData.io error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'success') {
    throw new Error(data.message || 'NewsData.io request failed');
  }
  
  return (data.results || []).map((article: any) => convertNewsDataArticle(article, topics, language));
}

/**
 * GNews (Fallback - 100 requests/day, 30 days historical)
 */
async function fetchFromGNews(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  if (GNEWS_API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
    throw new Error('GNews key not configured');
  }

  const keywords = getKeywords(topics, language);
  const langCode = 'en';
  
  const params = new URLSearchParams({
    apikey: GNEWS_API_KEY,
    q: keywords,
    country: 'in',
    lang: langCode,
    max: '30',
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString()
  });

  const response = await fetch(
    `https://gnews.io/api/v4/search?${params}`
  );

  if (!response.ok) {
    throw new Error(`GNews error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0] || 'GNews request failed');
  }
  
  return (data.articles || []).map((article: any) => convertGNewsArticle(article, topics, language));
}

/**
 * Generate summary for a single article (used for lazy loading)
 */
export async function generateArticleSummary(
  article: NewsArticle,
  language: Language,
  onUpdate?: (updatedArticle: NewsArticle) => void
): Promise<NewsArticle> {
  try {
    const summaryResult = await generateLightweightSummary(
      article.title,
      article.content,
      article.summary || '',
      language
    );
    
    const updatedArticle = {
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
    
    onUpdate?.(updatedArticle);
    return updatedArticle;
  } catch (error) {
    console.error('Error generating summary:', error);
    return article;
  }
}

/**
 * Convert WorldNewsAPI article
 */
function convertWorldNewsArticle(article: any, topics: Topic[], language: Language): NewsArticle {
  return {
    id: article.id?.toString() || generateId(),
    title: article.title || 'Untitled',
    content: article.text || article.summary || '',
    summary: article.summary || '',
    source: { name: article.source?.name || article.source || 'News Source' },
    date: new Date(article.publish_date || Date.now()),
    topics: detectTopics(article.title + ' ' + article.text, topics),
    language,
    url: article.url,
    imageUrl: article.image,
    bookmarked: false
  };
}

/**
 * Convert NewsData.io article
 */
function convertNewsDataArticle(article: any, topics: Topic[], language: Language): NewsArticle {
  return {
    id: article.article_id || generateId(),
    title: article.title || 'Untitled',
    content: article.content || article.description || '',
    summary: article.description || '',
    source: { name: article.source_id || 'Unknown' },
    date: new Date(article.pubDate || Date.now()),
    topics: detectTopics(article.title + ' ' + article.content, topics),
    language,
    url: article.link,
    imageUrl: article.image_url,
    bookmarked: false
  };
}

/**
 * Convert GNews article
 */
function convertGNewsArticle(article: any, topics: Topic[], language: Language): NewsArticle {
  return {
    id: generateId(),
    title: article.title || 'Untitled',
    content: article.content || article.description || '',
    summary: article.description || '',
    source: { name: article.source?.name || 'Unknown' },
    date: new Date(article.publishedAt || Date.now()),
    topics: detectTopics(article.title + ' ' + article.content, topics),
    language,
    url: article.url,
    imageUrl: article.image,
    bookmarked: false
  };
}

/**
 * Helper functions
 */
function getKeywords(topics: Topic[], language: Language): string {
  const activeTopics = topics.includes('all') 
    ? ['economy', 'polity', 'environment', 'science'] as Topic[]
    : topics;
  
  // Use only English keywords regardless of language
  const keywords = activeTopics
    .flatMap(topic => TOPIC_KEYWORDS[topic].filter(kw => !/[\u0900-\u097F\u0980-\u09FF]/.test(kw)))
    .filter(Boolean)
    .slice(0, 5);
  
  return keywords.join(' OR ');
}

function detectTopics(content: string, selectedTopics: Topic[]): Topic[] {
  const lowerContent = content.toLowerCase();
  const detected: Topic[] = [];
  
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    if (topic === 'all') return;
    
    const hasKeyword = keywords.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      detected.push(topic as Topic);
    }
  });
  
  return detected.length > 0 ? detected.slice(0, 2) : selectedTopics.filter(t => t !== 'all');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get date range helper
 */
export function getDateRange(
  preset: '24h' | 'week' | 'month' | 'custom',
  customDates?: { from: Date; to: Date }
): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  
  switch (preset) {
    case '24h':
      from.setDate(to.getDate() - 1);
      break;
    case 'week':
      from.setDate(to.getDate() - 7);
      break;
    case 'month':
      from.setDate(to.getDate() - 30);
      break;
    case 'custom':
      if (customDates) {
        // Ensure dates are not in the future
        const now = new Date();
        return {
          from: customDates.from > now ? now : customDates.from,
          to: customDates.to > now ? now : customDates.to
        };
      }
      return { from, to };
  }
  
  return { from, to };
}
