import { LayoutDashboard, Newspaper, FileText, BarChart3, Filter } from 'lucide-react';
import { ViewMode, Topic, AnalysisDepth, Language, ThemeMode } from '../App';

interface SidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedTopics: Topic[];
  setSelectedTopics: (topics: Topic[]) => void;
  analysisDepth: AnalysisDepth;
  setAnalysisDepth: (depth: AnalysisDepth) => void;
  language: Language;
  themeMode?: ThemeMode;
}

const TOPICS: { value: Topic; label: Record<Language, string>; icon: string }[] = [
  { value: 'all', label: { en: 'All Topics', hi: 'सभी विषय', ta: 'அனைத்து தலைப்புகள்', bn: 'সব বিষয়', te: 'అన్ని అంశాలు', mr: 'सर्व विषय', gu: 'બધા વિષયો', kn: 'ಎಲ್ಲಾ ವಿಷಯಗಳು', ml: 'എല്ലാ വിഷയങ്ങളും', pa: 'ਸਾਰੇ ਵਿਸ਼ੇ', ur: 'تمام موضوعات' }, icon: '📚' },
  { value: 'economy', label: { en: 'Economy', hi: 'अर्थव्यवस्था', ta: 'பொருளாதாரம்', bn: 'অর্থনীতি', te: 'ఆర్థిక వ్యవస్థ', mr: 'अर्थव्यवस्था', gu: 'અર્થતંત્ર', kn: 'ಆರ್ಥಿಕತೆ', ml: 'സമ്പദ്‌വ്യവസ്ഥ', pa: 'ਆਰਥਿਕਤਾ', ur: 'معیشت' }, icon: '💰' },
  { value: 'polity', label: { en: 'Polity & Governance', hi: 'राजव्यवस्था और शासन', ta: 'அரசியல் மற்றும் நிர்வாகம்', bn: 'রাজনীতি ও শাসন', te: 'రాజకీయం మరియు పాలన', mr: 'राज्यव्यवस्था आणि प्रशासन', gu: 'રાજનીતિ અને શાસન', kn: 'ರಾಜಕೀಯ ಮತ್ತು ಆಡಳಿತ', ml: 'രാഷ്ട്രീയവും ഭരണവും', pa: 'ਰਾਜਨੀਤੀ ਅਤੇ ਸ਼ਾਸਨ', ur: 'سیاست اور حکومت' }, icon: '🏛️' },
  { value: 'environment', label: { en: 'Environment', hi: 'पर्यावरण', ta: 'சுற்றுச்சூழல்', bn: 'পরিবেশ', te: 'పర్యావరణం', mr: 'पर्यावरण', gu: 'પર્યાવરણ', kn: 'ಪರಿಸರ', ml: 'പരിസ്ഥിതി', pa: 'ਵਾਤਾਵਰਣ', ur: 'ماحولیات' }, icon: '🌍' },
  { value: 'international', label: { en: 'International Relations', hi: 'अंतर्राष्ट्रीय संबंध', ta: 'சர்வதேச உறவுகள்', bn: 'আন্তর্জাতিক সম্পর্ক', te: 'అంతర్జాతీయ సంబంధాలు', mr: 'आंतरराष्ट्रीय संबंध', gu: 'આંતરરાષ્ટ્રીય સંબંધો', kn: 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಸಂಬಂಧಗಳು', ml: 'അന്താരാഷ്ട്ര ബന്ധങ്ങൾ', pa: 'ਅੰਤਰਰਾਸ਼ਟਰੀ ਸਬੰਧ', ur: 'بین الاقوامی تعلقات' }, icon: '🌐' },
  { value: 'science', label: { en: 'Science & Technology', hi: 'विज्ञान और प्रौद्योगिकी', ta: 'அறிவியல் மற்றும் தொழில்நுட்பம்', bn: 'বিজ্ঞান ও প্রযুক্তি', te: 'సైన్స్ & టెక్నాలజీ', mr: 'विज्ञान आणि तंत्रज्ञान', gu: 'વિજ્ઞાન અને ટેકનોલોજી', kn: 'ವಿಜ್ಞಾನ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ', ml: 'ശാസ്ത്ര സാങ്കേതികവിദ്യ', pa: 'ਵਿਗਿਆਨ ਅਤੇ ਤਕਨਾਲੋਜੀ', ur: 'سائنس اور ٹیکنالوجی' }, icon: '🔬' },
  { value: 'society', label: { en: 'Society & Culture', hi: 'समाज और संस्कृति', ta: 'சமூகம் மற்றும் கலாச்சாரம்', bn: 'সমাজ ও সংস্কৃতি', te: 'సమాజం మరియు సంస్కృతి', mr: 'समाज आणि संस्कृती', gu: 'સમાજ અને સંસ્કૃતિ', kn: 'ಸಮಾಜ ಮತ್ತು ಸಂಸ್ಕೃತಿ', ml: 'സമൂഹവും സംസ്കാരവും', pa: 'ਸਮਾਜ ਅਤੇ ਸੱਭਿਆਚਾਰ', ur: 'معاشرہ اور ثقافت' }, icon: '👥' },
  { value: 'history', label: { en: 'History', hi: 'इतिहास', ta: 'வரலாறு', bn: 'ইতিহাস', te: 'చరిత్ర', mr: 'इतिहास', gu: 'ઇતિહાસ', kn: 'ಇತಿಹಾಸ', ml: 'ചരിത്രം', pa: 'ਇਤਿਹਾਸ', ur: 'تاریخ' }, icon: '📜' },
  { value: 'geography', label: { en: 'Geography', hi: 'भूगोल', ta: 'புவியியல்', bn: 'ভূগোল', te: 'భూగోళ శాస్త్రం', mr: 'भूगोल', gu: 'ભૂગોળ', kn: 'ಭೂಗೋಳ', ml: 'ഭൂമിശാസ്ത്രം', pa: 'ਭੂਗੋਲ', ur: 'جغرافیہ' }, icon: '🗺️' },
];

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    news: 'News Feed',
    pdf: 'PDF Analysis',
    filters: 'Filters',
    topics: 'Topics',
    depth: 'Analysis Depth',
    basic: 'Basic',
    advanced: 'Advanced'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    news: 'समाचार फ़ीड',
    pdf: 'पीडीएफ विश्लेषण',
    filters: 'फ़िल्टर',
    topics: 'विषय',
    depth: 'विश्लेषण गहराई',
    basic: 'बुनियादी',
    advanced: 'उन्नत'
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    news: 'செய்தி ஊட்டம்',
    pdf: 'PDF பகுப்பாய்வு',
    filters: 'வடிகட்டிகள்',
    topics: 'தலைப்புகள்',
    depth: 'பகுப்பாய்வு ஆழம்',
    basic: 'அடிப்படை',
    advanced: 'மேம்பட்ட'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    news: 'নিউজ ফিড',
    pdf: 'PDF বিশ্লেষণ',
    filters: 'ফিল্টার',
    topics: 'বিষয়',
    depth: 'বিশ্লেষণ গভীরতা',
    basic: 'মৌলিক',
    advanced: 'উন্নত'
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    news: 'న్యూస్ ఫీడ్',
    pdf: 'PDF విశ్లేషణ',
    filters: 'ఫిల్టర్లు',
    topics: 'అంశాలు',
    depth: 'విశ్లేషణ లోతు',
    basic: 'ప్రాథమిక',
    advanced: 'అధునాతన'
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    news: 'बातम्या फीड',
    pdf: 'PDF विश्लेषण',
    filters: 'फिल्टर',
    topics: 'विषय',
    depth: 'विश्लेषण खोली',
    basic: 'मूलभूत',
    advanced: 'प्रगत'
  },
  gu: {
    dashboard: 'ડેશબોર્ડ',
    news: 'સમાચાર ફીડ',
    pdf: 'PDF વિશ્લેષણ',
    filters: 'ફિલ્ટર્સ',
    topics: 'વિષયો',
    depth: 'વિશ્લેષણ ઊંડાઈ',
    basic: 'મૂળભૂત',
    advanced: 'અદ્યતન'
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    news: 'ಸುದ್ದಿ ಫೀಡ್',
    pdf: 'PDF ವಿಶ್ಲೇಷಣೆ',
    filters: 'ಫಿಲ್ಟರ್‌ಗಳು',
    topics: 'ವಿಷಯಗಳು',
    depth: 'ವಿಶ್ಲೇಷಣೆ ಆಳ',
    basic: 'ಮೂಲಭೂತ',
    advanced: 'ಸುಧಾರಿತ'
  },
  ml: {
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    news: 'വാർത്താ ഫീഡ്',
    pdf: 'PDF വിശകലനം',
    filters: 'ഫിൽട്ടറുകൾ',
    topics: 'വിഷയങ്ങൾ',
    depth: 'വിശകലന ആഴം',
    basic: 'അടിസ്ഥാന',
    advanced: 'വിപുലമായ'
  },
  pa: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    news: 'ਨਿਊਜ਼ ਫੀਡ',
    pdf: 'PDF ਵਿਸ਼ਲੇਸ਼ਣ',
    filters: 'ਫਿਲਟਰ',
    topics: 'ਵਿਸ਼ੇ',
    depth: 'ਵਿਸ਼ਲੇਸ਼ਣ ਡੂੰਘਾਈ',
    basic: 'ਬੁਨਿਆਦੀ',
    advanced: 'ਉੱਨਤ'
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    news: 'نیوز فیڈ',
    pdf: 'PDF تجزیہ',
    filters: 'فلٹرز',
    topics: 'موضوعات',
    depth: 'تجزیہ کی گہرائی',
    basic: 'بنیادی',
    advanced: 'جدید'
  }
};

