/// <reference types="vite/client" />
import { ArticleAnalysis, AnalysisDepth, Language, Topic } from '../App';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
const OPENAI_MODEL = 'gpt-4o-mini';
const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE',
  import.meta.env.VITE_GROQ_API_KEY_2 || 'YOUR_GROQ_API_KEY_2_HERE',
  import.meta.env.VITE_GROQ_API_KEY_3 || 'YOUR_GROQ_API_KEY_3_HERE'
];
const GROQ_MODEL = 'llama-3.3-70b-versatile';

let currentGroqKeyIndex = 0;

interface AnalysisPrompt {
  content: string;
  depth: AnalysisDepth;
  language: Language;
  context: 'news' | 'pdf';
}

export async function analyzeContentWithAI(prompt: AnalysisPrompt): Promise<ArticleAnalysis> {
  const depth = prompt.depth || 'advanced';
  console.log('🔍 Starting AI analysis...', { depth, language: prompt.language, contentLength: prompt.content.length });
  
  const analysisLanguage = prompt.language;
  const systemPrompt = createSystemPrompt(depth, prompt.context);
  const userPrompt = createUserPrompt(prompt.content, analysisLanguage);
  
  // Try Groq first with key rotation
  for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
    const groqKey = GROQ_API_KEYS[currentGroqKeyIndex];
    if (groqKey !== 'YOUR_GROQ_API_KEY_HERE' && !groqKey.startsWith('YOUR_GROQ')) {
      try {
        console.log(`🤖 Trying Groq API (key ${currentGroqKeyIndex + 1}, attempt ${attempt + 1})...`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: depth === 'advanced' ? 2000 : 1000
          })
        });
        
        if (response.status === 429) {
          console.warn(`⚠️ Groq key ${currentGroqKeyIndex + 1} rate limited, rotating...`);
          currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
          // Wait longer before trying next key to avoid burning through all keys
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          console.log('✅ Groq API response received, parsing...');
          if (content) {
            const result = parseAIResponse(content);
            if (result) {
              console.log('✅ Successfully parsed AI response');
              return result;
            }
            console.warn('⚠️ Failed to parse Groq response, trying next option...');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`❌ Groq API error:`, response.status, errorData);
        }
      } catch (error) {
        console.warn(`❌ Groq attempt ${attempt + 1} failed:`, error);
        currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
        // Wait before trying next key
        if (attempt < GROQ_API_KEYS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } else {
      // Skip invalid keys
      currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
    }
  }
  
  // Fallback to OpenAI
  if (OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
    try {
      console.log('🤖 Trying OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: depth === 'advanced' ? 3000 : 1500,
          response_format: { type: 'json_object' }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ OpenAI API response received, parsing...');
        const result = parseAIResponse(data.choices[0].message.content);
        if (result) {
          console.log('✅ Successfully parsed OpenAI response');
          return result;
        }
        console.warn('⚠️ Failed to parse OpenAI response');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('❌ OpenAI API error:', response.status, errorData);
      }
    } catch (error) {
      console.warn('❌ OpenAI failed:', error);
    }
  }
  
  // Final fallback to rule-based
  console.log('📊 Using rule-based analysis fallback...');
  const result = analyzeContentRuleBased(prompt);
  console.log('✅ Rule-based analysis complete:', result);
  return result;
}

function createSystemPrompt(depth: AnalysisDepth, context: 'news' | 'pdf'): string {
  return `You are an expert multilingual news and document analyst.

STRICT OUTPUT RULES — NEVER BREAK THESE:
1. Respond with RAW JSON only — no markdown, no backticks, no explanation
2. Start response with { and end with }
3. All JSON field names must be in English
4. JSON values must be in the language specified by the user prompt
5. Never transliterate Indian language words into English phonetics
6. Never hallucinate — only use facts present in the source text
7. If content is in Tamil/Hindi/any Indian language, read it fully before analyzing

${depth === 'advanced' ? `JSON structure:
{"summary":"2-3 sentences","keyTakeaways":["...x4"],"examRelevance":"...","importantFacts":["...x3"],"potentialQuestions":["...x2"],"policyImplications":["...x2"],"relatedTopics":["..."],"sentiment":"positive|neutral|negative"}` 
: 
`JSON structure:
{"summary":"2-3 sentences","keyTakeaways":["...x3"],"examRelevance":"...","importantFacts":["...x2"],"potentialQuestions":["...x2"],"relatedTopics":["..."],"sentiment":"positive|neutral|negative"}`}`;
}

