import { Language } from '../App';
import { scrapeArticleContent } from './webScraper';

/**
 * Groq API Integration for Fast AI Summaries
 * Model: llama-3.3-70b-versatile (fast and cost-effective)
 * 
 * SETUP: Get free API key from https://console.groq.com
 */

const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_1_HERE',
  import.meta.env.VITE_GROQ_API_KEY_2 || 'YOUR_GROQ_API_KEY_2_HERE',
  import.meta.env.VITE_GROQ_API_KEY_3 || 'YOUR_GROQ_API_KEY_3_HERE'
];

let currentKeyIndex = 0;
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 3000;

interface GroqSummaryResult {
  summary: string;
  keyTakeaways: string[];
  source: 'groq' | 'fallback';
}

/**
 * Wait for rate limit delay
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Get current API key with rotation on rate limit
 */
function getCurrentApiKey(): string {
  return GROQ_API_KEYS[currentKeyIndex];
}

/**
 * Rotate to next API key
 */
function rotateApiKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  console.log(`Rotated to API key ${currentKeyIndex + 1}`);
}

/**
 * Generate summary and key takeaways using Groq with full article content
 */
export async function generateLightweightSummary(
  title: string,
  content: string,
  description: string,
  language: Language,
  articleUrl?: string
): Promise<GroqSummaryResult> {
  // Check if API keys are configured
  if (GROQ_API_KEYS[0] === 'YOUR_GROQ_API_KEY_1_HERE') {
    console.warn('Groq API not configured, using fallback');
    return createFallbackSummary(description, content, language);
  }

  try {
    // Try to get full article content if URL is provided
    let fullContent = content || description || '';
    
    if (articleUrl && articleUrl.startsWith('http')) {
      console.log('🌐 Fetching full article content...');
      const scrapedResult = await scrapeArticleContent(articleUrl);
      
      if (scrapedResult.success && scrapedResult.content && scrapedResult.content.length > fullContent.length) {
        fullContent = scrapedResult.content;
        console.log(`✅ Using scraped content (${fullContent.length} chars) instead of RSS (${content?.length || 0} chars)`);
      } else {
        console.log('⚠️ Scraping failed or insufficient, using RSS content');
      }
    }

    // Ensure we have content to analyze
    if (!fullContent || fullContent.length < 10) {
      console.warn('No content available for analysis');
      return createFallbackSummary(title, title, language);
    }

    // Wait for rate limit
    await waitForRateLimit();

    const languagePrompt = getLanguagePrompt(language);
    const prompt = createSummaryPrompt(title, fullContent, description, languagePrompt);

    const response = await fetchWithKeyRotation(prompt, languagePrompt);
    
    return parseGroqResponse(response);
  } catch (error) {
    console.error('Groq API error:', error);
    return createFallbackSummary(description || content || title, content || title, language);
  }
}

/**
 * Fetch from Groq with automatic key rotation on rate limit
 */
