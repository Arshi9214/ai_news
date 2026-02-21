import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ProcessedPDF, AnalysisDepth, Language } from '../App';
import { extractTextFromPDF, analyzePDFContent as analyzePDFStructure } from '../utils/pdfParser';
import { analyzeContentWithAI } from '../utils/aiAnalyzer';
import { toast } from 'sonner';

interface PDFProcessorProps {
  language: Language;
  analysisDepth: AnalysisDepth;
  onPDFProcessed: (pdf: ProcessedPDF) => void;
  processedPDFs: ProcessedPDF[];
  onViewAnalysis: (pdf: ProcessedPDF) => void;
  onDeletePDF: (id: string) => void;
}

const TRANSLATIONS = {
  en: {
    title: 'PDF Analysis',
    subtitle: 'Upload and analyze research papers, reports, and study materials',
    uploadArea: 'Drop PDF files here or click to browse',
    uploadButton: 'Upload PDFs',
    processing: 'Processing...',
    processed: 'Processed PDFs',
    noPDFs: 'No PDFs uploaded yet. Start by uploading your study materials.',
    viewAnalysis: 'View Analysis',
    delete: 'Delete',
    pages: 'pages',
    uploadedOn: 'Uploaded on',
    supportedFormats: 'Supported: PDF files up to 50MB',
    extracting: 'Extracting text and analyzing content...'
  },
  hi: {
    title: 'पीडीएफ विश्लेषण',
    subtitle: 'शोध पत्र, रिपोर्ट और अध्ययन सामग्री अपलोड और विश्लेषण करें',
    uploadArea: 'पीडीएफ फाइलें यहां छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
    uploadButton: 'पीडीएफ अपलोड करें',
    processing: 'प्रसंस्करण...',
    processed: 'प्रसंस्कृत पीडीएफ',
    noPDFs: 'अभी तक कोई पीडीएफ अपलोड नहीं किया गया। अपनी अध्ययन सामग्री अपलोड करके शुरू करें।',
    viewAnalysis: 'विश्लेषण देखें',
    delete: 'हटाएं',
    pages: 'पृष्ठ',
    uploadedOn: 'अपलोड किया गया',
    supportedFormats: 'समर्थित: 50MB तक की पीडीएफ फाइलें',
    extracting: 'टेक्स्ट निकालना और सामग्री का विश्लेषण...'
  },
  ta: {
    title: 'PDF பகுப்பாய்வு',
    subtitle: 'ஆராய்ச்சி கட்டுரைகள், அறிக்கைகள் மற்றும் படிப்பு பொருட்களை பதிவேற்றவும் மற்றும் பகுப்பாய்வு செய்யவும்',
    uploadArea: 'PDF கோப்புகளை இங்கே இடவும் அல்லது உலாவ கிளிக் செய்யவும்',
    uploadButton: 'PDF பதிவேற்றவும்',
    processing: 'செயலாக்கம்...',
    processed: 'செயலாக்கப்பட்ட PDF கள்',
    noPDFs: 'இன்னும் PDF பதிவேற்றப்படவில்லை. உங்கள் படிப்பு பொருட்களை பதிவேற்றுவதன் மூலம் தொடங்கவும்.',
    viewAnalysis: 'பகுப்பாய்வைக் காண்க',
    delete: 'நீக்கு',
    pages: 'பக்கங்கள்',
    uploadedOn: 'பதிவேற்றப்பட்டது',
    supportedFormats: 'ஆதரவு: 50MB வரை PDF கோப்புகள்',
    extracting: 'உரையை பிரித்தெடுத்தல் மற்றும் உள்ளடக்கத்தை பகுப்பாய்வு செய்தல்...'
  },
  bn: {
    title: 'PDF বিশ্লেষণ',
    subtitle: 'গবেষণা পত্র, রিপোর্ট এবং অধ্যয়ন উপকরণ আপলোড এবং বিশ্লেষণ করুন',
    uploadArea: 'PDF ফাইল এখানে ফেলুন বা ব্রাউজ করতে ক্লিক করুন',
    uploadButton: 'PDF আপলোড করুন',
    processing: 'প্রক্রিয়াকরণ...',
    processed: 'প্রক্রিয়াকৃত PDF',
    noPDFs: 'এখনও কোনো PDF আপলোড করা হয়নি। আপনার অধ্যয়ন উপকরণ আপলোড করে শুরু করুন।',
    viewAnalysis: 'বিশ্লেষণ দেখুন',
    delete: 'মুছুন',
    pages: 'পৃষ্ঠা',
    uploadedOn: 'আপলোড করা হয়েছে',
    supportedFormats: 'সমর্থিত: 50MB পর্যন্ত PDF ফাইল',
    extracting: 'টেক্সট নিষ্কাশন এবং বিষয়বস্তু বিশ্লেষণ...'
  },
  te: {
    title: 'PDF విశ్లేషణ',
    subtitle: 'పరిశోధనా పత్రాలు, నివేదికలు మరియు అధ్యయన పదార్థాలను అప్‌లోడ్ చేయండి మరియు విశ్లేషించండి',
    uploadArea: 'PDF ఫైల్‌లను ఇక్కడ వదలండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
    uploadButton: 'PDFలను అప్‌లోడ్ చేయండి',
    processing: 'ప్రాసెస్ చేస్తోంది...',
    processed: 'ప్రాసెస్ చేసిన PDFలు',
    noPDFs: 'ఇంకా PDF అప్‌లోడ్ చేయబడలేదు. మీ అధ్యయన పదార్థాలను అప్‌లోడ్ చేయడం ద్వారా ప్రారంభించండి.',
    viewAnalysis: 'విశ్లేషణ చూడండి',
    delete: 'తొలగించు',
    pages: 'పేజీలు',
    uploadedOn: 'అప్‌లోడ్ చేసినది',
    supportedFormats: 'మద్దతు: 50MB వరకు PDF ఫైల్‌లు',
    extracting: 'టెక్స్ట్ సంగ్రహించడం మరియు కంటెంట్ విశ్లేషించడం...'
  },
  mr: {
    title: 'PDF विश्लेषण',
    subtitle: 'संशोधन पत्रे, अहवाल आणि अभ्यास साहित्य अपलोड आणि विश्लेषण करा',
    uploadArea: 'PDF फाइल्स येथे टाका किंवा ब्राउझ करण्यासाठी क्लिक करा',
    uploadButton: 'PDF अपलोड करा',
    processing: 'प्रक्रिया करत आहे...',
    processed: 'प्रक्रिया केलेले PDF',
    noPDFs: 'अद्याप कोणतेही PDF अपलोड केलेले नाही. तुमची अभ्यास साहित्ये अपलोड करून सुरुवात करा.',
    viewAnalysis: 'विश्लेषण पहा',
    delete: 'हटवा',
    pages: 'पृष्ठे',
    uploadedOn: 'अपलोड केले',
    supportedFormats: 'समर्थित: 50MB पर्यंत PDF फाइल्स',
    extracting: 'मजकूर काढणे आणि सामग्री विश्लेषण...'
  },
  gu: {
    title: 'PDF વિશ્લેષણ',
    subtitle: 'સંશોધન પત્રો, અહેવાલો અને અભ્યાસ સામગ્રી અપલોડ કરો અને વિશ્લેષણ કરો',
    uploadArea: 'PDF ફાઇલો અહીં છોડો અથવા બ્રાઉઝ કરવા માટે ક્લિક કરો',
    uploadButton: 'PDF અપલોડ કરો',
    processing: 'પ્રોસેસિંગ...',
    processed: 'પ્રોસેસ થયેલ PDF',
    noPDFs: 'હજુ સુધી કોઈ PDF અપલોડ થયેલ નથી. તમારી અભ્યાસ સામગ્રી અપલોડ કરીને શરૂ કરો.',
    viewAnalysis: 'વિશ્લેષણ જુઓ',
    delete: 'કાઢી નાખો',
    pages: 'પૃષ્ઠો',
    uploadedOn: 'અપલોડ થયું',
    supportedFormats: 'સમર્થિત: 50MB સુધી PDF ફાઇલો',
    extracting: 'ટેક્સ્ટ કાઢવું અને સામગ્રી વિશ્લેષણ...'
  },
  kn: {
    title: 'PDF ವಿಶ್ಲೇಷಣೆ',
    subtitle: 'ಸಂಶೋಧನಾ ಪತ್ರಿಕೆಗಳು, ವರದಿಗಳು ಮತ್ತು ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ',
    uploadArea: 'PDF ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಬಿಡಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    uploadButton: 'PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    processing: 'ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...',
    processed: 'ಪ್ರಕ್ರಿೆಗೊಳಿಸಿದ PDF ಗಳು',
    noPDFs: 'ಇನ್ನೂ ಯಾವುದೇ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ. ನಿಮ್ಮ ಅಧ್ಯಯನ ಸಾಮಗ್ರಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ.',
    viewAnalysis: 'ವಿಶ್ಲೇಷಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    pages: 'ಪುಟಗಳು',
    uploadedOn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ',
    supportedFormats: 'ಬೆಂಬಲಿತ: 50MB ವರೆಗಿನ PDF ಫೈಲ್‌ಗಳು',
    extracting: 'ಪಠ್ಯ ಹೊರತೆಗೆಯುವುದು ಮತ್ತು ವಿಷಯ ವಿಶ್ಲೇಷಣೆ...'
  },
  ml: {
    title: 'PDF വിശകലനം',
    subtitle: 'ഗവേഷണ പ്രബന്ധങ്ങൾ, റിപ്പോർട്ടുകൾ, പഠന സാമഗ്രികൾ എന്നിവ അപ്‌ലോഡ് ചെയ്ത് വിശകലനം ചെയ്യുക',
    uploadArea: 'PDF ഫയലുകൾ ഇവിടെ ഇടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക',
    uploadButton: 'PDF അപ്‌ലോഡ് ചെയ്യുക',
    processing: 'പ്രോസസ്സ് ചെയ്യുന്നു...',
    processed: 'പ്രോസസ് ചെയ്ത PDF കൾ',
    noPDFs: 'ഇതുവരെ PDF അപ്‌ലോഡ് ചെയ്തിട്ടില്ല. നിങ്ങളുടെ പഠന സാമഗ്രികൾ അപ്‌ലോഡ് ചെയ്തുകൊണ്ട് ആരംഭിക്കുക.',
    viewAnalysis: 'വിശകലനം കാണുക',
    delete: 'ഇല്ലാതാക്കുക',
    pages: 'പേജുകൾ',
    uploadedOn: 'അപ്‌ലോഡ് ചെയ്തത്',
    supportedFormats: 'പിന്തുണ: 50MB വരെയുള്ള PDF ഫയലുകൾ',
    extracting: 'ടെക്സ്റ്റ് എക്സ്ട്രാക്ട് ചെയ്യുകയും ഉള്ളടക്കം വിശകലനം ചെയ്യുകയും ചെയ്യുന്നു...'
  },
  pa: {
    title: 'PDF ਵਿਸ਼ਲੇਸ਼ਣ',
    subtitle: 'ਖੋਜ ਪੱਤਰ, ਰਿਪੋਰਟਾਂ ਅਤੇ ਅਧਿਐਨ ਸਮੱਗਰੀ ਅੱਪਲੋਡ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
    uploadArea: 'PDF ਫਾਈਲਾਂ ਇੱਥੇ ਛੱਡੋ ਜਾਂ ਬ੍ਰਾਊਜ਼ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
    uploadButton: 'PDF ਅੱਪਲੋਡ ਕਰੋ',
    processing: 'ਪ੍ਰੋਸੈਸਿੰਗ...',
    processed: 'ਪ੍ਰੋਸੈਸ ਕੀਤੇ PDF',
    noPDFs: 'ਅਜੇ ਤੱਕ ਕੋਈ PDF ਅੱਪਲੋਡ ਨਹੀਂ ਕੀਤਾ ਗਿਆ। ਆਪਣੀ ਅਧਿਐਨ ਸਮੱਗਰੀ ਅੱਪਲੋਡ ਕਰਕੇ ਸ਼ੁਰੂ ਕਰੋ।',
    viewAnalysis: 'ਵਿਸ਼ਲੇਸ਼ਣ ਦੇਖੋ',
    delete: 'ਮਿਟਾਓ',
    pages: 'ਪੰਨੇ',
    uploadedOn: 'ਅੱਪਲੋਡ ਕੀਤਾ ਗਿਆ',
    supportedFormats: 'ਸਮਰਥਿਤ: 50MB ਤੱਕ PDF ਫਾਈਲਾਂ',
    extracting: 'ਟੈਕਸਟ ਕੱਢਣਾ ਅਤੇ ਸਮੱਗਰੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ...'
  },
  ur: {
    title: 'PDF تجزیہ',
    subtitle: 'تحقیقی مقالے، رپورٹیں اور مطالعاتی مواد اپ لوڈ اور تجزیہ کریں',
    uploadArea: 'PDF فائلیں یہاں چھوڑیں یا براؤز کرنے کے لیے کلک کریں',
    uploadButton: 'PDF اپ لوڈ کریں',
    processing: 'پروسیسنگ...',
    processed: 'پروسیس شدہ PDF',
    noPDFs: 'ابھی تک کوئی PDF اپ لوڈ نہیں ہوا۔ اپنے مطالعاتی مواد کو اپ لوڈ کر کے شروع کریں۔',
    viewAnalysis: 'تجزیہ دیکھیں',
    delete: 'حذف کریں',
    pages: 'صفحات',
    uploadedOn: 'اپ لوڈ کیا گیا',
    supportedFormats: 'تعاون یافتہ: 50MB تک PDF فائلیں',
    extracting: 'متن نکالنا اور مواد کا تجزیہ کرنا...'
  }
};

