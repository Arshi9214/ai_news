import { NewsArticle, Topic, Language } from '../App';

/**
 * Real-time news API integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get a free API key from https://newsapi.org or https://gnews.io
 * 2. Replace 'YOUR_API_KEY_HERE' with your actual API key
 * 3. For production, use environment variables instead of hardcoding
 */

const NEWS_API_KEY = 'YOUR_NEWS_API_KEY_HERE';
const GNEWS_API_KEY = 'YOUR_GNEWS_API_KEY_HERE';

// Fallback to NewsAPI.org if primary fails
const USE_NEWSAPI = true; // Set to false to use GNews

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

/**
 * Maps topics to search keywords for news APIs
 */
const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  all: ['India', 'current affairs', 'news'],
  economy: ['India economy', 'GDP', 'RBI', 'monetary policy', 'fiscal policy', 'trade'],
  polity: ['India politics', 'government', 'parliament', 'constitution', 'judiciary', 'election'],
  environment: ['climate change India', 'environment', 'pollution', 'renewable energy', 'conservation'],
  international: ['India foreign policy', 'international relations', 'diplomacy', 'global affairs'],
  science: ['science technology India', 'ISRO', 'research', 'innovation', 'space'],
  society: ['India society', 'education', 'health', 'welfare', 'social issues'],
  history: ['Indian history', 'heritage', 'archaeology', 'culture'],
  geography: ['India geography', 'rivers', 'climate', 'natural resources', 'disasters']
};

/**
 * Maps topics to Indian news sources
 */
const INDIAN_NEWS_SOURCES = [
  'the-hindu',
  'the-times-of-india',
  'bbc-news',
  'reuters',
  'google-news-in'
].join(',');

/**
 * Fetches real-time news from NewsAPI.org
 */
async function fetchFromNewsAPI(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  const activeTopics = topics.includes('all') 
    ? ['economy', 'polity', 'environment', 'international', 'science', 'society'] as Topic[]
    : topics;
  
  const keywords = activeTopics
    .flatMap(topic => TOPIC_KEYWORDS[topic])
    .join(' OR ');
  
  const langCode = language === 'en' ? 'en' : 'hi'; // NewsAPI supports limited languages
  
  const params = new URLSearchParams({
    q: keywords,
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0],
    language: langCode,
    sortBy: 'publishedAt',
    apiKey: NEWS_API_KEY,
    pageSize: '50'
  });
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI request failed');
    }
    
    return data.articles.map((article: NewsAPIArticle) => 
      convertToNewsArticle(article, topics, language)
    );
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    throw error;
  }
}

/**
 * Fetches real-time news from GNews.io (alternative API)
 */
async function fetchFromGNews(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  const activeTopics = topics.includes('all') 
    ? ['economy', 'polity', 'environment'] as Topic[]
    : topics;
  
  const keywords = activeTopics
    .flatMap(topic => TOPIC_KEYWORDS[topic])
    .slice(0, 3) // GNews has query length limits
    .join(' ');
  
  const langCode = language === 'en' ? 'en' : language === 'hi' ? 'hi' : 'en';
  
  const params = new URLSearchParams({
    q: keywords,
    lang: langCode,
    country: 'in',
    max: '50',
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    apikey: GNEWS_API_KEY
  });
  
  try {
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
    
    return data.articles.map((article: GNewsArticle) => 
      convertGNewsToArticle(article, topics, language)
    );
  } catch (error) {
    console.error('GNews fetch error:', error);
    throw error;
  }
}

/**
 * Main function to fetch real-time news
 */
export async function fetchRealTimeNews(
  topics: Topic[],
  dateRange: { from: Date; to: Date },
  language: Language
): Promise<NewsArticle[]> {
  // Check if API keys are configured
  if (NEWS_API_KEY === 'YOUR_NEWS_API_KEY_HERE' && GNEWS_API_KEY === 'YOUR_GNEWS_API_KEY_HERE') {
    throw new Error(
      'News API keys not configured. Please add your API key in /utils/newsApi.ts. ' +
      'Get free API keys from https://newsapi.org or https://gnews.io'
    );
  }
  
  try {
    if (USE_NEWSAPI && NEWS_API_KEY !== 'YOUR_NEWS_API_KEY_HERE') {
      return await fetchFromNewsAPI(topics, dateRange, language);
    } else if (GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY_HERE') {
      return await fetchFromGNews(topics, dateRange, language);
    } else {
      throw new Error('No valid API key configured');
    }
  } catch (error: any) {
    console.error('Error fetching real-time news:', error);
    // Re-throw with user-friendly message
    throw new Error(
      `Failed to fetch news: ${error.message}. ` +
      'Please check your API key and internet connection.'
    );
  }
}

/**
 * Fetches news for a specific time period (advanced mode)
 */
export async function fetchNewsForTimePeriod(
  topics: Topic[],
  startDate: Date,
  endDate: Date,
  language: Language
): Promise<NewsArticle[]> {
  return fetchRealTimeNews(topics, { from: startDate, to: endDate }, language);
}

/**
 * Converts NewsAPI article to our format
 */
function convertToNewsArticle(
  article: NewsAPIArticle,
  topics: Topic[],
  language: Language
): NewsArticle {
  // Determine topic based on content
  const detectedTopic = detectTopicFromContent(article.title + ' ' + article.description);
  
  return {
    id: Math.random().toString(36).substr(2, 9) + Date.now(),
    title: article.title || 'Untitled',
    content: article.content || article.description || '',
    source: article.source.name || 'Unknown Source',
    date: new Date(article.publishedAt),
    topics: [detectedTopic],
    language,
    url: article.url,
    imageUrl: article.urlToImage,
    bookmarked: false
  };
}

/**
 * Converts GNews article to our format
 */
function convertGNewsToArticle(
  article: GNewsArticle,
  topics: Topic[],
  language: Language
): NewsArticle {
  const detectedTopic = detectTopicFromContent(article.title + ' ' + article.description);
  
  return {
    id: Math.random().toString(36).substr(2, 9) + Date.now(),
    title: article.title || 'Untitled',
    content: article.content || article.description || '',
    source: article.source.name || 'Unknown Source',
    date: new Date(article.publishedAt),
    topics: [detectedTopic],
    language,
    url: article.url,
    imageUrl: article.image,
    bookmarked: false
  };
}

/**
 * Detects topic from article content using keyword matching
 */
function detectTopicFromContent(content: string): Topic {
  const lowerContent = content.toLowerCase();
  
  const topicScores: Record<Topic, number> = {
    all: 0,
    economy: 0,
    polity: 0,
    environment: 0,
    international: 0,
    science: 0,
    society: 0,
    history: 0,
    geography: 0
  };
  
  // Score each topic based on keyword presence
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        topicScores[topic as Topic] += 1;
      }
    });
  });
  
  // Find topic with highest score
  let maxScore = 0;
  let detectedTopic: Topic = 'all';
  
  Object.entries(topicScores).forEach(([topic, score]) => {
    if (score > maxScore && topic !== 'all') {
      maxScore = score;
      detectedTopic = topic as Topic;
    }
  });
  
  return detectedTopic || 'all';
}

/**
 * Utility to get date range based on preset
 */
export function getDateRange(preset: '24h' | 'week' | 'month' | 'custom', customDates?: { from: Date; to: Date }): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  
  switch (preset) {
    case '24h':
      from.setDate(from.getDate() - 1);
      break;
    case 'week':
      from.setDate(from.getDate() - 7);
      break;
    case 'month':
      from.setMonth(from.getMonth() - 1);
      break;
    case 'custom':
      return customDates || { from, to };
  }
  
  return { from, to };
}
