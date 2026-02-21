import {
  ArrowLeft,
  Download,
  Share2,
  Lightbulb,
  Target,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Check,
} from "lucide-react";
import { NewsArticle, ProcessedPDF, Language } from "../App";
import { toast } from "sonner";

interface AnalysisViewerProps {
  item: NewsArticle | ProcessedPDF;
  language: Language;
  onBack: () => void;
}

const TRANSLATIONS = {
  en: {
    back: "Back",
    summary: "Summary",
    keyTakeaways: "Key Takeaways",
    examRelevance: "Exam Relevance",
    importantFacts: "Important Facts & Statistics",
    potentialQuestions: "Potential Exam Questions",
    policyImplications: "Policy Implications",
    relatedTopics: "Related Topics",
    sentiment: "Sentiment Analysis",
    export: "Export Analysis",
    share: "Share",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    source: "Source",
    date: "Date",
    content: "Full Content",
  },
  hi: {
    back: "वापस",
    summary: "सारांश",
    keyTakeaways: "मुख्य बातें",
    examRelevance: "परीक्षा प्रासंगिकता",
    importantFacts: "महत्वपूर्ण तथ्य और आंकड़े",
    potentialQuestions: "संभावित परीक्षा प्रश्न",
    policyImplications: "नीति निहितार्थ",
    relatedTopics: "संबंधित विषय",
    sentiment: "भावना विश्लेषण",
    export: "विश्लेषण निर्यात करें",
    share: "साझा करें",
    positive: "सकारात्मक",
    neutral: "तटस्थ",
    negative: "नकारात्मक",
    source: "स्रोत",
    date: "तिथि",
    content: "पूरा लेख",
  },
  ta: {
    back: "மீண்டும்",
    summary: "சுருக்கம்",
    keyTakeaways: "முக்கிய தகவல்கள்",
    examRelevance: "தேர்வு தொடர்பு",
    importantFacts:
      "முக்கியமான உண்மைகள் மற்றும் புள்ளிவிவரங்கள்",
    potentialQuestions: "சாத்தியமான தேர்வு கேள்விகள்",
    policyImplications: "கொள்கை தாக்கங்கள்",
    relatedTopics: "தொடர்புடைய தலைப்புகள்",
    sentiment: "உணர்வு பகுப்பாய்வு",
    export: "பகுப்பாய்வை ஏற்றுமதி செய்",
    share: "பகிர்",
    positive: "நேர்மறை",
    neutral: "நடுநிலை",
    negative: "எதிர்மறை",
    source: "மூலம்",
    date: "தேதி",
    content: "முழு உள்ளடக்கம்",
  },
  bn: {
    back: "ফিরে যান",
    summary: "সারাংশ",
    keyTakeaways: "মূল বিষয়",
    examRelevance: "পরীক্ষার প্রাসঙ্গিকতা",
    importantFacts: "গুরুত্বপূর্ণ তথ্য ও পরিসংখ্যান",
    potentialQuestions: "সম্ভাব্য পরীক্ষার প্রশ্ন",
    policyImplications: "নীতির প্রভাব",
    relatedTopics: "সম্পর্কিত বিষয়",
    sentiment: "অনুভূতি বিশ্লেষণ",
    export: "বিশ্লেষণ রপ্তানি করুন",
    share: "শেয়ার করুন",
    positive: "ইতিবাচক",
    neutral: "নিরপেক্ষ",
    negative: "নেতিবাচক",
    source: "উৎস",
    date: "তারিখ",
    content: "সম্পূর্ণ বিষয়বস্তু",
  },
  te: {
    back: "వెనక్కి",
    summary: "సారాంశం",
    keyTakeaways: "ముఖ్య విషయాలు",
    examRelevance: "పరీక్ష సంబంధం",
    importantFacts: "ముఖ్యమైన వాస్తవాలు మరియు గణాంకాలు",
    potentialQuestions: "సంభావ్య పరీక్ష ప్రశ్నలు",
    policyImplications: "విధాన చిక్కులు",
    relatedTopics: "సంబంధిత అంశాలు",
    sentiment: "సెంటిమెంట్ విశ్లేషణ",
    export: "విశ్లేషణను ఎగుమతి చేయండి",
    share: "షేర్ చేయండి",
    positive: "సానుకూల",
    neutral: "తటస్థ",
    negative: "ప్రతికూల",
    source: "మూలం",
    date: "తేదీ",
    content: "పూర్తి కంటెంట్",
  },
  mr: {
    back: "मागे",
    summary: "सारांश",
    keyTakeaways: "मुख्य मुद्दे",
    examRelevance: "परीक्षा प्रासंगिकता",
    importantFacts: "महत्त्वाची तथ्ये आणि आकडेवारी",
    potentialQuestions: "संभाव्य परीक्षा प्रश्न",
    policyImplications: "धोरण परिणाम",
    relatedTopics: "संबंधित विषय",
    sentiment: "भावना विश्लेषण",
    export: "विश्लेषण निर्यात करा",
    share: "सामायिक करा",
    positive: "सकारात्मक",
    neutral: "तटस्थ",
    negative: "नकारात्मक",
    source: "स्रोत",
    date: "तारीख",
    content: "संपूर्ण सामग्री",
  },
  gu: {
    back: "પાછળ",
    summary: "સારાંશ",
    keyTakeaways: "મુખ્ય મુદ્દાઓ",
    examRelevance: "પરીક્ષા સંબંધિતતા",
    importantFacts: "મહત્વપૂર્ણ તથ્યો અને આંકડા",
    potentialQuestions: "સંભવિત પરીક્ષા પ્રશ્નો",
    policyImplications: "નીતિ અસરો",
    relatedTopics: "સંબંધિત વિષયો",
    sentiment: "સેન્ટિમેન્ટ વિશ્લેષણ",
    export: "વિશ્લેષણ નિકાસ કરો",
    share: "શેર કરો",
    positive: "હકારાત્મક",
    neutral: "તટસ્થ",
    negative: "નકારાત્મક",
    source: "સ્ત્રોત",
    date: "તારીખ",
    content: "સંપૂર્ણ સામગ્રી",
  },
  kn: {
    back: "ಹಿಂದೆ",
    summary: "ಸಾರಾಂಶ",
    keyTakeaways: "ಪ್ರಮುಖ ಅಂಶಗಳು",
    examRelevance: "ಪರೀಕ್ಷೆಯ ಪ್ರಸ್ತುತತೆ",
    importantFacts: "ಪ್ರಮುಖ ಸತ್ಯಗಳು ಮತ್ತು ಅಂಕಿಅಂಶಗಳು",
    potentialQuestions: "ಸಂಭಾವ್ಯ ಪರೀಕ್ಷೆ ಪ್ರಶ್ನೆಗಳು",
    policyImplications: "ನೀತಿ ಪರಿಣಾಮಗಳು",
    relatedTopics: "ಸಂಬಂಧಿತ ವಿಷಯಗಳು",
    sentiment: "ಭಾವನಾ ವಿಶ್ಲೇಷಣೆ",
    export: "ವಿಶ್ಲೇಷಣೆಯನ್ನು ರಫ್ತು ಮಾಡಿ",
    share: "ಹಂಚಿಕೊಳ್ಳಿ",
    positive: "ಧನಾತ್ಮಕ",
    neutral: "ತಟಸ್ಥ",
    negative: "ಋಣಾತ್ಮಕ",
    source: "ಮೂಲ",
    date: "ದಿನಾಂಕ",
    content: "ಸಂಪೂರ್ಣ ವಿಷಯ",
  },
  ml: {
    back: "തിരികെ",
    summary: "സംഗ്രഹം",
    keyTakeaways: "പ്രധാന വശങ്ങൾ",
    examRelevance: "പരീക്ഷാ പ്രസക്തി",
    importantFacts: "പ്രധാന വസ്തുതകളും സ്ഥിതിവിവരക്കണക്കുകളും",
    potentialQuestions: "സാധ്യമായ പരീക്ഷാ ചോദ്യങ്ങൾ",
    policyImplications: "നയ പ്രത്യാഘാതങ്ങൾ",
    relatedTopics: "ബന്ധപ്പെട്ട വിഷയങ്ങൾ",
    sentiment: "വികാര വിശകലനം",
    export: "വിശകലനം കയറ്റുമതി ചെയ്യുക",
    share: "പങ���കിടുക",
    positive: "പോസിറ്റീവ്",
    neutral: "നിഷ്പക്ഷ",
    negative: "നെഗറ്റീവ്",
    source: "ഉറവിടം",
    date: "തീയതി",
    content: "മുഴുവൻ ഉള്ളടക്കവും",
  },
  pa: {
    back: "ਵਾਪਸ",
    summary: "ਸੰਖੇਪ",
    keyTakeaways: "ਮੁੱਖ ਗੱਲਾਂ",
    examRelevance: "ਪ੍ਰੀਖਿਆ ਸਬੰਧਤਤਾ",
    importantFacts: "ਮਹੱਤਵਪੂਰਨ ਤੱਥ ਅਤੇ ਅੰਕੜੇ",
    potentialQuestions: "ਸੰਭਾਵਿਤ ਪ੍ਰੀਖਿਆ ਸਵਾਲ",
    policyImplications: "ਨੀਤੀ ਪ੍ਰਭਾਵ",
    relatedTopics: "ਸਬੰਧਤ ਵਿਸ਼ੇ",
    sentiment: "ਭਾਵਨਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    export: "ਵਿਸ਼ਲੇਸ਼ਣ ਐਕਸਪੋਰਟ ਕਰੋ",
    share: "ਸਾਂਝਾ ਕਰੋ",
    positive: "ਸਕਾਰਾਤਮਕ",
    neutral: "ਨਿਰਪੱਖ",
    negative: "ਨਕਾਰਾਤਮਕ",
    source: "ਸਰੋਤ",
    date: "ਤਾਰੀਖ",
    content: "ਪੂਰੀ ਸਮੱਗਰੀ",
  },
  ur: {
    back: "واپس",
    summary: "خلاصہ",
    keyTakeaways: "اہم نکات",
    examRelevance: "امتحانی مطابقت",
    importantFacts: "اہم حقائق اور اعداد و شمار",
    potentialQuestions: "ممکنہ امتحانی سوالات",
    policyImplications: "پالیسی کے اثرات",
    relatedTopics: "متعلقہ موضوعات",
    sentiment: "جذباتی تجزیہ",
    export: "تجزیہ برآمد کریں",
    share: "شیئر کریں",
    positive: "مثبت",
    neutral: "غیر جانبدار",
    negative: "منفی",
    source: "ماخذ",
    date: "تاریخ",
    content: "مکمل مواد",
  },
};

