import { NewsArticle, Topic, AnalysisDepth, Language, ArticleAnalysis } from '../App';

// Mock news sources and topics for generating realistic data
const NEWS_SOURCES = ['The Hindu', 'PIB India', 'BBC', 'Reuters', 'Economic Times', 'Indian Express'];

const SAMPLE_TITLES: Record<Topic, string[]> = {
  all: [],
  economy: [
    'India\'s GDP Growth Projected at 6.8% for FY 2025-26',
    'RBI Announces New Monetary Policy Framework',
    'Digital Payment Transactions Cross ₹15 Lakh Crore Mark',
    'Government Unveils National Infrastructure Pipeline',
    'Foreign Direct Investment Reaches Record High'
  ],
  polity: [
    'Parliament Passes Historic Constitutional Amendment',
    'Supreme Court Ruling on Fundamental Rights Interpretation',
    'Election Commission Introduces New Voting Reforms',
    'Centre-State Relations: New Cooperative Federalism Framework',
    'Digital Governance Initiative: e-Government 2.0'
  ],
  environment: [
    'India Commits to Net Zero Emissions by 2070',
    'National Green Hydrogen Mission Launched',
    'Forest Cover Increases by 2.89% Across India',
    'Renewable Energy Capacity Crosses 150 GW Milestone',
    'Wildlife Conservation: Tiger Population Shows Significant Growth'
  ],
  international: [
    'India-US Strategic Partnership: Defense Cooperation Enhanced',
    'BRICS Summit: New Economic Framework Proposed',
    'India Elected to UN Security Council Non-Permanent Seat',
    'Indo-Pacific Strategy: Quad Nations Meet',
    'India-Africa Relations: Development Partnership Strengthened'
  ],
  science: [
    'ISRO Successfully Launches Advanced Earth Observation Satellite',
    'India Develops Indigenous 5G Technology',
    'Quantum Computing Research: IIT Makes Breakthrough',
    'National AI Mission: ₹10,000 Crore Investment Announced',
    'COVID-19: India Develops New Vaccine Variant'
  ],
  society: [
    'National Education Policy: Implementation Progress Review',
    'Women Workforce Participation Reaches 35%',
    'Digital Literacy Campaign: 500 Million Reached',
    'Health Insurance Coverage Expands to Rural Areas',
    'Skill Development Initiative: 10 Million Trained'
  ],
  history: [
    'Archaeological Discovery: Harappan Site Unearthed',
    'Indian Independence Movement Archives Digitized',
    'Heritage Conservation: 50 New Sites Protected',
    'Ancient Maritime History: New Research Findings',
    'Cultural Heritage: UNESCO Recognition for Indian Traditions'
  ],
  geography: [
    'Himalayan Glaciers: New Climate Impact Study Released',
    'Coastal Zone Management: New Framework Implemented',
    'River Interlinking Project: Phase 2 Begins',
    'Urban Planning: Smart Cities Mission Update',
    'Biodiversity Hotspots: Conservation Efforts Intensified'
  ]
};