export function Sidebar({
  viewMode,
  setViewMode,
  selectedTopics,
  setSelectedTopics,
  analysisDepth,
  setAnalysisDepth,
  language,
  themeMode
}: SidebarProps) {
  const t = TRANSLATIONS[language];

  const toggleTopic = (topic: Topic) => {
    if (topic === 'all') {
      setSelectedTopics(['all']);
    } else {
      const withoutAll = selectedTopics.filter(t => t !== 'all');
      if (withoutAll.includes(topic)) {
        const newTopics = withoutAll.filter(t => t !== topic);
        setSelectedTopics(newTopics.length === 0 ? ['all'] : newTopics);
      } else {
        setSelectedTopics([...withoutAll, topic]);
      }
    }
  };

  const getActiveClass = () => {
    if (themeMode === 'newspaper') return 'bg-[#c9b896] text-[#3d2817]';
    return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
  };

  const getInactiveClass = () => {
    if (themeMode === 'newspaper') return 'text-[#5a4a3a] hover:bg-[#e8dcc8]';
    return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  return (
    <aside className={`hidden lg:block w-72 border-r min-h-screen p-4 ${
      themeMode === 'newspaper'
        ? 'bg-[#f9f3e8] border-[#8b7355]'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      {/* Navigation */}
      <nav className="space-y-1 mb-6">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            viewMode === 'dashboard' ? getActiveClass() : getInactiveClass()
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>{t.dashboard}</span>
        </button>
        
        <button
          onClick={() => setViewMode('news')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            viewMode === 'news' ? getActiveClass() : getInactiveClass()
          }`}
        >
          <Newspaper className="h-5 w-5" />
          <span>{t.news}</span>
        </button>
        
        <button
          onClick={() => setViewMode('pdf')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            viewMode === 'pdf' ? getActiveClass() : getInactiveClass()
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>{t.pdf}</span>
        </button>
      </nav>

      {/* Filters */}
      <div className={`border-t pt-4 ${
        themeMode === 'newspaper' ? 'border-[#8b7355]' : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className={`h-4 w-4 ${
            themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
          }`} />
          <h3 className={`font-semibold ${
            themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
          }`}>{t.filters}</h3>
        </div>

        {/* Topics */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {t.topics}
          </label>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {TOPICS.map(topic => (
              <button
                key={topic.value}
                onClick={() => toggleTopic(topic.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedTopics.includes(topic.value) ? getActiveClass() : getInactiveClass()
                }`}
              >
                <span>{topic.icon}</span>
                <span className="flex-1 text-left">{topic.label[language]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Depth */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {t.depth}
          </label>
          <div className="space-y-1">
            <button
              onClick={() => setAnalysisDepth('basic')}
              className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                analysisDepth === 'basic' ? getActiveClass() : getInactiveClass()
              }`}
            >
              {t.basic}
            </button>
            <button
              onClick={() => setAnalysisDepth('advanced')}
              className={`w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                analysisDepth === 'advanced' ? getActiveClass() : getInactiveClass()
              }`}
            >
              {t.advanced}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
