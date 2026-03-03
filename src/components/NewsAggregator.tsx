import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Search, Download, Loader2, Clock, Plus, FileDown, ArrowUp } from 'lucide-react';
import { NewsArticle, Topic, AnalysisDepth, Language, ThemeMode } from '../App';
import { NewsCard } from './NewsCard';
import { fetchNewsWithFallback, getDateRange } from '../utils/multiNewsApi';
import { generateLightweightSummary } from '../utils/groqApi';
import { exportNewsToPDF } from '../utils/pdfExporter';
import { toast } from 'sonner';

interface NewsAggregatorProps {
  language: Language;
  selectedTopics: Topic[];
  analysisDepth: AnalysisDepth;
  onArticlesLoaded: (articles: NewsArticle[]) => void;
  articles: NewsArticle[];
  onToggleBookmark: (id: string) => void;
  onViewAnalysis: (article: NewsArticle) => void;
  themeMode?: ThemeMode;
}

const TRANSLATIONS = {
  en: {
    title: 'News Aggregator',
    subtitle: 'Latest current affairs from trusted sources',
    search: 'Search articles...',
    dateRange: 'Date Range',
    fetchNews: 'Fetch News',
    viewMore: 'View More Articles',
    export: 'Export Results',
    analyzing: 'Analyzing articles...',
    loading: 'Loading more...',
    noResults: 'No articles found. Try fetching news or adjusting your filters.',
    last24h: 'Last 24 Hours',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    custom: 'Custom Range',
    sources: 'Sources: The Hindu, PIB, BBC, and more'
  },
  hi: {
    title: 'समाचार एकत्रीकरण',
    subtitle: 'विश्वसनीय स्रोतों से नवीनतम करंट अफेयर्स',
    search: 'लेख खोजें...',
    dateRange: 'तिथि सीमा',
    fetchNews: 'समाचार प्राप्त करें',
    viewMore: 'अधिक लेख देखें',
    export: 'परिणाम निर्यात करें',
    analyzing: 'लेखों का विश्लेषण...',
    loading: 'और लोड हो रहा है...',
    noResults: 'कोई लेख नहीं मिला। समाचार प्राप्त करने या अपने फ़िल्टर समायोजित करने का प्रयास करें।',
    last24h: 'पिछले 24 घंटे',
    lastWeek: 'पिछले सप्ताह',
    lastMonth: 'पिछले महीने',
    custom: 'कस्टम रेंज',
    sources: 'स्रोत: द हिंदू, पीआईबी, बीबीसी, और अधिक'
  },
  ta: {
    title: 'செய்தி திரட்டி',
    subtitle: 'நம்பகமான ஆதாரங்களிலிருந்து சமீபத்திய நடப்பு விவகாரங்கள்',
    search: 'கட்டுரைகளைத் தேடுங்கள்...',
    dateRange: 'தேதி வரம்பு',
    fetchNews: 'செய்திகளைப் பெறுக',
    export: 'முடிவுகளை ஏற்றுமதி செய்',
    analyzing: 'கட்டுரைகளை பகுப்பாய்வு செய்கிறது...',
    noResults: 'கட்டுரைகள் எதுவும் கிடைக்கவில்லை. செய்திகளைப் பெற முயற்சிக்கவும் அல்லது உங்கள் வடிகட்டிகளை சரிசெய்யவும்.',
    last24h: 'கடந்த 24 மணிநேரம்',
    lastWeek: 'கடந்த வாரம்',
    lastMonth: 'கடந்த மாதம்',
    custom: 'தனிப்பயன் வரம்பு',
    sources: 'ஆதாரங்கள்: தி இந்து, PIB, BBC மற்றும் பல'
  },
  bn: {
    title: 'নিউজ এগ্রিগেটর',
    subtitle: 'বিশ্বস্ত উৎস থেকে সর্বশেষ কারেন্ট অ্যাফেয়ার্স',
    search: 'নিবন্ধ খুঁজুন...',
    dateRange: 'তারিখ পরিসীমা',
    fetchNews: 'খবর আনুন',
    export: 'ফলাফল রপ্তানি করুন',
    analyzing: 'নিবন্ধ বিশ্লেষণ করা হচ্ছে...',
    noResults: 'কোনো নিবন্ধ পাওয়া যায়নি। খবর আনতে বা আপনার ফিল্টার সামঞ্জস্য করার চেষ্টা করুন।',
    last24h: 'গত ২৪ ঘণ্টা',
    lastWeek: 'গত সপ্তাহ',
    lastMonth: 'গত মাস',
    custom: 'কাস্টম রেঞ্জ',
    sources: 'উৎস: দ্য হিন্দু, পিআইবি, বিবিসি এবং আরও'
  },
  te: {
    title: 'న్యూస్ అగ్రిగేటర్',
    subtitle: 'విశ్వసనీయ మూలాల నుండి తాజా కరెంట్ అఫైర్స్',
    search: 'కథనాలను వెతకండి...',
    dateRange: 'తేదీ పరిధి',
    fetchNews: 'వార్తలను పొందండి',
    export: 'ఫలితాలను ఎగుమతి చేయండి',
    analyzing: 'కథనాలను విశ్లేషిస్తోంది...',
    noResults: 'ఏ కథనాలు కనుగొనబడలేదు. వార్తలను పొందడానికి ప్రయత్నించండి లేదా మీ ఫిల్టర్‌లను సర్దుబాటు చేయండి.',
    last24h: 'గత 24 గంటలు',
    lastWeek: 'గత వారం',
    lastMonth: 'గత నెల',
    custom: 'అనుకూల పరిధి',
    sources: 'మూలాలు: ది హిందూ, PIB, BBC మరియు మరిన్ని'
  },
  mr: {
    title: 'बातम्या एकत्रीकरण',
    subtitle: 'विश्वसनीय स्रोतांकडून नवीनतम चालू घडामोडी',
    search: 'लेख शोधा...',
    dateRange: 'तारीख श्रेणी',
    fetchNews: 'बातम्या मिळवा',
    export: 'परिणाम निर्यात करा',
    analyzing: 'लेखांचे विश्लेषण करत आहे...',
    noResults: 'कोणतेही लेख सापडले नाहीत. बातम्या आणणे किंवा तुमचे फिल्टर समायोजित करण्याचा प्रयत्न करा.',
    last24h: 'शेवटचे 24 तास',
    lastWeek: 'गेला आठवडा',
    lastMonth: 'गेला महिना',
    custom: 'सानुकूल श्रेणी',
    sources: 'स्रोत: द हिंदू, पीआयबी, बीबीसी आणि अधिक'
  },
  gu: {
    title: 'સમાચાર એગ્રિગેટર',
    subtitle: 'વિશ્વસનીય સ્ત્રોતોમાંથી તાજેતરના વર્તમાન બાબતો',
    search: 'લેખો શોધો...',
    dateRange: 'તારીખ શ્રેણી',
    fetchNews: 'સમાચાર મેળવો',
    export: 'પરિણામો નિકાસ કરો',
    analyzing: 'લેખોનું વિશ્લેષણ કરી રહ્યું છે...',
    noResults: 'કોઈ લેખો મળ્યા નથી. સમાચાર મેળવવાનો પ્રયાસ કરો અથવા તમારા ફિલ્ટર્સને સમાયોજિત કરો.',
    last24h: 'છેલ્લા 24 કલાક',
    lastWeek: 'છેલ્લું અઠવાડિયું',
    lastMonth: 'છેલ્લો મહિનો',
    custom: 'કસ્ટમ શ્રેણી',
    sources: 'સ્ત્રોતો: ધ હિન્દુ, PIB, BBC અને વધુ'
  },
  kn: {
    title: 'ಸುದ್ದಿ ಸಂಗ್ರಾಹಕ',
    subtitle: 'ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳಿಂದ ಇತ್ತೀಚಿನ ಕರೆಂಟ್ ಅಫೇರ್ಸ್',
    search: 'ಲೇಖನಗಳನ್ನು ಹುಡುಕಿ...',
    dateRange: 'ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ',
    fetchNews: 'ಸುದ್ದಿಗಳನ್ನು ಪಡೆಯಿರಿ',
    export: 'ಫಲಿತಾಂಶಗಳನ್ನು ರಫ್ತು ಮಾಡಿ',
    analyzing: 'ಲೇಖನಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    noResults: 'ಯಾವುದೇ ಲೇಖನಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಸುದ್ದಿಗಳನ್ನು ಪಡೆಯಲು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ.',
    last24h: 'ಕಳೆದ 24 ಗಂಟೆಗಳು',
    lastWeek: 'ಕಳೆದ ವಾರ',
    lastMonth: 'ಕಳೆದ ತಿಂಗಳು',
    custom: 'ಕಸ್ಟಮ್ ವ್ಯಾಪ್ತಿ',
    sources: 'ಮೂಲಗಳು: ದಿ ಹಿಂದೂ, PIB, BBC ಮತ್ತು ಹೆಚ್ಚು'
  },
  ml: {
    title: 'വാർത്താ സംഗ്രാഹകൻ',
    subtitle: 'വിശ്വസനീയ സ്രോതസ്സുകളിൽ നിന്നുള്ള ഏറ്റവും പുതിയ കറന്റ് അഫയേഴ്സ്',
    search: 'ലേഖനങ്ങൾ തിരയുക...',
    dateRange: 'തീയതി ശ്രേണി',
    fetchNews: 'വാർത്തകൾ നേടുക',
    export: 'ഫലങ്ങൾ കയറ്റുമതി ചെയ്യുക',
    analyzing: 'ലേഖനങ്ങൾ വിശകലനം ചെയ്യുന്നു...',
    noResults: 'ലേഖനങ്ങളൊന്നും കണ്ടെത്തിയില്ല. വാർത്തകൾ എടുക്കാൻ ശ്രമിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ ഫിൽട്ടറുകൾ ക്രമീകരിക്കുക.',
    last24h: 'കഴിഞ്ഞ 24 മണിക്കൂർ',
    lastWeek: 'കഴിഞ്ഞ ആഴ്ച',
    lastMonth: 'കഴിഞ്ഞ മാസം',
    custom: 'കസ്റ്റം ശ്രേണി',
    sources: 'സ്രോതസ്സുകൾ: ദി ഹിന്ദു, PIB, BBC എന്നിവയും അതിലധികവും'
  },
  pa: {
    title: 'ਨਿਊਜ਼ ਐਗਰੀਗੇਟਰ',
    subtitle: 'ਭਰੋਸੇਯੋਗ ਸਰੋਤਾਂ ਤੋਂ ਤਾਜ਼ਾ ਕਰੰਟ ਅਫੇਅਰਜ਼',
    search: 'ਲੇਖਾਂ ਦੀ ਖੋਜ ਕਰੋ...',
    dateRange: 'ਤਾਰੀਖ ਰੇਂਜ',
    fetchNews: 'ਖ਼ਬਰਾਂ ਪ੍ਰਾਪਤ ਕਰੋ',
    export: 'ਨਤੀਜੇ ਐਕਸਪੋਰਟ ਕਰੋ',
    analyzing: 'ਲੇਖਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    noResults: 'ਕੋਈ ਲੇਖ ਨਹੀਂ ਮਿਲਿਆ। ਖ਼ਬਰਾਂ ਪ੍ਰਾਪਤ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਆਪਣੇ ਫਿਲਟਰ ਐਡਜਸਟ ਕਰੋ।',
    last24h: 'ਪਿਛਲੇ 24 ਘੰਟੇ',
    lastWeek: 'ਪਿਛਲਾ ਹਫ਼ਤਾ',
    lastMonth: 'ਪਿਛਲਾ ਮਹੀਨਾ',
    custom: 'ਕਸਟਮ ਰੇਂਜ',
    sources: 'ਸਰੋਤ: ਦ ਹਿੰਦੂ, PIB, BBC ਅਤੇ ਹੋਰ'
  },
  ur: {
    title: 'نیوز ایگریگیٹر',
    subtitle: 'قابل اعتماد ذرائع سے تازہ ترین کرنٹ افیئرز',
    search: 'مضامین تلاش کریں...',
    dateRange: 'تاریخ کی حد',
    fetchNews: 'خبریں حاصل کریں',
    export: 'نتائج برآمد کریں',
    analyzing: 'مضامین کا تجزیہ کیا جا رہا ہے...',
    noResults: 'کوئی مضمون نہیں ملا۔ خبریں حاصل کرنے یا اپنے فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں۔',
    last24h: 'پچھلے 24 گھنٹے',
    lastWeek: 'پچھلا ہفتہ',
    lastMonth: 'پچھلا مہینہ',
    custom: 'حسب ضرورت حد',
    sources: 'ذرائع: دی ہندو، PIB، BBC اور مزید'
  }
};

