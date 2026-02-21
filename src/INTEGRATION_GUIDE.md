# API Integration Guide

## Quick Start: Making This Application Production-Ready

This guide provides step-by-step instructions to integrate real APIs and services into your UPSC News Analyzer application.

---

## 1. News API Integration

### Step 1: Get API Keys

Sign up for one or more news APIs:

1. **NewsAPI** (https://newsapi.org/)
   - Free tier: 100 requests/day
   - Paid: $449/month for production

2. **The Guardian API** (https://open-platform.theguardian.com/)
   - Free for non-commercial use

3. **Google News RSS** (Free)
   - No API key required
   - Parse RSS feeds

### Step 2: Update NewsAggregator Component

File: `/components/NewsAggregator.tsx`

```typescript
// Add this function at the top of the file
async function fetchNewsFromAPI(topics: Topic[], dateRange: string, language: Language) {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY; // Add to .env.local
  
  const topicQuery = topics.includes('all') 
    ? 'India OR UPSC OR IAS'
    : topics.join(' OR ');
  
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${topicQuery}&language=${language}&apiKey=${apiKey}`
  );
  
  const data = await response.json();
  
  return data.articles.map((article: any) => ({
    id: article.url,
    title: article.title,
    content: article.description || article.content,
    source: article.source.name,
    date: new Date(article.publishedAt),
    topics: categorizeArticle(article.title + ' ' + article.description),
    language: language,
    url: article.url,
    imageUrl: article.urlToImage,
    bookmarked: false
  }));
}

// Helper function to categorize articles
function categorizeArticle(text: string): Topic[] {
  const keywords = {
    economy: ['gdp', 'economy', 'financial', 'market', 'budget', 'inflation'],
    polity: ['parliament', 'government', 'policy', 'election', 'ministry'],
    environment: ['climate', 'environment', 'pollution', 'green', 'renewable'],
    international: ['foreign', 'relations', 'treaty', 'diplomacy', 'global'],
    science: ['technology', 'research', 'innovation', 'science', 'space'],
    society: ['education', 'health', 'social', 'welfare', 'culture'],
    history: ['heritage', 'historical', 'ancient', 'archaeology'],
    geography: ['geography', 'mapping', 'location', 'region']
  };
  
  const lowerText = text.toLowerCase();
  const topics: Topic[] = [];
  
  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(word => lowerText.includes(word))) {
      topics.push(topic as Topic);
    }
  }
  
  return topics.length > 0 ? topics : ['all'];
}

// In handleFetchNews function, replace mock call:
const handleFetchNews = async () => {
  setLoading(true);
  try {
    const newsArticles = await fetchNewsFromAPI(selectedTopics, dateRange, language);
    
    // Analyze each article
    const analyzedArticles = await Promise.all(
      newsArticles.map(async (article) => ({
        ...article,
        analysis: await analyzeArticleWithAI(article, analysisDepth, language)
      }))
    );
    
    onArticlesLoaded(analyzedArticles);
  } catch (error) {
    console.error('Error fetching news:', error);
    // Fallback to mock data
    const mockArticles = generateMockArticles(20, selectedTopics, language);
    onArticlesLoaded(mockArticles);
  } finally {
    setLoading(false);
  }
};
```

---

## 2. AI Analysis Integration (OpenAI)

### Step 1: Get OpenAI API Key

1. Sign up at https://platform.openai.com/
2. Create API key from dashboard
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=sk-...
   ```

### Step 2: Create AI Service

Create new file: `/utils/aiService.ts`

```typescript
import { NewsArticle, ArticleAnalysis, AnalysisDepth, Language } from '../App';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export async function analyzeArticleWithAI(
  article: NewsArticle,
  depth: AnalysisDepth,
  language: Language
): Promise<ArticleAnalysis> {
  const prompt = `
You are an expert UPSC IAS exam preparation assistant. Analyze the following news article for competitive exam preparation.

Article Title: ${article.title}
Article Content: ${article.content}
Analysis Depth: ${depth}
Output Language: ${language}

Provide a JSON response with the following structure:
{
  "summary": "A ${depth === 'basic' ? '100-200' : '300-500'} word summary",
  "keyTakeaways": ["point 1", "point 2", ...],
  "examRelevance": "Explanation of relevance to UPSC exams",
  "importantFacts": ["fact 1", "fact 2", ...],
  "potentialQuestions": ["question 1", "question 2", ...],
  "policyImplications": ["implication 1", "implication 2", ...],
  "sentiment": "positive|neutral|negative",
  "relatedTopics": ["topic1", "topic2", ...]
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a UPSC exam preparation expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: depth === 'basic' ? 1000 : 2000
      })
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Fallback to mock analysis
    return {
      summary: 'Analysis temporarily unavailable. Please try again.',
      keyTakeaways: [],
      examRelevance: '',
      importantFacts: [],
      potentialQuestions: [],
      relatedTopics: article.topics,
      sentiment: 'neutral'
    };
  }
}
```

### Alternative: Use Anthropic Claude

```typescript
// For Claude API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })
});
```

---

## 3. PDF Processing Integration

### Step 1: Install PDF Parser

```bash
npm install pdf-parse
# or for browser-based
npm install pdfjs-dist
```

### Step 2: Update PDFProcessor Component

File: `/components/PDFProcessor.tsx`

```typescript
import pdfParse from 'pdf-parse';

