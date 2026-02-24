import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker - using correct version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

export interface PDFParseResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
  };
}

/**
 * Extracts text from a PDF file with high accuracy using pdf.js
 */
export async function extractTextFromPDF(file: File): Promise<PDFParseResult> {
  try {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate ArrayBuffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('File is empty or corrupted.');
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    
    if (pageCount === 0) {
      throw new Error('PDF has no pages.');
    }
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any;
    
    return {
      text: fullText.trim(),
      pageCount,
      metadata: {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        keywords: info?.Keywords || undefined,
        creationDate: info?.CreationDate ? new Date(info.CreationDate) : undefined,
      }
    };
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('Invalid PDF structure. The file may be corrupted.');
    }
    if (error.message?.includes('password')) {
      throw new Error('PDF is password protected. Please unlock it first.');
    }
    
    throw new Error(error.message || 'Failed to parse PDF file. Please ensure the file is a valid PDF.');
  }
}

/**
 * Analyzes PDF content structure and quality
 */
export function analyzePDFContent(text: string): {
  wordCount: number;
  hasStructure: boolean;
  estimatedReadingTime: number;
  sections: string[];
} {
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  // Detect common section headers
  const sectionPatterns = [
    /^(chapter|section|part)\s+\d+/im,
    /^(introduction|conclusion|abstract|summary)/im,
    /^[A-Z\s]{10,}$/m // All caps headers
  ];
  
  const hasStructure = sectionPatterns.some(pattern => pattern.test(text));
  
  // Extract potential sections
  const lines = text.split('\n');
  const sections = lines
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 5 && 
             trimmed.length < 100 && 
             /^[A-Z]/.test(trimmed);
    })
    .slice(0, 10); // Limit to first 10 potential sections
  
  return {
    wordCount,
    hasStructure,
    estimatedReadingTime,
    sections
  };
}