const SAMPLE_CONTENT: Record<Topic, string[]> = {
  all: [],
  economy: [
    'The Ministry of Finance has released comprehensive economic indicators showing robust growth in key sectors. The GDP growth rate is expected to be sustained through increased manufacturing output and service sector expansion. Analysts predict that continued fiscal reforms and infrastructure investment will drive economic momentum.',
    'The Reserve Bank of India\'s monetary policy committee has adopted a cautious approach to balance growth and inflation. With retail inflation at 5.2%, the central bank maintains a vigilant stance on price stability while supporting economic recovery through appropriate liquidity measures.',
  ],
  polity: [
    'The constitutional amendment aims to strengthen federal governance structures and enhance the efficiency of administrative mechanisms. Legal experts highlight the significance of this legislation in addressing contemporary governance challenges while maintaining the basic structure doctrine.',
    'The Supreme Court\'s landmark judgment reaffirms the importance of fundamental rights in the constitutional framework. The verdict has far-reaching implications for future legislation and executive actions, establishing important precedents for rights protection.',
  ],
  environment: [
    'India\'s commitment to climate action has been reinforced through ambitious renewable energy targets and sustainable development initiatives. The comprehensive strategy encompasses solar, wind, and hydroelectric power expansion, alongside significant investments in green hydrogen technology.',
    'Conservation efforts have yielded positive results with forest cover showing measurable increases across multiple states. The integrated approach combines afforestation programs with community participation and technology-enabled monitoring systems.',
  ],
  international: [
    'The strategic partnership between India and partner nations continues to deepen across defense, technology, and economic cooperation. Recent agreements focus on supply chain resilience, maritime security, and counter-terrorism collaboration.',
    'India\'s engagement with multilateral organizations reflects its growing global influence and commitment to rules-based international order. The nation\'s diplomatic initiatives emphasize South-South cooperation and developing nation interests.',
  ],
  science: [
    'The space mission represents a significant technological achievement, demonstrating indigenous capabilities in satellite technology and launch systems. The mission\'s objectives include earth observation, climate monitoring, and strategic applications.',
    'Research and development in emerging technologies continues to receive substantial government support, with focus on artificial intelligence, quantum computing, and biotechnology. These investments aim to position India as a global technology leader.',
  ],
  society: [
    'Educational reforms emphasize holistic development, critical thinking, and skill-based learning. The implementation strategy includes curriculum modernization, teacher training, and infrastructure development across all educational levels.',
    'Social welfare programs have expanded coverage to underserved populations, addressing healthcare, nutrition, and economic security. Data-driven targeting and digital delivery mechanisms have improved program effectiveness.',
  ],
  history: [
    'The archaeological findings provide valuable insights into ancient civilizations and cultural practices. Advanced dating techniques and interdisciplinary research methods have enabled more accurate historical reconstruction.',
    'Preservation of historical records through digitization ensures accessibility for researchers and the public. The initiative combines conservation science with information technology to protect cultural heritage.',
  ],
  geography: [
    'Climate change impacts on geographical features require comprehensive adaptation strategies. Research focuses on glacier dynamics, water resources, and ecosystem resilience in vulnerable regions.',
    'Urban geography transformation through planned development addresses challenges of rapid urbanization. Sustainable city planning integrates environmental considerations with economic growth objectives.',
  ]
};

export function generateMockArticles(count: number, topics: Topic[], language: Language): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const activeTopics = topics.includes('all') 
    ? (['economy', 'polity', 'environment', 'international', 'science', 'society', 'history', 'geography'] as Topic[])
    : topics;

  for (let i = 0; i < count; i++) {
    const topic = activeTopics[Math.floor(Math.random() * activeTopics.length)];
    const titles = SAMPLE_TITLES[topic];
    const contents = SAMPLE_CONTENT[topic];
    
    const title = titles[Math.floor(Math.random() * titles.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    
    // Generate date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    articles.push({
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      source: NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)],
      date,
      topics: [topic],
      language,
      url: `https://example.com/article/${i}`,
      bookmarked: false
    });
  }

  return articles;
}

export function analyzeArticle(article: NewsArticle, depth: AnalysisDepth, language: Language): ArticleAnalysis {
  const isBasic = depth === 'basic';
  
  // Generate analysis based on depth
  const analysis: ArticleAnalysis = {
    summary: isBasic
      ? `This article discusses ${article.topics[0]} developments with significant implications for UPSC preparation. Key aspects include policy changes, statistical data, and their relevance to current affairs.`
      : `This comprehensive article examines ${article.topics[0]} in the context of India's development trajectory. The analysis reveals multiple dimensions including policy frameworks, implementation challenges, stakeholder perspectives, and comparative international experiences. The content is particularly relevant for General Studies Papers covering governance, economy, and current affairs.`,
    
    keyTakeaways: isBasic
      ? [
          `Important development in ${article.topics[0]} sector`,
          'Relevant statistics and data points for exam preparation',
          'Policy implications for governance and administration'
        ]
      : [
          `Comprehensive policy framework addressing ${article.topics[0]} challenges`,
          'Statistical evidence supporting developmental trends and outcomes',
          'Multi-stakeholder approach involving government, private sector, and civil society',
          'International best practices and comparative analysis',
          'Long-term implications for sustainable development goals',
          'Integration with existing policy frameworks and schemes'
        ],
    
    examRelevance: isBasic
      ? `Directly relevant for GS Paper covering ${article.topics[0]}. Important for prelims and mains preparation.`
      : `Highly relevant for UPSC CSE preparation across multiple papers. For Prelims: Current Affairs, ${article.topics[0]} facts and figures. For Mains: GS Paper discussion on policy analysis, governance challenges, and developmental issues. For Interview: Demonstrates understanding of contemporary issues and analytical thinking. Can be linked to topics like sustainable development, good governance, and India's strategic priorities.`,
    
    relatedTopics: article.topics,
    
    importantFacts: isBasic
      ? [
          'Key numerical data and statistics',
          'Important dates and timelines',
          'Names of key institutions and officials'
        ]
      : [
          'Specific percentage growth/decline figures with year-on-year comparison',
          'Budget allocations and financial commitments',
          'Timeline of policy implementation phases',
          'Names of committees, schemes, and initiatives',
          'Constitutional provisions and legal frameworks referenced',
          'International agreements and cooperation frameworks'
        ],
    
    potentialQuestions: isBasic
      ? [
          `What are the main features of recent developments in ${article.topics[0]}?`,
          `Explain the significance of this policy initiative.`
        ]
      : [
          `Critically analyze the impact of recent ${article.topics[0]} policies on India's development goals. (250 words)`,
          `Discuss the challenges in implementing ${article.topics[0]} reforms and suggest measures for improvement. (150 words)`,
          `Compare India's approach to ${article.topics[0]} with international best practices. What lessons can be learned? (200 words)`,
          `Examine the role of various stakeholders in achieving ${article.topics[0]} objectives. (150 words)`
        ],
    
    sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
    
    policyImplications: isBasic ? undefined : [
      `Requires coordination between central and state governments for effective implementation`,
      `Necessitates adequate budgetary allocation and resource mobilization`,
      `Demands capacity building of implementing agencies and personnel`,
      `Calls for robust monitoring and evaluation mechanisms`,
      `Requires public awareness and stakeholder engagement strategies`
    ]
  };

  return analysis;
}