function createUserPrompt(content: string, language: Language): string {
  const languageNames: Record<Language, string> = {
    en: 'English', hi: 'Hindi', ta: 'Tamil',
    bn: 'Bengali', te: 'Telugu', mr: 'Marathi',
    gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam',
    pa: 'Punjabi', ur: 'Urdu'
  };

  const targetLang = languageNames[language];
  const isIndian = language !== 'en';

  return `Analyze and write ALL JSON values in ${targetLang}.

${isIndian ? `- Write proper ${targetLang} script only
- Do NOT transliterate` : ''}

RULES:
- Summary: 2-3 sentences with names, dates, numbers
- Only facts from content
- Keep concise

CONTENT:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

RAW JSON only. Start with {`;
}

function parseAIResponse(response: string): ArticleAnalysis | null {
  try {
    console.log('📝 Parsing AI response, length:', response.length);
    let jsonStr = response.trim();
    
    // Decode HTML entities FIRST
    jsonStr = jsonStr
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'");
    
    // Remove markdown code blocks
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
      console.log('📝 Removed markdown code blocks');
    }
    
    // Extract JSON object - try multiple patterns
    let jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find incomplete JSON and complete it
      const incompleteMatch = jsonStr.match(/\{[\s\S]*/);
      if (incompleteMatch) {
        let incomplete = incompleteMatch[0];
        
        // Fix unterminated strings by adding closing quote
        const lastQuote = incomplete.lastIndexOf('"');
        const afterLastQuote = incomplete.substring(lastQuote + 1);
        if (lastQuote > 0 && !afterLastQuote.includes('"') && afterLastQuote.trim()) {
          incomplete = incomplete.substring(0, lastQuote + 1) + '"';
        }
        
        // Count and close open arrays
        const openBrackets = (incomplete.match(/\[/g) || []).length;
        const closeBrackets = (incomplete.match(/\]/g) || []).length;
        const missingBrackets = openBrackets - closeBrackets;
        if (missingBrackets > 0) {
          incomplete += ']'.repeat(missingBrackets);
        }
        
        // Count and close open braces
        const openBraces = (incomplete.match(/\{/g) || []).length;
        const closeBraces = (incomplete.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        if (missingBraces > 0) {
          jsonStr = incomplete + '}'.repeat(missingBraces);
          jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        }
      }
    }
    if (!jsonMatch) {
      console.error('❌ No JSON object found in response');
      console.log('Full response:', jsonStr);
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ JSON parsed successfully, keys:', Object.keys(parsed));
    
    if (!parsed.summary && !parsed.keyTakeaways) {
      console.error('❌ Missing required fields in JSON response');
      return null;
    }
    
    const hasContent = (
      (parsed.summary && parsed.summary.trim().length > 0) ||
      (Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0) ||
      (Array.isArray(parsed.importantFacts) && parsed.importantFacts.length > 0) ||
      (Array.isArray(parsed.potentialQuestions) && parsed.potentialQuestions.length > 0)
    );
    
    if (!hasContent) {
      console.error('❌ AI returned empty analysis - content may be unreadable');
      return null;
    }
    
    return {
      summary: String(parsed.summary || '').trim(),
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways.map(String) : [],
      examRelevance: String(parsed.examRelevance || ''),
      importantFacts: Array.isArray(parsed.importantFacts) ? parsed.importantFacts.map(String) : [],
      potentialQuestions: Array.isArray(parsed.potentialQuestions) ? parsed.potentialQuestions.map(String) : [],
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
      sentiment: parsed.sentiment || 'neutral',
      policyImplications: Array.isArray(parsed.policyImplications) ? parsed.policyImplications.map(String) : undefined
    };
  } catch (error) {
    console.error('❌ Error parsing AI response:', error);
    console.log('Full response:', response.substring(0, 1000));
    return null;
  }
}

function analyzeContentRuleBased(prompt: AnalysisPrompt): ArticleAnalysis {
  const { content, depth } = prompt;
  
  const numbers = content.match(/\d+(?:\.\d+)?%?/g) || [];
  const hasData = numbers.length > 0;
  const dates = content.match(/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  const words = content.toLowerCase().split(/\s+/);
  const keywordCounts = countKeywords(words);
  const sentiment = detectSentiment(content);
  const topics = detectTopics(keywordCounts);
  const isAdvanced = depth === 'advanced';
  
  const analysis: ArticleAnalysis = {
    summary: generateSummary(content, isAdvanced),
    keyTakeaways: isAdvanced
      ? generateAdvancedTakeaways(content, keywordCounts, hasData)
      : generateBasicTakeaways(content, keywordCounts),
    examRelevance: generateExamRelevance(topics, isAdvanced),
    importantFacts: generateFacts(content, numbers, dates, isAdvanced),
    potentialQuestions: generateQuestions(topics, isAdvanced),
    relatedTopics: topics,
    sentiment,
    policyImplications: isAdvanced ? generatePolicyImplications(topics) : undefined
  };
  
  return analysis;
}

function countKeywords(words: string[]): Record<string, number> {
  const keywords: Record<string, number> = {};
  const importantWords = words.filter(word => 
    word.length > 4 && 
    !['about', 'which', 'there', 'their', 'these', 'those', 'would', 'could', 'should'].includes(word)
  );
  importantWords.forEach(word => {
    keywords[word] = (keywords[word] || 0) + 1;
  });
  return keywords;
}

function detectSentiment(content: string): 'positive' | 'neutral' | 'negative' {
  const positive = ['growth', 'increase', 'improve', 'success', 'achieve', 'progress', 'benefit', 'positive', 'enhanced', 'strong'];
  const negative = ['decline', 'decrease', 'crisis', 'concern', 'challenge', 'problem', 'fail', 'negative', 'weak', 'poor'];
  const lowerContent = content.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  positive.forEach(word => {
    const matches = lowerContent.match(new RegExp(word, 'g'));
    if (matches) positiveCount += matches.length;
  });
  negative.forEach(word => {
    const matches = lowerContent.match(new RegExp(word, 'g'));
    if (matches) negativeCount += matches.length;
  });
  if (positiveCount > negativeCount * 1.5) return 'positive';
  if (negativeCount > positiveCount * 1.5) return 'negative';
  return 'neutral';
}

function detectTopics(keywordCounts: Record<string, number>): Topic[] {
  const topicKeywords: Record<Topic, string[]> = {
    economy: ['economy', 'gdp', 'inflation', 'growth', 'fiscal', 'monetary', 'trade', 'finance', 'market', 'investment'],
    polity: ['government', 'parliament', 'constitution', 'policy', 'legislation', 'election', 'democracy', 'judicial', 'executive'],
    environment: ['environment', 'climate', 'pollution', 'carbon', 'renewable', 'energy', 'conservation', 'biodiversity', 'forest'],
    international: ['international', 'global', 'foreign', 'diplomatic', 'treaty', 'bilateral', 'relations', 'geopolitical'],
    science: ['science', 'technology', 'research', 'innovation', 'space', 'satellite', 'digital', 'artificial', 'quantum'],
    society: ['education', 'health', 'social', 'welfare', 'poverty', 'literacy', 'unemployment', 'development', 'rural'],
    history: ['history', 'ancient', 'heritage', 'culture', 'archaeological', 'tradition', 'civilization', 'historical'],
    geography: ['geography', 'river', 'mountain', 'climate', 'mineral', 'agriculture', 'irrigation', 'drought', 'flood'],
    all: []
  };
  const scores: Record<Topic, number> = {
    economy: 0, polity: 0, environment: 0, international: 0,
    science: 0, society: 0, history: 0, geography: 0, all: 0
  };
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    keywords.forEach(keyword => {
      if (keywordCounts[keyword]) {
        scores[topic as Topic] += keywordCounts[keyword];
      }
    });
  });
  return Object.entries(scores)
    .filter(([topic, score]) => score > 0 && topic !== 'all')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic as Topic);
}

