import { BookMarked, FileText, TrendingUp, Calendar } from 'lucide-react';
import { NewsArticle, ProcessedPDF, Language, ThemeMode } from '../App';
import { NewsCard } from './NewsCard';

interface DashboardProps {
  articles: NewsArticle[];
  processedPDFs: ProcessedPDF[];
  language: Language;
  onViewAnalysis: (item: NewsArticle | ProcessedPDF) => void;
  onToggleBookmark: (id: string) => void;
  themeMode?: ThemeMode;
}

const TRANSLATIONS = {
  en: {
    title: 'Dashboard Overview',
    bookmarked: 'Bookmarked Articles',
    recent: 'Recent Analysis',
    stats: 'Your Statistics',
    totalArticles: 'Total Articles',
    totalPDFs: 'PDFs Processed',
    bookmarks: 'Bookmarks',
    thisWeek: 'This Week',
    noBookmarks: 'No bookmarked articles yet',
    noRecent: 'No recent activity',
    viewAll: 'View All'
  },
  hi: {
    title: 'डैशबोर्ड अवलोकन',
    bookmarked: 'बुकमार्क किए गए लेख',
    recent: 'हाल का विश्लेषण',
    stats: 'आपके आंकड़े',
    totalArticles: 'कुल लेख',
    totalPDFs: 'प्रोसेस किए गए पीडीएफ',
    bookmarks: 'बुकमार्क',
    thisWeek: 'इस सप्ताह',
    noBookmarks: 'अभी तक कोई बुकमार्क लेख नहीं',
    noRecent: 'कोई हालिया गतिविधि नहीं',
    viewAll: 'सभी देखें'
  },
  ta: {
    title: 'டாஷ்போர்டு கண்ணோட்டம்',
    bookmarked: 'புத்தகக்குறி செய்யப்பட்ட கட்டுரைகள்',
    recent: 'சமீபத்திய பகுப்பாய்வு',
    stats: 'உங்கள் புள்ளிவிவரங்கள்',
    totalArticles: 'மொத்த கட்டுரைகள்',
    totalPDFs: 'செயலாக்கப்பட்ட PDF கள்',
    bookmarks: 'புத்தகக்குறிகள்',
    thisWeek: 'இந்த வாரம்',
    noBookmarks: 'இன்னும் புத்தகக்குறி செய்யப்பட்ட கட்டுரைகள் இல்லை',
    noRecent: 'சமீபத்திய செயல்பாடு இல்லை',
    viewAll: 'அனைத்தையும் காண்க'
  },
  bn: {
    title: 'ড্যাশবোর্ড ওভারভিউ',
    bookmarked: 'বুকমার্ক করা নিবন্ধ',
    recent: 'সাম্প্রতিক বিশ্লেষণ',
    stats: 'আপনার পরিসংখ্যান',
    totalArticles: 'মোট নিবন্ধ',
    totalPDFs: 'প্রসেসড পিডিএফ',
    bookmarks: 'বুকমার্ক',
    thisWeek: 'এই সপ্তাহে',
    noBookmarks: 'এখনও কোনো বুকমার্ক নিবন্ধ নেই',
    noRecent: 'কোন সাম্প্রতিক কার্যকলাপ নেই',
    viewAll: 'সব দেখুন'
  },
  te: {
    title: 'డాష్‌బోర్డ్ అవలోకనం',
    bookmarked: 'బుక్‌మార్క్ చేసిన కథనాలు',
    recent: 'ఇటీవలి విశ్లేషణ',
    stats: 'మీ గణాంకాలు',
    totalArticles: 'మొత్తం కథనాలు',
    totalPDFs: 'ప్రాసెస్ చేసిన PDFలు',
    bookmarks: 'బుక్‌మార్క్‌లు',
    thisWeek: 'ఈ వారం',
    noBookmarks: 'ఇంకా బుక్‌మార్క్ చేసిన కథనాలు లేవు',
    noRecent: 'ఇటీవలి కార్యకలాపాలు లేవు',
    viewAll: 'అన్నీ చూడండి'
  },
  mr: {
    title: 'डॅशबोर्ड आढावा',
    bookmarked: 'बुकमार्क केलेले लेख',
    recent: 'अलीकडील विश्लेषण',
    stats: 'तुमची आकडेवारी',
    totalArticles: 'एकूण लेख',
    totalPDFs: 'प्रक्रिया केलेले PDF',
    bookmarks: 'बुकमार्क',
    thisWeek: 'या आठवड्यात',
    noBookmarks: 'अद्याप कोणतेही बुकमार्क लेख नाहीत',
    noRecent: 'कोणतीही अलीकडील क्रियाकलाप नाही',
    viewAll: 'सर्व पहा'
  },
  gu: {
    title: 'ડેશબોર્ડ વિહંગાવલોકન',
    bookmarked: 'બુકમાર્ક કરેલા લેખો',
    recent: 'તાજેતરનું વિશ્લેષણ',
    stats: 'તમારા આંકડા',
    totalArticles: 'કુલ લેખો',
    totalPDFs: 'પ્રોસેસ થયેલ PDF',
    bookmarks: 'બુકમાર્ક્સ',
    thisWeek: 'આ અઠવાડિયે',
    noBookmarks: 'હજુ સુધી કોઈ બુકમાર્ક લેખો નથી',
    noRecent: 'કોઈ તાજેતરની પ્રવૃત્તિ નથી',
    viewAll: 'બધું જુઓ'
  },
  kn: {
    title: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ',
    bookmarked: 'ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ಲೇಖನಗಳು',
    recent: 'ಇತ್ತೀಚಿನ ವಿಶ್ಲೇಷಣೆ',
    stats: 'ನಿಮ್ಮ ಅಂಕಿಅಂಶಗಳು',
    totalArticles: 'ಒಟ್ಟು ಲೇಖನಗಳು',
    totalPDFs: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿದ PDF ಗಳು',
    bookmarks: 'ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು',
    thisWeek: 'ಈ ವಾರ',
    noBookmarks: 'ಇನ್ನೂ ಯಾವುದೇ ಬುಕ್‌ಮಾರ್ಕ್ ಲೇಖನಗಳಿಲ್ಲ',
    noRecent: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ ಇಲ್ಲ',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ'
  },
  ml: {
    title: 'ഡാഷ്‌ബോർഡ് അവലോകനം',
    bookmarked: 'ബുക്ക്മാർക്ക് ചെയ്ത ലേഖനങ്ങൾ',
    recent: 'സമീപകാല വിശകലനം',
    stats: 'നിങ്ങളുടെ സ്ഥിതിവിവരക്കണക്കുകൾ',
    totalArticles: 'മൊത്തം ലേഖനങ്ങൾ',
    totalPDFs: 'പ്രോസസ് ചെയ്ത PDF കൾ',
    bookmarks: 'ബുക്ക്മാർക്കുകൾ',
    thisWeek: 'ഈ ആഴ്ച',
    noBookmarks: 'ഇതുവരെ ബുക്ക്മാർക്ക് ചെയ്ത ലേഖനങ്ങളൊന്നുമില്ല',
    noRecent: 'സമീപകാല പ്രവർത്തനമൊന്നുമില്ല',
    viewAll: 'എല്ലാം കാണുക'
  },
  pa: {
    title: 'ਡੈਸ਼ਬੋਰਡ ਸੰਖੇਪ',
    bookmarked: 'ਬੁੱਕਮਾਰਕ ਕੀਤੇ ਲੇਖ',
    recent: 'ਤਾਜ਼ਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    stats: 'ਤੁਹਾਡੇ ਅੰਕੜੇ',
    totalArticles: 'ਕੁੱਲ ਲੇਖ',
    totalPDFs: 'ਪ੍ਰੋਸੈਸ ਕੀਤੇ PDF',
    bookmarks: 'ਬੁੱਕਮਾਰਕ',
    thisWeek: 'ਇਸ ਹਫ਼ਤੇ',
    noBookmarks: 'ਅਜੇ ਤੱਕ ਕੋਈ ਬੁੱਕਮਾਰਕ ਲੇਖ ਨਹੀਂ',
    noRecent: 'ਕੋਈ ਤਾਜ਼ਾ ਗਤੀਵਿਧੀ ਨਹੀਂ',
    viewAll: 'ਸਾਰੇ ਵੇਖੋ'
  },
  ur: {
    title: 'ڈیش بورڈ کا جائزہ',
    bookmarked: 'بک مارک شدہ مضامین',
    recent: 'حالیہ تجزیہ',
    stats: 'آپ کے اعداد و شمار',
    totalArticles: 'کل مضامین',
    totalPDFs: 'پروسیس شدہ PDF',
    bookmarks: 'بک مارکس',
    thisWeek: 'اس ہفتے',
    noBookmarks: 'ابھی تک کوئی بک مارک مضمون نہیں',
    noRecent: 'کوئی حالیہ سرگرمی نہیں',
    viewAll: 'سب دیکھیں'
  }
};