export function analyzePDFContent(content: string, depth: AnalysisDepth, language: Language): ArticleAnalysis {
  const isBasic = depth === 'basic';
  
  const analysis: ArticleAnalysis = {
    summary: isBasic
      ? 'This document contains important information relevant for competitive exam preparation. It covers key concepts, facts, and analytical perspectives useful for building subject knowledge.'
      : 'This comprehensive document provides in-depth analysis of important topics with detailed explanations, case studies, and data-driven insights. The content is structured to enhance conceptual understanding and analytical capabilities required for competitive examinations. It includes theoretical frameworks, practical applications, and contemporary relevance.',
    
    keyTakeaways: isBasic
      ? [
          'Core concepts and definitions explained',
          'Important facts and data points highlighted',
          'Relevant for multiple exam papers',
          'Useful reference material for revision'
        ]
      : [
          'Comprehensive theoretical framework with practical applications',
          'Evidence-based analysis with statistical support',
          'Multiple perspectives on complex issues',
          'Case studies demonstrating real-world implementation',
          'Connections to current affairs and policy developments',
          'Cross-cutting themes linking multiple subjects',
          'Critical analysis and evaluation frameworks'
        ],
    
    examRelevance: isBasic
      ? 'Useful for building foundational knowledge across GS papers. Contains relevant facts and concepts for both prelims and mains preparation.'
      : 'Highly valuable for comprehensive UPSC preparation. Prelims: Factual information, data, and definitions. Mains: Analytical frameworks, case studies, and diverse perspectives for answer writing. Interview: Demonstrates depth of knowledge and ability to connect concepts. The document covers multiple dimensions of topics making it useful for integrated learning across subjects.',
    
    relatedTopics: ['polity', 'economy', 'society', 'environment'] as Topic[],
    
    importantFacts: isBasic
      ? [
          'Key definitions and terminology',
          'Important numerical data',
          'Significant dates and events',
          'Names of institutions and frameworks'
        ]
      : [
          'Precise statistical data with sources and context',
          'Historical evolution and chronological development',
          'Institutional mechanisms and organizational structures',
          'Legal provisions and regulatory frameworks',
          'Comparative data across regions/countries/time periods',
          'Research findings and expert opinions',
          'Case study outcomes and lessons learned'
        ],
    
    potentialQuestions: isBasic
      ? [
          'Define and explain the key concepts discussed in this document.',
          'What are the main arguments presented?',
          'Summarize the important facts and findings.'
        ]
      : [
          'Critically evaluate the main arguments presented in the document with suitable examples. (250 words)',
          'Analyze the policy implications of the issues discussed and suggest a way forward. (200 words)',
          'Compare and contrast different approaches to the problem identified. What are the pros and cons? (150 words)',
          'Discuss the relevance of this analysis in the contemporary Indian context. (250 words)',
          'Examine the challenges in implementation and suggest remedial measures. (150 words)'
        ],
    
    sentiment: 'neutral',
    
    policyImplications: isBasic ? undefined : [
      'Highlights need for evidence-based policy making',
      'Suggests multi-stakeholder consultation in decision making',
      'Emphasizes importance of impact assessment and evaluation',
      'Calls for adaptive implementation strategies',
      'Recommends strengthening institutional capacity'
    ]
  };

  return analysis;
}