export function PDFProcessor({
  language,
  analysisDepth,
  onPDFProcessed,
  processedPDFs,
  onViewAnalysis,
  onDeletePDF
}: PDFProcessorProps) {
  const t = TRANSLATIONS[language];
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setProcessing(true);
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        try {
          // Check file size (50MB limit)
          const MAX_SIZE = 50 * 1024 * 1024; // 50MB
          if (file.size > MAX_SIZE) {
            toast.error(`${file.name} is too large. Maximum size is 50MB.`);
            continue;
          }

          toast.info(`Processing ${file.name}...`);
          
          // Extract text from PDF using real PDF.js parser
          const pdfResult = await extractTextFromPDF(file);
          
          // Analyze PDF structure
          const structureAnalysis = analyzePDFStructure(pdfResult.text);
          
          toast.info(`Analyzing content with AI (${structureAnalysis.wordCount} words)...`);
          
          // Analyze content with AI
          const analysis = await analyzeContentWithAI({
            content: pdfResult.text,
            depth: analysisDepth,
            language,
            context: 'pdf'
          });
          
          const pdf: ProcessedPDF = {
            id: Math.random().toString(36).substr(2, 9) + Date.now(),
            name: file.name,
            content: pdfResult.text,
            uploadDate: new Date(),
            pageCount: pdfResult.pageCount,
            analysis
          };
          
          onPDFProcessed(pdf);
          toast.success(`Successfully processed ${file.name}!`);
          
        } catch (error: any) {
          console.error('Error processing PDF:', error);
          toast.error(`Failed to process ${file.name}: ${error.message}`);
        }
      } else {
        toast.error(`${file.name} is not a valid PDF file.`);
      }
    }
    
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="p-12 text-center">
          {processing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t.processing}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.extracting}</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{t.uploadArea}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.supportedFormats}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                {t.uploadButton}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Processed PDFs List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.processed}</h3>
        
        {processedPDFs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t.noPDFs}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {processedPDFs.map(pdf => (
              <div
                key={pdf.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{pdf.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{pdf.uploadDate.toLocaleDateString()}</span>
                      {pdf.pageCount && <span>{pdf.pageCount} {t.pages}</span>}
                    </div>
                    
                    {pdf.analysis && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Analysis complete</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onViewAnalysis(pdf)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        {t.viewAnalysis}
                      </button>
                      <button
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
                        aria-label={t.delete}
                        onClick={() => onDeletePDF(pdf.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}