function generateSummary(content: string, isAdvanced: boolean): string {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const firstSentences = sentences.slice(0, isAdvanced ? 3 : 2).join(' ');
  return firstSentences.substring(0, isAdvanced ? 500 : 250);
}

function generateBasicTakeaways(content: string, keywords: Record<string, number>): string[] {
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
  return [
    `Key focus areas: ${topKeywords.join(', ')}`,
    'Contains important data and statistics for exam preparation',
    'Relevant for current affairs and contemporary issues'
  ];
}

function generateAdvancedTakeaways(content: string, keywords: Record<string, number>, hasData: boolean): string[] {
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
  return [
    `Primary themes: ${topKeywords.slice(0, 3).join(', ')}`,
    hasData ? 'Contains quantitative data and statistical evidence' : 'Provides qualitative analysis and insights',
    'Multi-dimensional perspective on contemporary issues',
    'Relevant for policy analysis and governance discussions',
    'Connects to broader developmental and strategic objectives',
    `Related concepts: ${topKeywords.slice(3, 6).join(', ')}`
  ];
}

function generateExamRelevance(topics: Topic[], isAdvanced: boolean): string {
  if (topics.length === 0) {
    return 'Relevant for general awareness and current affairs preparation.';
  }
  const topicNames = topics.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
  if (isAdvanced) {
    return `Highly relevant for competitive exam preparation. Topics covered: ${topicNames}. ` +
           'Useful for Prelims (current affairs, factual questions), Mains (analytical answers, essay writing), ' +
           'and Interview (demonstrating awareness and critical thinking). Can be linked to multiple GS papers ' +
           'and integrated with other topics for comprehensive understanding.';
  } else {
    return `Relevant for ${topicNames} sections. Important for both Prelims and Mains preparation.`;
  }
}

