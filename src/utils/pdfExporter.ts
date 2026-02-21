import jsPDF from 'jspdf';
import { NewsArticle, PDFAnalysis, Language } from '../App';

/**
 * PDF Export Utilities
 * Uses jsPDF to create formatted PDF documents
 */

interface ExportOptions {
  language: Language;
  includeImages?: boolean;
  fontSize?: number;
}

/**
 * Export news articles to PDF
 */
export async function exportNewsToPDF(
  articles: NewsArticle[],
  options: ExportOptions = { language: 'en' }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('News Analysis Report', margin, yPosition);
  yPosition += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Total Articles: ${articles.length}`, margin, yPosition);
  yPosition += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Process each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Article number
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 100, 200);
    doc.text(`${i + 1}. ${article.title}`, margin, yPosition);
    yPosition += 7;

    // Source and date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    const metadata = `${article.source} | ${article.date.toLocaleDateString()} | ${article.topics.join(', ')}`;
    doc.text(metadata, margin, yPosition);
    yPosition += 7;

    // Summary
    if (article.summary) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const summaryLines = doc.splitTextToSize(article.summary, contentWidth);
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5 + 5;
    }

    // Key Takeaways
    if (article.analysis?.keyTakeaways && article.analysis.keyTakeaways.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 150, 0);
      doc.text('Key Takeaways:', margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      article.analysis.keyTakeaways.forEach((takeaway, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        const bulletText = `• ${takeaway}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
        doc.text(lines, margin + 3, yPosition);
        yPosition += lines.length * 5 + 2;
      });
      yPosition += 3;
    }

    // URL
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 100, 200);
    doc.text(`Source: ${article.url}`, margin, yPosition);
    yPosition += 10;

    // Separator
    doc.setDrawColor(220);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  }

  // Save the PDF
  const fileName = `news-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Export PDF analysis to PDF
 */
export async function exportPDFAnalysisToPDF(
  analysis: PDFAnalysis,
  fileName: string,
  options: ExportOptions = { language: 'en' }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const addNewPageIfNeeded = (requiredSpace: number = 20) => {
    if (yPosition > pageHeight - requiredSpace) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addSection = (title: string, content: string[] | string, color: [number, number, number] = [0, 0, 0]) => {
    addNewPageIfNeeded(30);

    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, margin, yPosition);
    yPosition += 7;

    // Section content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        addNewPageIfNeeded();
        const bulletText = `${index + 1}. ${item}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
        doc.text(lines, margin + 3, yPosition);
        yPosition += lines.length * 5 + 3;
      });
    } else {
      const lines = doc.splitTextToSize(content, contentWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 5;
    }

    yPosition += 5;
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 100, 200);
  doc.text('PDF Analysis Report', margin, yPosition);
  yPosition += 10;

  // File name
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text(`Document: ${fileName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Summary
  addSection('Summary', analysis.summary, [0, 100, 0]);

  // Key Takeaways
  if (analysis.keyTakeaways.length > 0) {
    addSection('Key Takeaways', analysis.keyTakeaways, [0, 150, 0]);
  }

  // Exam Relevance
  if (analysis.examRelevance) {
    addSection('Exam Relevance', analysis.examRelevance, [200, 100, 0]);
  }

  // Important Facts
  if (analysis.importantFacts.length > 0) {
    addSection('Important Facts', analysis.importantFacts, [100, 50, 150]);
  }

  // Potential Questions
  if (analysis.potentialQuestions.length > 0) {
    addSection('Potential Exam Questions', analysis.potentialQuestions, [200, 0, 0]);
  }

  // Related Topics
  if (analysis.relatedTopics.length > 0) {
    addNewPageIfNeeded();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 100, 200);
    doc.text('Related Topics', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text(analysis.relatedTopics.join(' • '), margin, yPosition);
    yPosition += 10;
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  const footerText = 'Generated by AI News Analyzer - For competitive exam preparation';
  const footerY = pageHeight - 10;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  const outputFileName = `analysis-${fileName.replace('.pdf', '')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(outputFileName);
}

/**
 * Export single article to PDF
 */
export async function exportArticleToPDF(
  article: NewsArticle,
  options: ExportOptions = { language: 'en' }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  const titleLines = doc.splitTextToSize(article.title, contentWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 7 + 5;

  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text(`${article.source} | ${article.date.toLocaleDateString()}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Topics: ${article.topics.join(', ')}`, margin, yPosition);
  yPosition += 10;

  // Summary
  if (article.summary) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const summaryLines = doc.splitTextToSize(article.summary, contentWidth);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 6 + 8;
  }

  // Key Takeaways
  if (article.analysis?.keyTakeaways && article.analysis.keyTakeaways.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 0);
    doc.text('Key Takeaways', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    article.analysis.keyTakeaways.forEach((takeaway) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      const bulletText = `• ${takeaway}`;
      const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
      doc.text(lines, margin + 3, yPosition);
      yPosition += lines.length * 5 + 3;
    });
    yPosition += 5;
  }

  // Content
  if (article.content) {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Full Content', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contentLines = doc.splitTextToSize(article.content.substring(0, 3000), contentWidth);
    
    contentLines.forEach((line: string) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
  }

  // Save
  const fileName = `article-${article.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Export bookmarked articles to PDF
 */
export async function exportBookmarksToPDF(
  articles: NewsArticle[],
  options: ExportOptions = { language: 'en' }
): Promise<void> {
  const bookmarked = articles.filter(a => a.bookmarked);
  
  if (bookmarked.length === 0) {
    throw new Error('No bookmarked articles to export');
  }

  await exportNewsToPDF(bookmarked, options);
}