const sentimentColors = {
  positive:
    "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  neutral:
    "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
  negative:
    "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

export function AnalysisViewer({
  item,
  language,
  onBack,
}: AnalysisViewerProps) {
  const t = TRANSLATIONS[language];
  const isArticle = "source" in item;
  const analysis = item.analysis;

  const handleExport = () => {
    const exportData = {
      title: isArticle ? item.title : item.name,
      date: isArticle ? item.date : item.uploadDate,
      ...(isArticle && { source: item.source }),
      analysis: analysis,
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const title = isArticle ? item.title : item.name;
    const shareText = `${title}\n\n${analysis?.summary || ''}\n\n` +
      `Key Takeaways:\n${analysis?.keyTakeaways?.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n') || ''}`;
    
    // Try using the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: isArticle && item.url ? item.url : window.location.href
        });
        toast.success('Shared successfully!');
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackCopyToClipboard(shareText);
        }
      }
    } else {
      // Fallback to copying to clipboard
      fallbackCopyToClipboard(shareText);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Analysis copied to clipboard!', {
          description: 'You can now paste and share it anywhere.'
        });
      },
      (error) => {
        console.error('Could not copy text:', error);
        toast.error('Failed to copy to clipboard');
      }
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isArticle ? item.title : item.name}
          </h2>
          {isArticle && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {t.source}: {item.source}
              </span>
              <span>
                {t.date}: {item.date.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.export}
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t.share}
          </button>
        </div>
      </div>

      {/* Analysis Sections */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t.summary}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Key Takeaways */}
          {analysis.keyTakeaways &&
            analysis.keyTakeaways.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.keyTakeaways}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {analysis.keyTakeaways.map(
                    (takeaway, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-blue-600 dark:text-blue-400 mt-1">
                          •
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {takeaway}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Exam Relevance */}
          {analysis.examRelevance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t.examRelevance}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.examRelevance}
              </p>
            </div>
          )}

          {/* Important Facts */}
          {analysis.importantFacts &&
            analysis.importantFacts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.importantFacts}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {analysis.importantFacts.map(
                    (fact, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-xs font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {fact}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Potential Questions */}
          {analysis.potentialQuestions &&
            analysis.potentialQuestions.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.potentialQuestions}
                  </h3>
                </div>
                <ol className="space-y-3">
                  {analysis.potentialQuestions.map(
                    (question, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-sm font-semibold mt-0.5">
                          Q{index + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">
                          {question}
                        </span>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            )}

          {/* Policy Implications */}
          {analysis.policyImplications &&
            analysis.policyImplications.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.policyImplications}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {analysis.policyImplications.map(
                    (implication, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-purple-600 dark:text-purple-400 mt-1">
                          ▸
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {implication}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}