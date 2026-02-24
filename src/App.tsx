import { useState } from 'react';
import { NewsAggregator } from './components/NewsAggregator';
import { PDFProcessor } from './components/PDFProcessor';
import { AnalysisViewer } from './components/AnalysisViewer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { MobileMenu } from './components/MobileMenu';
import { toast, Toaster } from 'sonner';

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
}

export type ViewMode = 'dashboard' | 'news' | 'pdf' | 'analysis';
export type ThemeMode = 'light' | 'dark' | 'newspaper';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(['all']);
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>('basic');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [processedPDFs, setProcessedPDFs] = useState<ProcessedPDF[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsArticle | ProcessedPDF | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const toggleBookmark = (articleId: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, bookmarked: !article.bookmarked }
          : article
      )
    );
  };

  const addArticles = (newArticles: NewsArticle[] | ((prev: NewsArticle[]) => NewsArticle[])) => {
    console.log('📥 addArticles called with:', typeof newArticles === 'function' ? 'function' : `${newArticles.length} articles`);
    if (typeof newArticles === 'function') {
      setArticles(newArticles);
    } else {
      console.log('✅ Setting articles to:', newArticles.length);
      setArticles(newArticles);
    }
  };

  const addProcessedPDF = (pdf: ProcessedPDF) => {
    setProcessedPDFs(prev => [pdf, ...prev]);
  };

  const deletePDF = (pdfId: string) => {
    setProcessedPDFs(prev => prev.filter(pdf => pdf.id !== pdfId));
    toast.success('PDF deleted successfully!');
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
        bookmarkCount={bookmarkedArticles.length}
        onNavigate={handleNavigate}
        currentSection={viewMode}
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
        />
        
        <div className="flex">
          <Sidebar
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            analysisDepth={analysisDepth}
            setAnalysisDepth={setAnalysisDepth}
            language={language}
            themeMode={themeMode}
          />
          
          <main className="flex-1 p-6">
            {viewMode === 'dashboard' && (
              <Dashboard
                articles={articles}
                processedPDFs={processedPDFs}
                language={language}
                onViewAnalysis={viewAnalysis}
                onToggleBookmark={toggleBookmark}
                themeMode={themeMode}
              />
            )}
            
            {viewMode === 'news' && (
              <NewsAggregator
                language={language}
                selectedTopics={selectedTopics}
                analysisDepth={analysisDepth}
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
                analysisDepth={analysisDepth}
                onPDFProcessed={addProcessedPDF}
                processedPDFs={processedPDFs}
                onViewAnalysis={viewAnalysis}
                onDeletePDF={deletePDF}
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