const handleFiles = async (files: File[]) => {
  setProcessing(true);
  
  for (const file of files) {
    if (file.type === 'application/pdf') {
      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Parse PDF
        const data = await pdfParse(Buffer.from(arrayBuffer));
        
        const extractedText = data.text;
        const pageCount = data.numpages;
        
        // Analyze with AI
        const analysis = await analyzeArticleWithAI(
          {
            id: '',
            title: file.name,
            content: extractedText,
            source: 'PDF Upload',
            date: new Date(),
            topics: ['all'],
            language: language
          },
          analysisDepth,
          language
        );
        
        const pdf: ProcessedPDF = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: extractedText,
          uploadDate: new Date(),
          pageCount: pageCount,
          analysis: analysis
        };
        
        onPDFProcessed(pdf);
      } catch (error) {
        console.error('PDF Processing Error:', error);
        alert(`Error processing ${file.name}`);
      }
    }
  }
  
  setProcessing(false);
};
```

---

## 4. Translation Integration (Optional)

### Using Google Cloud Translation

```typescript
// Install: npm install @google-cloud/translate

import { Translate } from '@google-cloud/translate/v2';

const translate = new Translate({
  key: process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_KEY
});

export async function translateContent(
  text: string,
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en') return text;
  
  const languageMap = {
    hi: 'hi',
    ta: 'ta',
    bn: 'bn',
    te: 'te',
    mr: 'mr',
    gu: 'gu',
    kn: 'kn',
    ml: 'ml',
    pa: 'pa',
    ur: 'ur'
  };
  
  try {
    const [translation] = await translate.translate(
      text,
      languageMap[targetLanguage]
    );
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
}
```

---

## 5. Environment Variables

Create `.env.local` file in root:

```env
# News APIs
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
NEXT_PUBLIC_GUARDIAN_API_KEY=your_guardian_key_here

# AI Services (choose one or multiple)
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_GOOGLE_AI_KEY=...

# Translation (optional)
NEXT_PUBLIC_GOOGLE_TRANSLATE_KEY=...

# Rate Limiting
NEXT_PUBLIC_MAX_REQUESTS_PER_HOUR=100
```

---

## 6. Rate Limiting & Caching

### Implement Request Caching

Create `/utils/cache.ts`:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

### Use in News Fetching

```typescript
const handleFetchNews = async () => {
  const cacheKey = `news-${selectedTopics.join('-')}-${dateRange}-${language}`;
  
  // Check cache first
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) {
    onArticlesLoaded(cached);
    return;
  }
  
  // Fetch and cache
  const articles = await fetchNewsFromAPI(selectedTopics, dateRange, language);
  setCache(cacheKey, articles);
  onArticlesLoaded(articles);
};
```

---

## 7. Error Handling & Fallbacks

```typescript
async function fetchWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => T
): Promise<T> {
  try {
    return await primaryFn();
  } catch (error) {
    console.error('Primary fetch failed, using fallback:', error);
    return fallbackFn();
  }
}

// Usage
const articles = await fetchWithFallback(
  () => fetchNewsFromAPI(topics, dateRange, language),
  () => generateMockArticles(20, topics, language)
);
```

---

## 8. Cost Optimization Tips

### OpenAI Cost Reduction
- Use GPT-3.5-turbo for basic analysis ($0.0015/1K tokens)
- Use GPT-4 only for advanced analysis ($0.03/1K tokens)
- Implement aggressive caching
- Batch process articles

### News API Cost Reduction
- Cache aggressively (24-hour cache for news)
- Use RSS feeds where possible (free)
- Implement smart polling (only fetch when user requests)

### Estimated Monthly Costs

**Low Usage (100 users/day):**
- News API Free Tier: $0
- OpenAI GPT-3.5: ~$15-30/month
- Total: ~$15-30/month

**Medium Usage (1,000 users/day):**
- News API: $449/month
- OpenAI GPT-4: ~$200-400/month
- Total: ~$650-850/month

**High Usage (10,000 users/day):**
- News API: $449/month
- OpenAI: ~$1,500-3,000/month
- CDN: ~$50/month
- Database: ~$100/month
- Total: ~$2,100-3,600/month

---

## 9. Testing Your Integration

```typescript
// Test News API
async function testNewsAPI() {
  const articles = await fetchNewsFromAPI(['economy'], 'week', 'en');
  console.log('Fetched articles:', articles.length);
}

// Test AI Analysis
async function testAIAnalysis() {
  const testArticle = {
    title: 'India GDP Growth',
    content: 'India\'s GDP grows at 7.5%...',
    // ... other fields
  };
  const analysis = await analyzeArticleWithAI(testArticle, 'basic', 'en');
  console.log('Analysis:', analysis);
}

// Run tests
testNewsAPI();
testAIAnalysis();
```

---

## 10. Deployment Checklist

- [ ] All API keys in environment variables
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Caching implemented
- [ ] Analytics tracking added
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place

---

## Need Help?

For specific implementation questions:
1. Check the main README.md
2. Review API documentation for your chosen services
3. Test with small data sets first
4. Monitor API usage and costs closely

Good luck with your integration! 🚀