async function fetchWithKeyRotation(prompt: string, languagePrompt: string): Promise<string> {
  const validKeys = GROQ_API_KEYS.filter(key => 
    key && key !== 'YOUR_GROQ_API_KEY_1_HERE' && key !== 'YOUR_GROQ_API_KEY_2_HERE' && key !== 'YOUR_GROQ_API_KEY_3_HERE'
  );
  
  if (validKeys.length === 0) {
    throw new Error('No valid Groq API keys configured');
  }

  for (let attempt = 0; attempt < validKeys.length; attempt++) {
    try {
      const apiKey = getCurrentApiKey();
      
      // Skip invalid keys
      if (!apiKey || apiKey.startsWith('YOUR_GROQ')) {
        rotateApiKey();
        continue;
      }
      
      const keyPreview = `...${apiKey.slice(-4)}`;
      console.log(`🤖 Using GROQ API Key ${currentKeyIndex + 1}/3 (${keyPreview})`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a concise news summarizer. ${languagePrompt}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 500,
          top_p: 1
        })
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ Key ${currentKeyIndex + 1} rate limited, rotating...`);
        rotateApiKey();
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`❌ Key ${currentKeyIndex + 1} failed:`, error);
      rotateApiKey();
      if (attempt < validKeys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  throw new Error('All API keys exhausted');
}

/**
 * Get language-specific prompt
 */
function getLanguagePrompt(language: Language): string {
  const languageMap: Record<Language, string> = {
    en: 'Write ALL analysis in English.',
    hi: 'Write ALL analysis in Hindi (हिंदी) - proper Hindi script only, no transliteration.',
    ta: 'Write ALL analysis in Tamil (தமிழ்) - proper Tamil script only, no transliteration.',
    bn: 'Write ALL analysis in Bengali (বাংলা) - proper Bengali script only, no transliteration.',
    te: 'Write ALL analysis in Telugu (తెలుగు) - proper Telugu script only, no transliteration.',
    mr: 'Write ALL analysis in Marathi (मराठी) - proper Marathi script only, no transliteration.',
    gu: 'Write ALL analysis in Gujarati (ગુજરાતી) - proper Gujarati script only, no transliteration.',
    kn: 'Write ALL analysis in Kannada (ಕನ್ನಡ) - proper Kannada script only, no transliteration.',
    ml: 'Write ALL analysis in Malayalam (മലയാളം) - proper Malayalam script only, no transliteration.',
    pa: 'Write ALL analysis in Punjabi (ਪੰਜਾਬੀ) - proper Punjabi script only, no transliteration.',
    ur: 'Write ALL analysis in Urdu (اردو) - proper Urdu script only, no transliteration.'
  };
  return languageMap[language] || languageMap.en;
}

/**
 * Create summary prompt
 */
function createSummaryPrompt(
  title: string,
  content: string,
  description: string,
  languagePrompt: string
): string {
  const text = content && content.length > 500 ? content : (description || content);
  
  return `${languagePrompt}

Analyze this news article. Extract ONLY facts from the content.

Title: ${title}
Content: ${text.substring(0, 6000)}

RULES:
- Summary: 3-4 sentences with specific names, dates, numbers, organizations, agreements
- NO generic statements
- Extract concrete facts only
- Do NOT add outside knowledge

Return ONLY valid JSON:
{"summary":"3-4 detailed sentences with specific facts","keyTakeaways":["specific fact 1","specific fact 2","specific fact 3"]}`;
}

/**
 * Parse Groq response
 */
function parseGroqResponse(response: string): GroqSummaryResult {
  try {
    // Remove HTML entities
    let cleaned = response
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Auto-complete truncated JSON
    // Count quotes to close unterminated strings
    const quoteCount = (cleaned.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      cleaned += '"';
    }
    
    // Close unterminated arrays
    const openBrackets = (cleaned.match(/\[/g) || []).length;
    const closeBrackets = (cleaned.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      cleaned += ']'.repeat(openBrackets - closeBrackets);
    }
    
    // Close unterminated objects
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      cleaned += '}'.repeat(openBraces - closeBraces);
    }
    
    // Remove trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    
    // Try to parse
    const parsed = JSON.parse(cleaned);
    if (parsed.summary && parsed.keyTakeaways) {
      return {
        summary: (parsed.summary || '').trim(),
        keyTakeaways: Array.isArray(parsed.keyTakeaways) 
          ? parsed.keyTakeaways.slice(0, 3).filter((t: string) => t && t.trim())
          : [],
        source: 'groq'
      };
    }
  } catch (error) {
    console.error('JSON parse failed, trying fallback extraction:', error);
  }

  // Fallback parsing - extract text content
  const lines = response.split('\n').filter(line => line.trim());
  
  // Find summary (longest non-bullet line)
  const summaryLine = lines
    .filter(line => !line.startsWith('-') && !line.startsWith('•') && line.length > 20)
    .sort((a, b) => b.length - a.length)[0] || '';
  
  // Find takeaways (bullet points)
  const takeaways = lines
    .filter(line => line.startsWith('-') || line.startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 3);

  return {
    summary: summaryLine.trim() || response.substring(0, 300) || 'Summary not available',
    keyTakeaways: takeaways.length > 0 ? takeaways : [],
    source: 'groq'
  };
}

/**
 * Create fallback summary from description or content
 */
function createFallbackSummary(
  description: string,
  content: string,
  language: Language
): GroqSummaryResult {
  const text = description || content;
  
  // Extract first 3-4 sentences as summary
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const summary = sentences.slice(0, 4).join(' ');

  // Generate basic key takeaways
  const keyTakeaways = [
    getTranslation('Important for current affairs', language),
    getTranslation('Relevant for competitive exams', language),
    getTranslation('Key development in the sector', language)
  ];

  return {
    summary: summary || text.substring(0, 500),
    keyTakeaways,
    source: 'fallback'
  };
}

/**
 * Simple translation helper
 */
function getTranslation(text: string, language: Language): string {
  const translations: Record<string, Record<Language, string>> = {
    'Important for current affairs': {
      en: 'Important for current affairs',
      hi: 'करंट अफेयर्स के लिए महत्वपूर्ण',
      ta: 'நடப்பு விவகாரங்களுக்கு முக்கியம்',
      bn: 'কারেন্ট অ্যাফেয়ার্সের জন্য গুরুত্বপূর্ণ',
      te: 'కరెంట్ అఫైర్స్ కోసం ముఖ్యమైనది',
      mr: 'चालू घडामोडींसाठी महत्त्वाचे',
      gu: 'વર્તમાન બાબતો માટે મહત્વપૂર્ણ',
      kn: 'ಕರೆಂಟ್ ಅಫೇರ್ಸ್ ಗೆ ಮುಖ್ಯ',
      ml: 'കറന്റ് അഫയേഴ്സിന് പ്രധാനം',
      pa: 'ਕਰੰਟ ਅਫੇਅਰਜ਼ ਲਈ ਮਹੱਤਵਪੂਰਨ',
      ur: 'کرنٹ افیئرز کے لیے اہم'
    },
    'Relevant for competitive exams': {
      en: 'Relevant for competitive exams',
      hi: 'प्रतियोगी परीक्षाओं के लिए प्रासंगिक',
      ta: 'போட்டித் தேர்வுகளுக்கு பொருத்தமானது',
      bn: 'প্রতিযোগিতামূলক পরীক্ষার জন্য প্রাসঙ্গিক',
      te: 'పోటీ పరీక్షలకు సంబంధించినది',
      mr: 'स्पर्धा परीक्षांसाठी संबंधित',
      gu: 'સ્પર્ધાત્મક પરીક્ષાઓ માટે સંબંધિત',
      kn: 'ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗೆ ಸಂಬಂಧಿತ',
      ml: 'മത്സര പരീക്ഷകൾക്ക് പ്രസക്തം',
      pa: 'ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਲਈ ਸੰਬੰਧਿਤ',
      ur: 'مسابقتی امتحانات کے لیے متعلقہ'
    },
    'Key development in the sector': {
      en: 'Key development in the sector',
      hi: 'क्षेत्र में प्रमुख विकास',
      ta: 'துறையில் முக்கிய வளர்ச்சி',
      bn: 'সেক্টরে প্রধান উন্নয়ন',
      te: 'రంగంలో కీలక అభివృద్ధి',
      mr: 'क्षेत्रात प्रमुख विकास',
      gu: 'ક્ષેત્રમાં મુખ્ય વિકાસ',
      kn: 'ವಲಯದಲ್ಲಿ ಪ್ರಮುಖ ಅಭಿವೃದ್ಧಿ',
      ml: 'മേഖലയിൽ പ്രധാന വികസനം',
      pa: 'ਸੈਕਟਰ ਵਿੱਚ ਮੁੱਖ ਵਿਕਾਸ',
      ur: 'شعبے میں اہم ترقی'
    }
  };

  return translations[text]?.[language] || text;
}

/**
 * Get rate limit status for UI display
 */
export function getRateLimitStatus(): {
  isWaiting: boolean;
  remainingTime: number;
} {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const isWaiting = timeSinceLastRequest < RATE_LIMIT_DELAY;
  const remainingTime = isWaiting ? RATE_LIMIT_DELAY - timeSinceLastRequest : 0;
  
  return { isWaiting, remainingTime };
}
