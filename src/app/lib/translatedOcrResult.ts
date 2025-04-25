import { SourceFileData, OcrResult } from '../interface/file';

export const translatedOcrResult = async (
  selectedFile: SourceFileData,
  setProgress: (progress: number) => void
): Promise<SourceFileData> => {
  const translatedResults: OcrResult[] = [];

  const ocrItems = selectedFile.ocrResult ?? [];
  const targetLang = selectedFile.outputLanguage || 'en';

  for (let i = 0; i < ocrItems.length; i++) {
    const item = ocrItems[i];

    if (!item.extractedText) continue;

    const parsedExtracted = JSON.parse(item.extractedText);
    const originalText = parsedExtracted.natural_text ?? '';

    let translatedText = '';
    // try {
    //   const res = await fetch('/api/translate', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ originalText, source: sourceLang, target: targetLang }),
    //   });
    
    //   if (!res.ok) throw new Error('Translation failed');
    
    //   const data = await res.json();
    //   translatedText = data.translatedText

    // } catch (err) {
    //   console.error(`Translation failed on page ${item.page}:`, err);
    //   translatedText = originalText; // fallback to original
    // }
    translatedText = originalText;

    const translatedTextString = JSON.stringify({
      primary_language: targetLang,
      is_rotation_valid: true,
      rotation_correction: 0,
      is_table: false,
      is_diagram: false,
      natural_text: translatedText,
    });

    translatedResults.push({
      ...item,
      translateText: translatedTextString,
    });

    setProgress((i + 1) / ocrItems.length);
  }

  return {
    ...selectedFile,
    ocrResult: translatedResults,
  };
};
