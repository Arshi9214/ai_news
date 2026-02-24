import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, BookOpen, FileText, Globe, Download, HelpCircle } from 'lucide-react';
import { Language, ThemeMode } from '../App';

interface OnboardingProps {
  language: Language;
  onComplete: () => void;
  themeMode?: ThemeMode;
}

interface OnboardingStep {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  icon: any;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    titleEn: 'Welcome to Your News Hub! 🎉',
    titleHi: 'आपके न्यूज़ हब में आपका स्वागत है! 🎉',
    descriptionEn: 'Get real-time India news with AI-powered summaries and key takeaways. Let\'s show you around quickly!',
    descriptionHi: 'AI-संचालित सारांश और मुख्य बातों के साथ वास्तविक समय भारत समाचार प्राप्त करें। आइए आपको जल्दी से दिखाते हैं!',
    icon: Sparkles
  },
  {
    id: 'news-feed',
    titleEn: 'Smart News Summaries',
    titleHi: 'स्मार्ट समाचार सारांश',
    descriptionEn: 'Each article shows a quick summary + 3 key takeaways. Perfect for exam preparation!',
    descriptionHi: 'प्रत्येक लेख एक त्वरित सारांश + 3 मुख्य बातें दिखाता है। परीक्षा की तैयारी के लिए एकदम सही!',
    icon: BookOpen,
    targetElement: 'news-cards',
    position: 'top'
  },
  {
    id: 'key-takeaways',
    titleEn: 'Key Takeaways Button',
    titleHi: 'मुख्य बातें बटन',
    descriptionEn: 'Tap the green button on any card to see the 3 most important points instantly.',
    descriptionHi: 'तुरंत 3 सबसे महत्वपूर्ण बिंदु देखने के लिए किसी भी कार्ड पर हरे बटन पर टैप करें।',
    icon: Sparkles,
    targetElement: 'news-cards',
    position: 'bottom'
  },
  {
    id: 'language',
    titleEn: 'Read in Your Language',
    titleHi: 'अपनी भाषा में पढ़ें',
    descriptionEn: 'Switch between English, हिंदी, and 9+ Indian languages. News and analysis adapt automatically!',
    descriptionHi: 'अंग्रेजी, हिंदी और 9+ भारतीय भाषाओं के बीच स्विच करें। समाचार और विश्लेषण स्वचालित रूप से अनुकूलित हो जाते हैं!',
    icon: Globe,
    targetElement: 'language-selector',
    position: 'bottom'
  },
  {
    id: 'pdf-upload',
    titleEn: 'Upload & Analyze PDFs',
    titleHi: 'PDF अपलोड और विश्लेषण करें',
    descriptionEn: 'Upload any PDF (even in Hindi!) for AI analysis with exam questions and key insights.',
    descriptionHi: 'परीक्षा प्रश्नों और मुख्य अंतर्दृष्टि के साथ AI विश्लेषण के लिए कोई भी PDF (हिंदी में भी!) अपलोड करें।',
    icon: FileText,
    targetElement: 'pdf-section',
    position: 'right'
  },
  {
    id: 'export',
    titleEn: 'Export Your Analysis',
    titleHi: 'अपना विश्लेषण निर्यात करें',
    descriptionEn: 'Download summaries and analyses as PDF for offline study. Perfect for revision!',
    descriptionHi: 'ऑफ़लाइन अध्ययन के लिए सारांश और विश्लेषण को PDF के रूप में डाउनलोड करें। रिवीजन के लिए एकदम सही!',
    icon: Download,
    targetElement: 'export-button',
    position: 'left'
  }
];

const TRANSLATIONS = {
  en: {
    skip: 'Skip',
    next: 'Next',
    previous: 'Previous',
    finish: 'Get Started!',
    helpButton: 'Need help? Click to restart tour',
    exploreSelf: 'I\'ll explore myself'
  },
  hi: {
    skip: 'छोड़ें',
    next: 'अगला',
    previous: 'पिछला',
    finish: 'शुरू करें!',
    helpButton: 'सहायता चाहिए? टूर पुनः शुरू करने के लिए क्लिक करें',
    exploreSelf: 'मैं खुद देखूंगा'
  }
};

export function Onboarding({ language, onComplete, themeMode }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(false);

  const t = TRANSLATIONS[language === 'hi' ? 'hi' : 'en'];
  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_completed');
    
    if (completed === 'true') {
      setHasCompletedOnboarding(true);
      setShowHelpButton(true);
    } else {
      // Show onboarding after a short delay for smooth entry
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    setShowHelpButton(true);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestartTour = () => {
    setCurrentStep(0);
    setHasCompletedOnboarding(false);
    setIsVisible(true);
    setShowHelpButton(false);
  };

  // Floating help button
  if (showHelpButton && !isVisible) {
    return (
      <button
        onClick={handleRestartTour}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all hover:scale-110 group ${
          themeMode === 'newspaper'
            ? 'bg-[#8b7355] hover:bg-[#6b5744] text-[#f9f3e8]'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        aria-label={t.helpButton}
        title={t.helpButton}
      >
        <HelpCircle className="h-6 w-6" />
        <span className={`absolute bottom-full right-0 mb-2 px-3 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
          themeMode === 'newspaper'
            ? 'bg-[#3d2817] text-[#f9f3e8]'
            : 'bg-gray-900 text-white'
        }`}>
          {t.helpButton}
        </span>
      </button>
    );
  }

  if (!isVisible || hasCompletedOnboarding) {
    return null;
  }

  const Icon = step.icon;
  const title = language === 'hi' ? step.titleHi : step.titleEn;
  const description = language === 'hi' ? step.descriptionHi : step.descriptionEn;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 fade-in duration-300 border-2 ${
          themeMode === 'newspaper'
            ? 'bg-[#f9f3e8] border-[#8b7355]'
            : 'bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-400'
        }`}>
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t.skip}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                themeMode === 'newspaper'
                  ? 'bg-[#8b7355]'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                <Icon className={`h-7 w-7 ${
                  themeMode === 'newspaper' ? 'text-[#f9f3e8]' : 'text-white'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${
                  themeMode === 'newspaper' ? 'text-[#2c1810]' : 'text-gray-900 dark:text-white'
                }`}>
                  {title}
                </h3>
              </div>
            </div>
            
            <p className={`leading-relaxed ${
              themeMode === 'newspaper' ? 'text-[#3d2817]' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? themeMode === 'newspaper' ? 'w-8 bg-[#8b7355]' : 'w-8 bg-blue-600 dark:bg-blue-500'
                      : index < currentStep
                      ? 'w-2 bg-green-500'
                      : themeMode === 'newspaper' ? 'w-2 bg-[#ddd0ba]' : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex items-center justify-between gap-3">
            {isFirstStep ? (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t.exploreSelf}
              </button>
            ) : (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.previous}
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all hover:scale-105 shadow-lg ${
                themeMode === 'newspaper'
                  ? 'bg-[#8b7355] hover:bg-[#6b5744] text-[#f9f3e8]'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              {isLastStep ? t.finish : t.next}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Spotlight effect on target elements */}
      {step.targetElement && (
        <div 
          className="fixed z-45 pointer-events-none"
          style={{
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          {/* This would highlight the target element - implement based on your layout */}
        </div>
      )}
    </>
  );
}

/**
 * Hook to check onboarding status
 */
export function useOnboardingStatus() {
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setHasCompleted(completed);
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setHasCompleted(false);
  };

  return { hasCompleted, resetOnboarding };
}
