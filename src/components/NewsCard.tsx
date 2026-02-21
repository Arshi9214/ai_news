import { useState } from 'react';
import { Bookmark, ExternalLink, ChevronDown, ChevronUp, Lightbulb, Loader2 } from 'lucide-react';
import { NewsArticle, Language } from '../App';

interface NewsCardProps {
  article: NewsArticle;
  language: Language;
  onToggleBookmark: (id: string) => void;
  isSummarizing?: boolean;
}

const TRANSLATIONS = {
  en: {
    readMore: 'Read More',
    keyTakeaways: 'Key Takeaways',
    bookmark: 'Bookmark',
    source: 'Source'
  },
  hi: {
    readMore: 'और पढ़ें',
    keyTakeaways: 'मुख्य बातें',
    bookmark: 'बुकमार्क',
    source: 'स्रोत'
  },
  ta: {
    readMore: 'மேலும் படிக்க',
    keyTakeaways: 'முக்கிய தகவல்கள்',
    bookmark: 'புக்மார்க்',
    source: 'மூலம்'
  },
  bn: {
    readMore: 'আরও পড়ুন',
    keyTakeaways: 'মূল বিষয়',
    bookmark: 'বুকমার্ক',
    source: 'উৎস'
  },
  te: {
    readMore: 'మరింత చదవండి',
    keyTakeaways: 'ముఖ్య విషయాలు',
    bookmark: 'బుక్‌మార్క్',
    source: 'మూలం'
  },
  mr: {
    readMore: 'अधिक वाचा',
    keyTakeaways: 'मुख्य मुद्दे',
    bookmark: 'बुकमार्क',
    source: 'स्रोत'
  },
  gu: {
    readMore: 'વધુ વાંચો',
    keyTakeaways: 'મુખ્ય મુદ્દાઓ',
    bookmark: 'બુકમાર્ક',
    source: 'સ્ત્રોત'
  },
  kn: {
    readMore: 'ಇನ್ನಷ್ಟು ಓದಿ',
    keyTakeaways: 'ಪ್ರಮುಖ ಅಂಶಗಳು',
    bookmark: 'ಬುಕ್‌ಮಾರ್ಕ್',
    source: 'ಮೂಲ'
  },
  ml: {
    readMore: 'കൂടുതൽ വായിക്കുക',
    keyTakeaways: 'പ്രധാന വശങ്ങൾ',
    bookmark: 'ബുക്ക്മാർക്ക്',
    source: 'ഉറവിടം'
  },
  pa: {
    readMore: 'ਹੋਰ ਪੜ੍ਹੋ',
    keyTakeaways: 'ਮੁੱਖ ਗੱਲਾਂ',
    bookmark: 'ਬੁਕਮਾਰਕ',
    source: 'ਸਰੋਤ'
  },
  ur: {
    readMore: 'مزید پڑھیں',
    keyTakeaways: 'اہم نکات',
    bookmark: 'بک مارک',
    source: 'ماخذ'
  }
};

export function NewsCard({ article, language, onToggleBookmark, isSummarizing = false }: NewsCardProps) {
  const t = TRANSLATIONS[language];
  const [showTakeaways, setShowTakeaways] = useState(false);

  const hasKeyTakeaways = article.analysis?.keyTakeaways && article.analysis.keyTakeaways.length > 0;
  const sourceName = article.source?.name || article.source || 
    (article.url ? new URL(article.url).hostname.replace('www.', '').replace('.com', '') : 'Unknown');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{sourceName}</span>
              <span>•</span>
              <span>{article.date.toLocaleDateString()}</span>
              {article.topics.length > 0 && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    {article.topics[0]}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onToggleBookmark(article.id)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t.bookmark}
          >
            <Bookmark
              className={`h-5 w-5 ${
                article.bookmarked
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            />
          </button>
        </div>

        {/* Summary */}
        {isSummarizing ? (
          <div className="flex items-center gap-2 mb-4 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        ) : article.summary ? (
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
            {article.summary}
          </p>
        ) : null}

        {/* Key Takeaways Collapsible */}
        {hasKeyTakeaways && (
          <div className="mb-4">
            <button
              onClick={() => setShowTakeaways(!showTakeaways)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors"
              style={{ minHeight: '44px' }} // Touch-friendly
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-300">
                  {t.keyTakeaways}
                </span>
              </div>
              {showTakeaways ? (
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              )}
            </button>
            
            {showTakeaways && (
              <div className="mt-2 p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg">
                <ul className="space-y-2">
                  {article.analysis.keyTakeaways.slice(0, 3).map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base">
                      <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
            style={{ minHeight: '44px' }} // Touch-friendly
          >
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.readMore}
          </a>
        </div>
      </div>
    </div>
  );
}