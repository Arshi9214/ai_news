import { useState, useEffect } from 'react';
import { NewsAggregator } from './components/NewsAggregator';
import { PDFProcessor } from './components/PDFProcessor';
import { AnalysisViewer } from './components/AnalysisViewer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { MobileMenu } from './components/MobileMenu';
import { UserAuth } from './components/UserAuth';
import { toast, Toaster } from 'sonner';
import DatabaseService from './utils/database';
import { useArticles, usePreferences } from './hooks/useDatabase';
import { UserManager, User } from './utils/userManager';
import { translateArticles, translatePDFs } from './utils/translator';

export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'ur';
export type Topic = 'economy' | 'polity' | 'environment' | 'international' | 'science' | 'society' | 'history' | 'geography' | 'all';
export type AnalysisDepth = 'basic' | 'advanced';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string | { name: string };
  date: Date;
  topics: Topic[];
  language: Language;
  url?: string;
  imageUrl?: string;
  summary?: string;
  analysis?: ArticleAnalysis;
  bookmarked?: boolean;
  hasRealContent?: boolean;
  originalTitle?: string;
  originalContent?: string;
  originalSummary?: string;
  translations?: Partial<Record<Language, { title: string; content: string }>>;
}

export interface ArticleAnalysis {
  summary: string;
  keyTakeaways: string[];
  examRelevance: string;
  relatedTopics: Topic[];
  importantFacts: string[];
  potentialQuestions: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  policyImplications?: string[];
}

export interface ProcessedPDF {
  id: string;
  name: string;
  content: string;
  uploadDate: Date;
  analysis?: ArticleAnalysis;
  pageCount?: number;
  bookmarked?: boolean;
}

