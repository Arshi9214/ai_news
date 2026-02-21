import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, BookOpen, FileText, Home, Settings, Bookmark, Download } from 'lucide-react';
import { Language } from '../App';

interface MobileMenuProps {
  language: Language;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLanguageChange: (lang: Language) => void;
  bookmarkCount: number;
  onNavigate: (section: 'dashboard' | 'news' | 'pdf' | 'bookmarks') => void;
  currentSection: string;
}

const TRANSLATIONS = {
  en: {
    menu: 'Menu',
    close: 'Close',
    home: 'Dashboard',
    news: 'News Feed',
    pdf: 'PDF Analysis',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    export: 'Export Data'
  },
  hi: {
    menu: 'मेनू',
    close: 'बंद करें',
    home: 'डैशबोर्ड',
    news: 'समाचार फ़ीड',
    pdf: 'PDF विश्लेषण',
    bookmarks: 'बुकमार्क',
    settings: 'सेटिंग्स',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    export: 'डेटा निर्यात करें'
  }
};

const LANGUAGE_OPTIONS = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn' as Language, name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu' as Language, name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn' as Language, name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml' as Language, name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa' as Language, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur' as Language, name: 'Urdu', nativeName: 'اردو' }
];

export function MobileMenu({
  language,
  darkMode,
  onToggleDarkMode,
  onLanguageChange,
  bookmarkCount,
  onNavigate,
  currentSection
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  
  const t = TRANSLATIONS[language === 'hi' ? 'hi' : 'en'];

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigate = (section: 'dashboard' | 'news' | 'pdf' | 'bookmarks') => {
    onNavigate(section);
    setIsOpen(false);
  };

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
    setShowLanguages(false);
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: t.home, icon: Home },
    { id: 'news', label: t.news, icon: BookOpen },
    { id: 'pdf', label: t.pdf, icon: FileText },
    { id: 'bookmarks', label: t.bookmarks, icon: Bookmark, badge: bookmarkCount }
  ];

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={t.menu}
      >
        <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                AI News Analyzer
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">India Edition</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t.close}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as any)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-1 bg-yellow-400 dark:bg-yellow-600 text-gray-900 dark:text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-700" />

        {/* Settings */}
        <div className="p-4 space-y-3">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.darkMode}
              </span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">{t.language}</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {LANGUAGE_OPTIONS.find(l => l.code === language)?.nativeName}
              </span>
            </button>

            {/* Language Options */}
            {showLanguages && (
              <div className="max-h-60 overflow-y-auto border-t border-gray-200 dark:border-gray-600">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{lang.name}</span>
                      <span className="text-xs">{lang.nativeName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Made with ❤️ for competitive exam aspirants
          </p>
        </div>
      </div>
    </>
  );
}
