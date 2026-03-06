import { Language } from '../App';

const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.warn('Translation API returned error:', res.status);
      return text;
    }
    
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const translateNewsContent = async (title: string, content: string, targetLang: Language) => {
  if (targetLang === 'en') return { title, content };
  
  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      translateText(title, targetLang),
      translateText(content.substring(0, 1000), targetLang) // Limit to 1000 chars for speed
    ]);
    
    if (translatedTitle && translatedTitle !== title) {
      return { title: translatedTitle, content: translatedContent };
    }
    return { title, content };
  } catch (error) {
    return { title, content };
  }
};

export const translateArticles = async (articles: any[], targetLang: Language) => {
  if (targetLang === 'en') return articles;

  const batches = chunk(articles, 10);
  
  for (const batch of batches) {
    await Promise.all(batch.map(async (article) => {
      if (!article.translations?.[targetLang]) {
        article.translations = article.translations || {};
        article.translations[targetLang] = {
          title: await translateText(article.title, targetLang),
          summary: article.analysis?.summary ? await translateText(article.analysis.summary, targetLang) : null
        };
      }
    }));
  }
  
  return articles;
};

export const translatePDFs = async (pdfs: any[], targetLang: Language) => {
  if (targetLang === 'en') return pdfs;

  const batches = chunk(pdfs, 10);
  
  for (const batch of batches) {
    await Promise.all(batch.map(async (pdf) => {
      if (!pdf.translations?.[targetLang]) {
        pdf.translations = pdf.translations || {};
        pdf.translations[targetLang] = {
          name: await translateText(pdf.name, targetLang),
          summary: pdf.analysis?.summary ? await translateText(pdf.analysis.summary, targetLang) : null
        };
      }
    }));
  }
  
  return pdfs;
};

export const getTranslatedText = (item: any, field: string, language: Language): string => {
  if (language === 'en') return item[field];
  return item.translations?.[language]?.[field] || item[field];
};