export type ViewMode = 'dashboard' | 'news' | 'pdf' | 'analysis';
export type ThemeMode = 'light' | 'dark' | 'newspaper';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(['all']);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [processedPDFs, setProcessedPDFs] = useState<ProcessedPDF[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsArticle | ProcessedPDF | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isTranslating, setIsTranslating] = useState(false);

  // Check for existing user on app start
  useEffect(() => {
    const user = UserManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Database hooks
  const { articles: dbArticles, saveArticles, toggleBookmark: dbToggleBookmark } = useArticles();
  const { preferences, savePreferences } = usePreferences();

  // Don't load articles from database - news feed is temporary

  // Load PDFs from database
  useEffect(() => {
    const loadPDFs = async () => {
      try {
        const pdfs = await DatabaseService.getPDFs();
        setProcessedPDFs(pdfs);
      } catch (error) {
        console.error('Failed to load PDFs:', error);
      }
    };
    if (currentUser) {
      loadPDFs();
    }
  }, [currentUser]);

  // Load preferences on startup
  useEffect(() => {
    if (preferences) {
      setLanguage(preferences.language);
      setSelectedTopics(preferences.selectedTopics);
      setThemeMode(preferences.themeMode);
    }
  }, [preferences]);

  // Save preferences when they change
  useEffect(() => {
    if (preferences) {
      savePreferences({
        language,
        selectedTopics,
        themeMode,
        analysisDepth: 'basic'
      });
    }
  }, [language, selectedTopics, themeMode, preferences, savePreferences]);

  // Auto-translate content when language changes
  useEffect(() => {
    const translateContent = async () => {
      if (language === 'en' || articles.length === 0) return;
      
      setIsTranslating(true);
      try {
        await translateArticles(articles, language);
        await translatePDFs(processedPDFs, language);
        setArticles([...articles]);
        setProcessedPDFs([...processedPDFs]);
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateContent();
  }, [language]);

  const toggleBookmark = async (articleId: string) => {
    // Update local state immediately for better UX
    setArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, bookmarked: !article.bookmarked }
          : article
      )
    );
    
    // Save to database
    try {
      await dbToggleBookmark(articleId);
    } catch (error) {
      console.error('Failed to save bookmark to database:', error);
      // Revert local state on error
      setArticles(prev =>
        prev.map(article =>
          article.id === articleId
            ? { ...article, bookmarked: !article.bookmarked }
            : article
        )
      );
      toast.error('Failed to save bookmark');
    }
  };

  const togglePDFBookmark = async (pdfId: string) => {
    setProcessedPDFs(prev =>
      prev.map(pdf =>
        pdf.id === pdfId
          ? { ...pdf, bookmarked: !pdf.bookmarked }
          : pdf
      )
    );
    
    try {
      await DatabaseService.togglePDFBookmark(pdfId);
      // Reload PDFs to get updated data
      const pdfs = await DatabaseService.getPDFs();
      setProcessedPDFs(pdfs);
    } catch (error) {
      console.error('Failed to save PDF bookmark:', error);
      setProcessedPDFs(prev =>
        prev.map(pdf =>
          pdf.id === pdfId
            ? { ...pdf, bookmarked: !pdf.bookmarked }
            : pdf
        )
      );
      toast.error('Failed to save bookmark');
    }
  };

  const addArticles = async (newArticles: NewsArticle[] | ((prev: NewsArticle[]) => NewsArticle[])) => {
    console.log('📥 addArticles called with:', typeof newArticles === 'function' ? 'function' : `${newArticles.length} articles`);
    
    if (typeof newArticles === 'function') {
      setArticles(prev => {
        const updated = newArticles(prev);
        console.log('✅ Function update: prev had', prev.length, 'now has', updated.length);
        return updated;
      });
    } else {
      console.log('✅ Setting articles to:', newArticles.length);
      setArticles(newArticles);
    }
  };

  const addProcessedPDF = async (pdf: ProcessedPDF) => {
    setProcessedPDFs(prev => [pdf, ...prev]);
    
    // Save to database
    try {
      await DatabaseService.savePDF(pdf);
      console.log('💾 PDF saved to database');
      // Reload PDFs to ensure sync
      const pdfs = await DatabaseService.getPDFs();
      setProcessedPDFs(pdfs);
    } catch (error) {
      console.error('Failed to save PDF to database:', error);
      toast.error('Failed to save PDF to database');
    }
  };

  const deletePDF = async (pdfId: string) => {
    setProcessedPDFs(prev => prev.filter(pdf => pdf.id !== pdfId));
    
    // Delete from database
    try {
      await DatabaseService.deletePDF(pdfId);
      toast.success('PDF deleted successfully!');
    } catch (error) {
      console.error('Failed to delete PDF from database:', error);
      toast.error('Failed to delete PDF from database');
    }
  };

  const viewAnalysis = (item: NewsArticle | ProcessedPDF) => {
    setSelectedItem(item);
    setViewMode('analysis');
  };

  const handleNavigate = (section: 'dashboard' | 'news' | 'pdf' | 'bookmarks') => {
    if (section === 'bookmarks') {
      setViewMode('dashboard');
      // Could add a bookmarks filter here
    } else {
      setViewMode(section);
    }
  };

  const bookmarkedArticles = articles.filter(a => a.bookmarked);
  const bookmarkedPDFs = processedPDFs.filter(p => p.bookmarked);

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    UserManager.setCurrentUser(user);
  };

  const handleLogout = () => {
    UserManager.logout();
    setCurrentUser(null);
    setArticles([]);
    setProcessedPDFs([]);
    setViewMode('dashboard');
  };

  // Show user authentication if no user is logged in
  if (!currentUser) {
    return (
      <>
        <UserAuth 
          language={language}
          onUserLogin={handleUserLogin}
          themeMode={themeMode}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className={themeMode === 'dark' ? 'dark' : themeMode === 'newspaper' ? 'newspaper' : ''}>
      {/* Onboarding for first-time users */}
      <Onboarding 
        language={language}
        onComplete={() => console.log('Onboarding completed')}
        themeMode={themeMode}
      />

      {/* Mobile Menu */}
      <MobileMenu 
        language={language}
        darkMode={themeMode === 'dark'}
        onToggleDarkMode={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        onLanguageChange={setLanguage}
        bookmarkCount={bookmarkedArticles.length + bookmarkedPDFs.length}
        onNavigate={handleNavigate}
        currentSection={viewMode}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className={`min-h-screen transition-colors ${
        themeMode === 'newspaper' 
          ? 'bg-[#f4e8d0]' 
          : 'bg-gray-50 dark:bg-gray-900'
      }`}>
        <Header
          language={language}
          setLanguage={setLanguage}
          darkMode={themeMode === 'dark'}
          setDarkMode={(dark) => setThemeMode(dark ? 'dark' : 'light')}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        
        <div className="flex">
          <Sidebar
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            language={language}
            themeMode={themeMode}
          />
          
          <main className="flex-1 p-4 sm:p-6 w-full min-w-0">
            {viewMode === 'dashboard' && (
              <Dashboard
                articles={articles}
                processedPDFs={processedPDFs}
                language={language}
                onViewAnalysis={viewAnalysis}
                onToggleBookmark={toggleBookmark}
                onTogglePDFBookmark={togglePDFBookmark}
                themeMode={themeMode}
              />
            )}
            
            {viewMode === 'news' && (
              <NewsAggregator
                language={language}
                selectedTopics={selectedTopics}
                analysisDepth="advanced"
                onArticlesLoaded={addArticles}
                articles={articles}
                onToggleBookmark={toggleBookmark}
                onViewAnalysis={viewAnalysis}
                themeMode={themeMode}
              />
            )}
            
            {viewMode === 'pdf' && (
              <PDFProcessor
                language={language}
                analysisDepth="advanced"
                onPDFProcessed={addProcessedPDF}
                processedPDFs={processedPDFs}
                onViewAnalysis={viewAnalysis}
                onDeletePDF={deletePDF}
                onToggleBookmark={togglePDFBookmark}
                themeMode={themeMode}
              />
            )}
            
            {viewMode === 'analysis' && selectedItem && (
              <AnalysisViewer
                item={selectedItem}
                language={language}
                onBack={() => setViewMode('dashboard')}
                themeMode={themeMode}
              />
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;