export function Dashboard({
  articles,
  processedPDFs,
  language,
  onViewAnalysis,
  onToggleBookmark,
  themeMode
}: DashboardProps) {
  const t = TRANSLATIONS[language];
  const bookmarkedArticles = articles.filter(a => a.bookmarked);
  const recentItems = [...articles.slice(0, 3), ...processedPDFs.slice(0, 2)].slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.title}</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-6 border ${
          themeMode === 'newspaper'
            ? 'bg-[#f9f3e8] border-[#8b7355]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'
              }`}>{t.totalArticles}</p>
              <p className={`text-3xl font-bold mt-1 ${
                themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
              }`}>{articles.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              themeMode === 'newspaper' ? 'bg-[#c9b896]' : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border ${
          themeMode === 'newspaper'
            ? 'bg-[#f9f3e8] border-[#8b7355]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'
              }`}>{t.totalPDFs}</p>
              <p className={`text-3xl font-bold mt-1 ${
                themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
              }`}>{processedPDFs.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              themeMode === 'newspaper' ? 'bg-[#c9b896]' : 'bg-purple-100 dark:bg-purple-900/20'
            }`}>
              <FileText className={`h-6 w-6 ${
                themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-purple-600 dark:text-purple-400'
              }`} />
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border ${
          themeMode === 'newspaper'
            ? 'bg-[#f9f3e8] border-[#8b7355]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-600 dark:text-gray-400'
              }`}>{t.bookmarks}</p>
              <p className={`text-3xl font-bold mt-1 ${
                themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
              }`}>{bookmarkedArticles.length}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              themeMode === 'newspaper' ? 'bg-[#c9b896]' : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              <BookMarked className={`h-6 w-6 ${
                themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Articles */}
      <div className={`rounded-lg p-6 border ${
        themeMode === 'newspaper'
          ? 'bg-[#f9f3e8] border-[#8b7355]'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
        }`}>{t.bookmarked}</h3>
        {bookmarkedArticles.length === 0 ? (
          <p className={`text-center py-8 ${
            themeMode === 'newspaper' ? 'text-[#5a4a3a]' : 'text-gray-500 dark:text-gray-400'
          }`}>{t.noBookmarks}</p>
        ) : (
          <div className="space-y-3">
            {bookmarkedArticles.slice(0, 5).map(article => (
              <NewsCard
                key={article.id}
                article={article}
                language={language}
                onToggleBookmark={onToggleBookmark}
                onViewAnalysis={onViewAnalysis}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={`rounded-lg p-6 border ${
        themeMode === 'newspaper'
          ? 'bg-[#f9f3e8] border-[#8b7355]'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.recent}</h3>
        {recentItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t.noRecent}</p>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => {
              if ('source' in item) {
                // It's a NewsArticle
                return (
                  <NewsCard
                    key={item.id}
                    article={item}
                    language={language}
                    onToggleBookmark={onToggleBookmark}
                    onViewAnalysis={onViewAnalysis}
                    compact
                  />
                );
              } else {
                // It's a ProcessedPDF
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => onViewAnalysis(item)}
                  >
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.uploadDate.toLocaleDateString()}
                        </span>
                        {item.pageCount && <span>{item.pageCount} pages</span>}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
