import { Moon, Sun, Globe, Newspaper } from 'lucide-react';
import { Language, ThemeMode } from '../App';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
}

const LANGUAGES = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  bn: 'বাংলা',
  te: 'తెలుగు',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو'
};

const TRANSLATIONS = {
  en: {
    title: 'AI News Analyzer',
    subtitle: 'Intelligent Current Affairs for Competitive Exams'
  },
  hi: {
    title: 'एआई समाचार विश्लेषक',
    subtitle: 'प्रतियोगी परीक्षाओं के लिए बुद्धिमान करंट अफेयर्स'
  },
  ta: {
    title: 'AI செய்தி பகுப்பாய்வி',
    subtitle: 'போட்டித் தேர்வுகளுக்கான அறிவார்ந்த நடப்பு விவகாரங்கள்'
  },
  bn: {
    title: 'এআই নিউজ বিশ্লেষক',
    subtitle: 'প্রতিযোগিতামূলক পরীক্ষার জন্য বুদ্ধিমান কারেন্ট অ্যাফেয়ার্স'
  },
  te: {
    title: 'AI వార్తల విశ్లేషకుడు',
    subtitle: 'పోటీ పరీక్షల కోసం తెలివైన కరెంట్ అఫైర్స్'
  },
  mr: {
    title: 'एआय बातम्या विश्लेषक',
    subtitle: 'स्पर्धा परीक्षांसाठी बुद्धिमान चालू घडामोडी'
  },
  gu: {
    title: 'AI સમાચાર વિશ્લેષક',
    subtitle: 'સ્પર્ધાત્મક પરીક્ષાઓ માટે બુદ્ધિશાળી વર્તમાન બાબતો'
  },
  kn: {
    title: 'AI ಸುದ್ದಿ ವಿಶ್ಲೇಷಕ',
    subtitle: 'ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗಾಗಿ ಬುದ್ಧಿವಂತ ಕರೆಂಟ್ ಅಫೇರ್ಸ್'
  },
  ml: {
    title: 'AI വാർത്താ വിശകലനം',
    subtitle: 'മത്സര പരീക്ഷകൾക്കായി ബുദ്ധിപരമായ കറന്റ് അഫയേഴ്സ്'
  },
  pa: {
    title: 'AI ਖ਼ਬਰਾਂ ਵਿਸ਼ਲੇਸ਼ਕ',
    subtitle: 'ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਲਈ ਬੁੱਧੀਮਾਨ ਕਰੰਟ ਅਫੇਅਰਜ਼'
  },
  ur: {
    title: 'AI نیوز تجزیہ کار',
    subtitle: 'مسابقتی امتحانات کے لیے ذہین کرنٹ افیئرز'
  }
};

export function Header({ language, setLanguage, darkMode, setDarkMode, themeMode, setThemeMode }: HeaderProps) {
  const t = TRANSLATIONS[language];

  return (
    <header className={`shadow-sm border-b transition-colors ${
      themeMode === 'newspaper'
        ? 'bg-[#f9f3e8] border-[#8b7355]'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              themeMode === 'newspaper'
                ? 'text-[#2c1810] font-serif'
                : 'text-gray-900 dark:text-white'
            }`}>
              {t.title}
            </h1>
            <p className={`text-sm mt-1 ${
              themeMode === 'newspaper'
                ? 'text-[#5a4a3a]'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {t.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
              }`} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  themeMode === 'newspaper'
                    ? 'bg-[#f4e8d0] border-[#8b7355] text-[#2c1810]'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Theme Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setThemeMode?.('light')}
                className={`p-2 rounded-lg transition-colors ${
                  themeMode === 'light'
                    ? 'bg-blue-100 text-blue-600'
                    : themeMode === 'newspaper'
                    ? 'bg-[#c9b896] hover:bg-[#b8a785] text-[#3d2817]'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                aria-label="Light mode"
              >
                <Sun className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setThemeMode?.('dark')}
                className={`p-2 rounded-lg transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-gray-700 text-yellow-500'
                    : themeMode === 'newspaper'
                    ? 'bg-[#c9b896] hover:bg-[#b8a785] text-[#3d2817]'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                aria-label="Dark mode"
              >
                <Moon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setThemeMode?.('newspaper')}
                className={`p-2 rounded-lg transition-colors ${
                  themeMode === 'newspaper'
                    ? 'bg-[#6b5744] text-[#f9f3e8]'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                aria-label="Newspaper mode"
              >
                <Newspaper className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}