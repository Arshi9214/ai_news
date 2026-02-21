import { Language } from '../App';

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
 * Generate summary and key takeaways using Groq
 */
export async function generateLightweightSummary(
  title: string,
  content: string,
  description: string,
  language: Language
): Promise<GroqSummaryResult> {
  // Check if API keys are configured
  if (GROQ_API_KEYS[0] === 'YOUR_GROQ_API_KEY_1_HERE') {
    console.warn('Groq API not configured, using fallback');
    return createFallbackSummary(description, content, language);
  }

  try {
    // Wait for rate limit
    await waitForRateLimit();

    const languagePrompt = getLanguagePrompt(language);
    const prompt = createSummaryPrompt(title, content, description, languagePrompt);

    const response = await fetchWithKeyRotation(prompt, languagePrompt);
    
    return parseGroqResponse(response);
  } catch (error) {
    console.error('Groq API error:', error);
    return createFallbackSummary(description, content, language);
  }
}

/**
 * Fetch from Groq with automatic key rotation on rate limit
 */
async function fetchWithKeyRotation(prompt: string, languagePrompt: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = GROQ_API_KEYS.length;

  while (attempts < maxAttempts) {
    try {
      const apiKey = getCurrentApiKey();
      console.log(`Using API key ${currentKeyIndex + 1}: ${apiKey.substring(0, 20)}...`);
      
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
          max_tokens: 400,
          top_p: 1
        })
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Rate limit hit:', errorData);
        rotateApiKey();
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      rotateApiKey();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('All API keys exhausted');
}

/**
 * Get language-specific prompt
 */
function getLanguagePrompt(language: Language): string {
  const languageMap: Record<Language, string> = {
    en: 'You MUST respond ONLY in English.',
    hi: 'You MUST respond ONLY in Hindi.',
    ta: 'You MUST respond ONLY in Tamil.',
    bn: 'You MUST respond ONLY in Bengali.',
    te: 'You MUST respond ONLY in Telugu.',
    mr: 'You MUST respond ONLY in Marathi.',
    gu: 'You MUST respond ONLY in Gujarati.',
    kn: 'You MUST respond ONLY in Kannada.',
    ml: 'You MUST respond ONLY in Malayalam.',
    pa: 'You MUST respond ONLY in Punjabi.',
    ur: 'You MUST respond ONLY in Urdu.'
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
  const text = description || content.substring(0, 2000);
  
  return `${languagePrompt}

Summarize this news for exam prep.

Title: ${title}
Content: ${text}

Return ONLY valid JSON (no extra text):
{"summary":"3-4 complete sentences covering all key points","keyTakeaways":["point 1","point 2","point 3"]}`;
}

/**
 * Parse Groq response
 */
function parseGroqResponse(response: string): GroqSummaryResult {
  try {
    // Clean response - remove control characters
    let cleaned = response.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Try to extract JSON
    const jsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: (parsed.summary || '').trim(),
        keyTakeaways: (parsed.keyTakeaways || []).slice(0, 3).filter((t: string) => t && t.trim()),
        source: 'groq'
      };
    }
  } catch (error) {
    console.error('Error parsing Groq response:', error);
  }

  // Fallback parsing
  const lines = response.split('\n').filter(line => line.trim());
  const summary = lines.find(line => !line.startsWith('-') && !line.startsWith('•') && line.length > 20) || '';
  const takeaways = lines
    .filter(line => line.startsWith('-') || line.startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 3);

  return {
    summary: summary.trim() || 'Summary not available',
    keyTakeaways: takeaways.length > 0 ? takeaways : ['Key information available', 'Relevant for current affairs', 'Important for exam preparation'],
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
