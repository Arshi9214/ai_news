import { ArticleAnalysis, AnalysisDepth, Language, Topic } from '../App';

/**
 * AI-powered content analysis using OpenAI or Groq APIs
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get an API key from https://platform.openai.com or https://console.groq.com
 * 2. Replace placeholder keys with your actual keys
 * 3. For production, use environment variables
 */

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

/**
 * Analyzes content using AI for accurate insights
 */
export async function analyzeContentWithAI(prompt: AnalysisPrompt): Promise<ArticleAnalysis> {
  const systemPrompt = createSystemPrompt(prompt.depth, prompt.context);
  const userPrompt = createUserPrompt(prompt.content, prompt.language);
  
  // Try Groq first with key rotation
  for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
    const groqKey = GROQ_API_KEYS[currentGroqKeyIndex];
    if (groqKey !== 'YOUR_GROQ_API_KEY_HERE') {
      try {
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
            temperature: 0.7,
            max_tokens: prompt.depth === 'advanced' ? 2000 : 1000
          })
        });
        
        if (response.status === 429) {
          console.warn(`Groq key ${currentGroqKeyIndex + 1} rate limited, rotating...`);
          currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return parseAIResponse(content);
          }
        }
      } catch (error) {
        console.warn(`Groq attempt ${attempt + 1} failed:`, error);
        currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
      }
    }
  }
  
  // Fallback to OpenAI
  if (OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
    try {
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
          temperature: 0.7,
          max_tokens: prompt.depth === 'advanced' ? 2000 : 1000
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return parseAIResponse(data.choices[0].message.content);
      }
    } catch (error) {
      console.warn('OpenAI failed, using rule-based analysis:', error);
    }
  }
  
  // Final fallback to rule-based
  return analyzeContentRuleBased(prompt);
}

/**
 * Creates system prompt for AI analysis
 */
function createSystemPrompt(depth: AnalysisDepth, context: 'news' | 'pdf'): string {
  const basePrompt = `You are an expert analyst specializing in competitive exam preparation, particularly for civil services examinations. Your task is to analyze ${context === 'news' ? 'news articles' : 'documents'} and provide structured insights.`;
  
  if (depth === 'advanced') {
    return `${basePrompt}

Provide comprehensive analysis with:
- Detailed summary highlighting key developments and implications
- 6-8 key takeaways with actionable insights
- Exam relevance across multiple papers (Prelims, Mains, Interview)
- Important facts with specific data, statistics, and dates
- 4-5 potential exam questions with varying difficulty levels
- Policy implications and multi-stakeholder perspectives
- Sentiment analysis and related topics

Format your response as JSON with this structure:
{
  "summary": "detailed summary",
  "keyTakeaways": ["point 1", "point 2", ...],
  "examRelevance": "detailed relevance",
  "importantFacts": ["fact 1", "fact 2", ...],
  "potentialQuestions": ["question 1", "question 2", ...],
  "policyImplications": ["implication 1", "implication 2", ...],
  "sentiment": "positive|neutral|negative",
  "relatedTopics": ["topic1", "topic2", ...]
}`;
  } else {
    return `${basePrompt}

Provide concise analysis with:
- Brief summary of main points
- 3-4 key takeaways
- Basic exam relevance
- Important facts and data points
- 2-3 potential exam questions

Format your response as JSON with the structure provided.`;
  }
}

/**
 * Creates user prompt with content
 */
function createUserPrompt(content: string, language: Language): string {
  const langName = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    bn: 'Bengali',
    te: 'Telugu',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi',
    ur: 'Urdu'
  }[language];
  
  return `Analyze the following content for competitive exam preparation. Provide insights in ${langName}.

Content:
${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}

Provide structured analysis in JSON format.`;
}

/**
 * Parses AI response into structured format
 */
function parseAIResponse(response: string): ArticleAnalysis {
  try {
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonStr = response;
    
    // Remove markdown code blocks if present
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Handle both camelCase and snake_case field names
      const importantFacts = parsed.importantFacts || 
        (parsed.important_facts_and_data_points ? 
          Object.values(parsed.important_facts_and_data_points).map(String) : 
          []);
      
      return {
        summary: parsed.summary || parsed.brief_summary || '',
        keyTakeaways: parsed.keyTakeaways || parsed.key_takeaways || [],
        examRelevance: parsed.examRelevance || parsed.exam_relevance || '',
        importantFacts,
        potentialQuestions: parsed.potentialQuestions || parsed.potential_exam_questions || [],
        relatedTopics: parsed.relatedTopics || parsed.related_topics || [],
        sentiment: parsed.sentiment || 'neutral',
        policyImplications: parsed.policyImplications || parsed.policy_implications
      };
    }
  } catch (error) {
    console.error('Error parsing AI response:', error, 'Response:', response);
  }
  
  // Fallback: return basic analysis
  console.warn('Failed to parse AI response, returning fallback');
  return {
    summary: response.substring(0, 200) || 'Analysis completed. Review the content for key insights.',
    keyTakeaways: ['Key information extracted from content', 'Relevant for exam preparation', 'Review full content for details'],
    examRelevance: 'Relevant for competitive exam preparation.',
    importantFacts: ['See content for specific facts and data'],
    potentialQuestions: ['What are the key points discussed?', 'How is this relevant to current affairs?'],
    relatedTopics: [],
    sentiment: 'neutral'
  };
}

/**
 * Enhanced rule-based analysis (fallback when AI is not available)
 */
function analyzeContentRuleBased(prompt: AnalysisPrompt): ArticleAnalysis {
  const { content, depth } = prompt;
  
  // Extract statistics and numbers
  const numbers = content.match(/\d+(?:\.\d+)?%?/g) || [];
  const hasData = numbers.length > 0;
  
  // Extract potential dates
  const dates = content.match(/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  
  // Word frequency for topic detection
  const words = content.toLowerCase().split(/\s+/);
  const keywordCounts = countKeywords(words);
  
  // Detect sentiment
  const sentiment = detectSentiment(content);
  
  // Detect topics
  const topics = detectTopics(keywordCounts);
  
  const isAdvanced = depth === 'advanced';
  
  // Generate analysis based on detected patterns
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

/**
 * Counts keywords for topic detection
 */
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

/**
 * Detects sentiment from content
 */
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

/**
 * Detects topics from keyword frequencies
 */
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
  
  // Return top 2-3 topics
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
  
  // Extract sentences with numbers or specific terms
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
