import { useState } from 'react';
import { NewsAggregator } from './components/NewsAggregator';
import { PDFProcessor } from './components/PDFProcessor';
import { AnalysisViewer } from './components/AnalysisViewer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { MobileMenu } from './components/MobileMenu';
import { Toaster, toast } from 'sonner';

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

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(['all']);
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>('basic');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [processedPDFs, setProcessedPDFs] = useState<ProcessedPDF[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsArticle | ProcessedPDF | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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
    if (typeof newArticles === 'function') {
      setArticles(newArticles);
    } else {
      setArticles(prev => [...newArticles, ...prev]);
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
    <div className={darkMode ? 'dark' : ''}>
      {/* Onboarding for first-time users */}
      <Onboarding 
        language={language}
        onComplete={() => console.log('Onboarding completed')}
      />

      {/* Mobile Menu */}
      <MobileMenu 
        language={language}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLanguageChange={setLanguage}
        bookmarkCount={bookmarkedArticles.length}
        onNavigate={handleNavigate}
        currentSection={viewMode}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header
          language={language}
          setLanguage={setLanguage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
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
          />
          
          <main className="flex-1 p-6">
            {viewMode === 'dashboard' && (
              <Dashboard
                articles={articles}
                processedPDFs={processedPDFs}
                language={language}
                onViewAnalysis={viewAnalysis}
                onToggleBookmark={toggleBookmark}
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
              />
            )}
            
            {viewMode === 'analysis' && selectedItem && (
              <AnalysisViewer
                item={selectedItem}
                language={language}
                onBack={() => setViewMode('dashboard')}
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