function generateFacts(content: string, numbers: string[], dates: string[], isAdvanced: boolean): string[] {
  const facts: string[] = [];
  if (numbers.length > 0) {
    facts.push(`Key statistics: ${numbers.slice(0, isAdvanced ? 5 : 3).join(', ')}`);
  }
  if (dates.length > 0) {
    facts.push(`Important dates: ${dates.slice(0, isAdvanced ? 3 : 2).join(', ')}`);
  }
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const factualSentences = sentences.filter(s => 
    /\d+/.test(s) || /announced|launched|implemented|established/i.test(s)
  );
  facts.push(...factualSentences.slice(0, isAdvanced ? 4 : 2));
  return facts.slice(0, isAdvanced ? 7 : 4);
}

function generateQuestions(topics: Topic[], isAdvanced: boolean): string[] {
  if (topics.length === 0) {
    return ['Discuss the significance of recent developments mentioned in the content.'];
  }
  const topic = topics[0];
  if (isAdvanced) {
    return [
      `Critically analyze the recent developments in ${topic}. What are the implications for India's development trajectory? (250 words)`,
      `Discuss the challenges and opportunities in the ${topic} sector. Suggest policy measures for improvement. (200 words)`,
      `Compare India's approach to ${topic} with international best practices. (150 words)`,
      `Examine the role of various stakeholders in addressing ${topic} issues. (150 words)`
    ];
  } else {
    return [
      `What are the key developments in ${topic}?`,
      `Explain the significance of recent ${topic} initiatives.`
    ];
  }
}

function generatePolicyImplications(topics: Topic[]): string[] {
  return [
    'Requires multi-stakeholder coordination and collaboration',
    'Necessitates adequate resource allocation and capacity building',
    'Demands robust monitoring and evaluation frameworks',
    'Calls for evidence-based policy making and adaptive implementation',
    'Requires public awareness and participatory governance approaches'
  ];
}
