import jsPDF from 'jspdf';
import { NewsArticle, Language } from '../App';

interface ExportOptions {
  language: Language;
}

function escapeText(text: string): string {
  return text.replace(/[^\x00-\x7F]/g, (char) => {
    const code = char.charCodeAt(0);
    return code < 256 ? char : `\\u${code.toString(16).padStart(4, '0')}`;
  });
}

export async function exportNewsToPDF(
  articles: NewsArticle[],
  options: ExportOptions = { language: 'en' }
): Promise<void> {
  const doc = new jsPDF();
  let y = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  doc.setFontSize(16);
  doc.text('News Analysis Report', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Total Articles: ${articles.length}`, margin, y);
  y += 10;

  articles.forEach((article, i) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const title = `${i + 1}. ${article.title}`;
    const titleLines = doc.splitTextToSize(title, 170);
    doc.text(titleLines, margin, y);
    y += titleLines.length * lineHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const source = `${typeof article.source === 'string' ? article.source : article.source.name} | ${article.date.toLocaleDateString()}`;
    doc.text(source, margin, y);
    y += 6;

    if (article.summary) {
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(article.summary, 170);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5;
    }

    if (article.analysis?.keyTakeaways?.length) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Key Takeaways:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      article.analysis.keyTakeaways.forEach(takeaway => {
        const lines = doc.splitTextToSize(`• ${takeaway}`, 165);
        if (y + lines.length * 5 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines, margin + 5, y);
        y += lines.length * 5;
      });
    }

    y += 8;
  });

  doc.save(`news-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportPDFAnalysisToPDF(analysis: any, fileName: string): Promise<void> {
  const doc = new jsPDF();
  let y = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 6;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Analysis: ${fileName}`, margin, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(analysis.summary, 170);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * lineHeight + 5;

  if (analysis.keyTakeaways?.length) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Key Takeaways', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    analysis.keyTakeaways.forEach((t: string) => {
      const lines = doc.splitTextToSize(`• ${t}`, 165);
      if (y + lines.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin + 5, y);
      y += lines.length * lineHeight;
    });
    y += 5;
  }

  if (analysis.importantFacts?.length) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Important Facts', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    analysis.importantFacts.forEach((f: string) => {
      const lines = doc.splitTextToSize(`• ${f}`, 165);
      if (y + lines.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin + 5, y);
      y += lines.length * lineHeight;
    });
  }

  doc.save(`analysis-${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export const exportArticleToPDF = exportNewsToPDF;
export const exportBookmarksToPDF = exportNewsToPDF;