export function NewsAggregator({
  language,
  selectedTopics,
  analysisDepth,
  onArticlesLoaded,
  articles,
  onToggleBookmark,
  onViewAnalysis,
  themeMode
}: NewsAggregatorProps) {
  const t = TRANSLATIONS[language];
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'24h' | 'week' | 'month' | 'custom'>('24h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('');
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());
  const [summaryProgress, setSummaryProgress] = useState({ current: 0, total: 0 });
  const [displayCount, setDisplayCount] = useState(50);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const articleHeight = 400; // Approximate height per article
      const articlesScrolled = scrolled / articleHeight;
      setShowScrollTop(articlesScrolled > 15); // Show after ~30 articles (2 columns)
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateArticleSummary = useCallback(async (article: NewsArticle) => {
    try {
      const summaryResult = await generateLightweightSummary(
        article.title,
        article.content,
        article.summary || '',
        language,
        article.url // Pass the article URL for web scraping
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
      console.error('Error generating summary:', error);
      return article;
    }
  }, [language]);

  const handleViewAnalysis = async (article: NewsArticle) => {
    // If article doesn't have analysis, generate it first
    if (!article.analysis) {
      setSummarizingIds(prev => new Set(prev).add(article.id));
      toast.info('Generating AI summary...');
      
      try {
        const updatedArticle = await generateArticleSummary(article);
        onArticlesLoaded((prev: NewsArticle[]) => {
          const updatedArticles = prev.map((a: NewsArticle) => a.id === updatedArticle.id ? updatedArticle : a);
          return updatedArticles;
        });
        setSummarizingIds(prev => {
          const next = new Set(prev);
          next.delete(article.id);
          return next;
        });
        toast.success('Summary generated!');
      } catch (error) {
        setSummarizingIds(prev => {
          const next = new Set(prev);
          next.delete(article.id);
          return next;
        });
        toast.error('Failed to generate summary');
      }
    }
  };

  const handleFetchNews = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      onArticlesLoaded([]);
    }
    
    try {
      let dates = getDateRange(dateRange);
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        // Create date range for the selected month and year
        const year = parseInt(customEndDate);
        const month = parseInt(customStartDate) - 1; // Month is 0-indexed
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0); // Last day of month
        
        dates = {
          from: startOfMonth,
          to: endOfMonth
        };
      }
      
      const fetchedArticles = await fetchNewsWithFallback(
        selectedTopics,
        dates,
        language,
        (status) => setFetchStatus(status),
        // Progressive loading callback
        (newArticles) => {
          console.log(`🔄 Progressive update: ${newArticles.length} new articles`);
          if (!isLoadMore) {
            onArticlesLoaded((prev: NewsArticle[]) => {
              const combined = [...prev, ...newArticles];
              const unique = combined.filter((article, index, self) => 
                index === self.findIndex(a => a.id === article.id)
              );
              return unique.sort((a, b) => b.date.getTime() - a.date.getTime());
            });
          }
        }
      );
      
      console.log('📦 Fetched articles:', fetchedArticles.length, fetchedArticles.slice(0, 2));
      console.log('🔍 isLoadMore:', isLoadMore);
      
      // Don't overwrite progressive updates - just ensure final count is correct
      if (!isLoadMore) {
        console.log('✅ Progressive loading complete');
        // Fallback: if no articles were loaded progressively, load them now
        if (articles.length === 0 && fetchedArticles.length > 0) {
          console.log('🔄 Fallback: Loading articles since progressive loading didn\'t work');
          onArticlesLoaded(fetchedArticles);
        }
        setDisplayCount(50);
        toast.success(`Loaded ${fetchedArticles.length} articles!`);
      } else {
        setDisplayCount(prev => prev + 50);
        toast.success(`Loaded 50 more articles!`);
      }
      
      setLoading(false);
      setLoadingMore(false);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast.error(error.message || 'Failed to fetch news.');
      setLoading(false);
      setLoadingMore(false);
    } finally {
      setFetchStatus('');
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopics = selectedTopics.includes('all') || 
      article.topics.some(topic => selectedTopics.includes(topic));
    
    return matchesSearch && matchesTopics;
  }).sort((a, b) => {
    // First priority: content quality (articles with real content first)
    if (a.hasRealContent && !b.hasRealContent) return -1;
    if (!a.hasRealContent && b.hasRealContent) return 1;
    
    // Second priority: date sorting within each group
    return sortOrder === 'newest' 
      ? b.date.getTime() - a.date.getTime()
      : a.date.getTime() - b.date.getTime();
  });
  
  console.log('📋 Articles in component:', articles.length, 'Filtered:', filteredArticles.length);

  const handleExport = () => {
    const data = filteredArticles.map(article => ({
      title: article.title,
      content: article.content,
      source: article.source,
      date: article.date.toISOString(),
      topics: article.topics.join(', '),
      summary: article.analysis?.summary || '',
      keyTakeaways: article.analysis?.keyTakeaways?.join('; ') || ''
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportToPDF = () => {
    exportNewsToPDF(filteredArticles, { language });
  };

  const displayedArticles = filteredArticles.slice(0, displayCount);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t.sources}</p>
        {articles.length > 0 && articles[0]?.id.startsWith('rss-') && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time RSS headlines ({dateRange === '24h' ? 'last 24 hours' : dateRange === 'week' ? 'last 7 days' : 'last 1-3 days'})
          </p>
        )}
      </div>

      {/* Controls */}
      <div className={`rounded-lg p-4 border ${
        themeMode === 'newspaper'
          ? 'bg-[#f9f3e8] border-[#8b7355]'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
              themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                themeMode === 'newspaper'
                  ? 'bg-[#f4e8d0] border-[#8b7355] text-[#2c1810] placeholder-[#5a4a3a] focus:ring-[#8b7355]'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => {
                const value = e.target.value as any;
                setDateRange(value);
                if (value === 'custom') {
                  setShowTimePicker(true);
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                themeMode === 'newspaper'
                  ? 'bg-[#f4e8d0] border-[#8b7355] text-[#2c1810] focus:ring-[#8b7355]'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500'
              }`}
            >
              <option value="24h">{t.last24h}</option>
              <option value="week">{t.lastWeek}</option>
              <option value="month">{t.lastMonth}</option>
              <option value="custom">{t.custom}</option>
            </select>
          </div>

          {/* Sort Order - Show for all date ranges */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                themeMode === 'newspaper'
                  ? 'bg-[#f4e8d0] border-[#8b7355] text-[#2c1810] focus:ring-[#8b7355]'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500'
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFetchNews()}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 text-white ${
                themeMode === 'newspaper'
                  ? 'bg-[#8b7355] hover:bg-[#6b5744] disabled:bg-[#b8a785]'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t.fetchNews}
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              disabled={filteredArticles.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                themeMode === 'newspaper'
                  ? 'bg-[#e8dcc8] hover:bg-[#d4c5a9] text-[#3d2817] border border-[#8b7355]'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title={t.export}
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportToPDF}
              disabled={filteredArticles.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                themeMode === 'newspaper'
                  ? 'bg-[#e8dcc8] hover:bg-[#d4c5a9] text-[#3d2817] border border-[#8b7355]'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Export to PDF"
            >
              <FileDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Custom Date Picker */}
        {dateRange === 'custom' && showTimePicker && (
          <div className={`mt-4 p-4 rounded-lg border ${
            themeMode === 'newspaper'
              ? 'bg-[#f4e8d0] border-[#8b7355]'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className={`h-4 w-4 ${
                themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-blue-600 dark:text-blue-400'
              }`} />
              <h4 className={`text-sm font-semibold ${
                themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
              }`}>Custom Month & Year</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-700 dark:text-gray-300'
                }`}>Month</label>
                <select
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                    themeMode === 'newspaper'
                      ? 'bg-[#f9f3e8] border-[#8b7355] text-[#2c1810] focus:ring-[#8b7355]'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-700 dark:text-gray-300'
                }`}>Year</label>
                <select
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
                    themeMode === 'newspaper'
                      ? 'bg-[#f9f3e8] border-[#8b7355] text-[#2c1810] focus:ring-[#8b7355]'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select Year</option>
                  {Array.from({length: 30}, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Progress Banner */}
      {summaryProgress.total > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Summarizing articles... {summaryProgress.current}/{summaryProgress.total}
              </p>
              <div className="mt-2 w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(summaryProgress.current / summaryProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {displayedArticles.length === 0 ? (
        <div className={`rounded-lg p-12 border text-center ${
          themeMode === 'newspaper'
            ? 'bg-[#f9f3e8] border-[#8b7355] text-[#5a4a3a]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          <p>{t.noResults}</p>
        </div>
      ) : (
        <>
          <div className="columns-1 lg:columns-2 gap-4 space-y-4">
            {displayedArticles.map(article => (
              <div key={article.id} className="break-inside-avoid mb-4">
                <NewsCard
                  article={article}
                  language={language}
                  onToggleBookmark={onToggleBookmark}
                  onViewAnalysis={handleViewAnalysis}
                  isSummarizing={summarizingIds.has(article.id)}
                  themeMode={themeMode}
                />
              </div>
            ))}
          </div>

          {/* View More Articles Button */}
          {displayCount < filteredArticles.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayCount(prev => prev + 50)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg font-semibold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                {t.viewMore}
              </button>
            </div>
          )}
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 p-3 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-full shadow-lg transition-all backdrop-blur-sm"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}